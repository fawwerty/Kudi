const express  = require("express");
const axios    = require("axios");
const router   = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const paystack = require("../lib/paystack");

const AI_URL = () => process.env.AI_API_URL || "http://localhost:8001";

async function fraudCheck(amount, category, type = "Expense") {
  try {
    const res = await axios.post(`${AI_URL()}/fraud/detect`, {
      amount, category, transaction_type: type,
      day_of_week:  new Date().getDay(),
      day_of_month: new Date().getDate(),
      month_num:    new Date().getMonth() + 1,
    }, { timeout: 4000 });
    return res.data;
  } catch {
    return { risk_level: "LOW", fraud_score: 0, is_suspicious: false };
  }
}

// Get list of banks for UI dropdowns
router.get("/banks", requireAuth, async (req, res) => {
  try {
    const banks = await paystack.getBanks();
    res.json(banks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bank list." });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category } = req.query;
    const query = { userId: req.userId };
    if (type) query.type = type;
    if (category) query.category = category;

    const limitInt = parseInt(limit);
    const skip = (parseInt(page) - 1) * limitInt;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitInt)
        .lean()
        .select("-__v"),
      Transaction.countDocuments(query),
    ]);

    res.json({
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limitInt),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
});

/**
 * INITIALIZE DEPOSIT (Real-time Paystack)
 */
router.post("/deposit", requireAuth, async (req, res) => {
  try {
    const { amount, description = "Account Deposit" } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: "Amount must be greater than 0." });
    
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    // AI Fraud Check before initializing
    const fr = await fraudCheck(amt, "Deposit", "Income");
    if (fr.risk_level === "HIGH")
      return res.status(422).json({ error: "Transaction flagged as high-risk. Verify your identity.", fraudScore: fr.fraud_score });

    // Initialize Paystack Transaction
    const payData = await paystack.initializeTransaction(user.email, amt, {
      userId: req.userId,
      description,
      type: "deposit"
    });

    // Create a "pending" transaction record
    const tx = new Transaction({
      userId: req.userId,
      type: "income",
      category: "Deposit",
      description: `Pending: ${description}`,
      amount: amt,
      status: "pending",
      reference: payData.reference
    });
    await tx.save();

    res.status(201).json({ 
      checkoutUrl: payData.authorization_url, 
      reference: payData.reference,
      fraudCheck: fr 
    });
  } catch (err) {
    console.error("Deposit init error:", err);
    res.status(500).json({ error: "Deposit initialization failed." });
  }
});

/**
 * VERIFY DEPOSIT (Manual/Callback)
 */
router.get("/verify/:reference", requireAuth, async (req, res) => {
  try {
    const { reference } = req.params;
    
    // Check if already processed
    let tx = await Transaction.findOne({ reference });
    if (!tx) return res.status(404).json({ error: "Transaction reference not found." });
    if (tx.status === "completed") return res.json({ status: "completed", transaction: tx });

    const payData = await paystack.verifyTransaction(reference);
    
    if (payData.status === "success") {
      // Atomic balance update
      const account = await Account.findOneAndUpdate(
        { userId: tx.userId },
        { $inc: { balance: tx.amount } },
        { new: true }
      );

      tx.status = "completed";
      tx.balance = account.balance;
      tx.description = tx.description.replace("Pending: ", "");
      await tx.save();

      return res.json({ status: "success", newBalance: account.balance, transaction: tx });
    }

    res.json({ status: payData.status, message: "Transaction not successful yet." });
  } catch (err) {
    res.status(500).json({ error: "Verification failed." });
  }
});

/**
 * WITHDRAW (Real-time Paystack Transfer)
 */
router.post("/withdraw", requireAuth, async (req, res) => {
  try {
    const { amount, bankCode, accountNumber, accountName, description = "Withdrawal" } = req.body;
    const amt = parseFloat(amount);
    
    if (!amt || amt <= 0) return res.status(400).json({ error: "Amount must be greater than 0." });
    if (!bankCode || !accountNumber) return res.status(400).json({ error: "Bank and Account Number are required." });

    // 1. Debit local account first (Atomic)
    const account = await Account.findOneAndUpdate(
      { userId: req.userId, balance: { $gte: amt } },
      { $inc: { balance: -amt } },
      { new: true }
    );

    if (!account) return res.status(400).json({ error: "Insufficient funds or account not found." });

    try {
      // 2. Create Paystack Recipient
      const recipient = await paystack.createTransferRecipient(
        accountName || "User Withdrawal",
        accountNumber,
        bankCode
      );

      // 3. Initiate Transfer
      const transfer = await paystack.initiateTransfer(amt, recipient.recipient_code, description);

      const tx = new Transaction({
        userId: req.userId,
        accountId: account._id,
        type: "expense",
        category: "Withdrawal",
        description: `${description} to ${accountNumber}`,
        amount: -amt,
        balance: account.balance,
        status: "completed", // Or "processing" if you want to handle webhooks
        reference: transfer.reference
      });
      await tx.save();

      res.status(201).json({ transaction: tx, newBalance: account.balance });
    } catch (payErr) {
      // Rollback on failure
      await Account.updateOne({ userId: req.userId }, { $inc: { balance: amt } });
      res.status(422).json({ error: payErr.message || "Paystack transfer failed. Funds rollbacked." });
    }
  } catch (err) {
    res.status(500).json({ error: "Withdrawal failed." });
  }
});

router.post("/transfer", requireAuth, async (req, res) => {
  try {
    const { recipientEmail, recipientPhone, amount, description = "Transfer", note } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: "Amount must be greater than 0." });
    if (!recipientEmail && !recipientPhone) return res.status(400).json({ error: "Recipient (Email or Phone) is required." });

    const senderAccount = await Account.findOneAndUpdate(
      { userId: req.userId, balance: { $gte: amt } },
      { $inc: { balance: -amt } },
      { new: true }
    );

    if (!senderAccount) {
       const existingAccount = await Account.findOne({ userId: req.userId });
       if (!existingAccount) return res.status(404).json({ error: "Sender account not found." });
       return res.status(400).json({ error: "Insufficient funds." });
    }

    const fr = await fraudCheck(amt, "Transfer", "Expense");
    if (fr.risk_level === "HIGH") {
      await Account.updateOne({ userId: req.userId }, { $inc: { balance: amt } });
      return res.status(422).json({ error: "Transfer blocked by fraud detection. Funds rollbacked.", fraudScore: fr.fraud_score });
    }

    const sender = await User.findById(req.userId);
    const desc = `${note ? note + " — " : ""}Transfer to ${recipientEmail || recipientPhone}`;

    const tx = new Transaction({
      userId: req.userId,
      accountId: senderAccount._id,
      type: "expense",
      category: "Transfer",
      description: desc,
      amount: -amt,
      balance: senderAccount.balance,
      status: "completed"
    });
    await tx.save();

    const recipient = recipientEmail 
      ? await User.findOne({ email: recipientEmail.toLowerCase() })
      : await User.findOne({ phone: recipientPhone });
    
    if (recipient && recipient._id.toString() === req.userId) {
       await Account.updateOne({ userId: req.userId }, { $inc: { balance: amt } });
       return res.status(400).json({ error: "Cannot transfer funds to your own primary account." });
    }

    if (recipient) {
      const recipientAcct = await Account.findOneAndUpdate(
        { userId: recipient._id },
        { $inc: { balance: amt } },
        { new: true }
      );

      if (recipientAcct) {
        await new Transaction({
          userId: recipient._id,
          accountId: recipientAcct._id,
          type: "income",
          category: "Transfer",
          description: `Transfer from ${sender?.email || "Kudi User"}`,
          amount: amt,
          balance: recipientAcct.balance,
          status: "completed"
        }).save();
      }
    }

    res.status(201).json({ transaction: tx, newBalance: senderAccount.balance, fraudCheck: fr });
  } catch (err) {
    res.status(500).json({ error: "Transfer failed." });
  }
});

router.post("/momo/deposit", requireAuth, async (req, res) => {
  // Use same logic as /deposit but with MoMo specific metadata if needed
  // For simplicity, we redirect to Paystack which handles MoMo channels
  try {
    const { amount, phone, provider = "mtn", description } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: "Amount must be greater than 0." });
    
    const user = await User.findById(req.userId);
    const payData = await paystack.initializeTransaction(user.email, amt, {
      userId: req.userId,
      phone,
      provider,
      type: "momo_deposit"
    });

    await new Transaction({
      userId: req.userId,
      type: "income",
      category: "Mobile Money",
      description: `Pending: ${provider.toUpperCase()} MoMo Deposit`,
      amount: amt,
      status: "pending",
      reference: payData.reference
    }).save();

    res.status(201).json({ checkoutUrl: payData.authorization_url, reference: payData.reference });
  } catch (err) {
    res.status(500).json({ error: "MoMo deposit failed." });
  }
});

router.post("/bill-pay", requireAuth, async (req, res) => {
  try {
    const { amount, billType, reference, provider } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: "Amount must be greater than 0." });

    const account = await Account.findOneAndUpdate(
      { userId: req.userId, balance: { $gte: amt } },
      { $inc: { balance: -amt } },
      { new: true }
    );

    if (!account) return res.status(400).json({ error: "Insufficient funds or account not found." });
    
    const tx = new Transaction({
      userId: req.userId,
      accountId: account._id,
      type: "expense",
      category: "Utilities",
      description: `Bill Payment — ${billType} (Ref: ${reference})`,
      amount: -amt,
      balance: account.balance,
      status: "completed"
    });
    await tx.save();
    
    res.status(201).json({ transaction: tx, newBalance: account.balance, message:`${billType} bill paid successfully` });
  } catch (err) {
    res.status(500).json({ error: "Bill payment failed." });
  }
});

module.exports = router;

