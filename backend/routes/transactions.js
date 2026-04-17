const mongoose = require("mongoose");
const express  = require("express");
const axios    = require("axios");
const { v4: uuidv4 } = require("uuid");
const router   = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const LedgerEntry = require("../models/LedgerEntry");
const User = require("../models/User");
const paystack = require("../lib/paystack");
const { recordTransfer } = require("../utils/ledgerHelper");

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

    // Create a "pending" transaction record (No ledger entry yet for deposit)
    const tx = new Transaction({
      userId: req.userId,
      type: "DEPOSIT",
      category: "Deposit",
      description: `PENDING: ${description}`,
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
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const account = await Account.findOne({ userId: tx.userId }).session(session);
        const balanceBefore = account.balance;
        account.balance += tx.amount;
        const balanceAfter = account.balance;
        await account.save({ session });

        tx.status = "completed";
        tx.description = tx.description.replace("PENDING: ", "");
        await tx.save({ session });

        // Ledger Entry for Deposit
        await new LedgerEntry({
          transactionId: tx._id,
          walletId: account._id,
          type: 'CREDIT',
          amount: tx.amount,
          balanceBefore,
          balanceAfter,
          description: `Deposit via Paystack: ${tx.description}`,
          entryGroup: uuidv4()
        }).save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.json({ status: "success", newBalance: account.balance, transaction: tx });
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
      }
    }

    res.json({ status: payData.status, message: "Transaction not successful yet." });
  } catch (err) {
    res.status(500).json({ error: "Verification failed." });
  }
});

router.post("/withdraw", requireAuth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { amount, bankCode, accountNumber, accountName, description = "Withdrawal" } = req.body;
      const amt = parseFloat(amount);
      if (!amt || amt <= 0) return res.status(400).json({ error: "Amount must be greater than 0." });

      // 1. Debit local account and update Ledger
      const tx = await recordTransfer({
        senderId: req.userId,
        amount: amt,
        type: "WITHDRAWAL",
        reference: `WD-${uuidv4().split('-')[0]}`,
        description: `PENDING Withdrawal to ${accountNumber}`,
        session
      });
      tx.status = "processing";
      await tx.save({ session });

      // 2. Prep Paystack
      const recipient = await paystack.createTransferRecipient(
        accountName || "User Withdrawal",
        accountNumber,
        bankCode
      );

      // 3. Initiate Transfer
      const transfer = await paystack.initiateTransfer(amt, recipient.recipient_code, description);
      tx.paystackReference = transfer.reference;
      tx.reference = transfer.reference; // Use Paystack reference for tracking
      await tx.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({ transaction: tx });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error("Withdrawal error:", err);
      res.status(422).json({ error: err.message || "Withdrawal failed." });
    }
});

router.post("/transfer", requireAuth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { recipientEmail, recipientPhone, amount, note } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: "Amount must be greater than 0." });
    if (!recipientEmail && !recipientPhone) return res.status(400).json({ error: "Recipient is required." });

    const recipient = recipientEmail 
      ? await User.findOne({ email: recipientEmail.toLowerCase() }).session(session)
      : await User.findOne({ phone: recipientPhone }).session(session);
    
    if (!recipient) throw new Error("Recipient not found in Kudi system.");
    if (recipient._id.toString() === req.userId) throw new Error("Cannot transfer to yourself.");

    const sender = await User.findById(req.userId).session(session);

    // AI Fraud Check
    const fr = await fraudCheck(amt, "Transfer", "Expense");
    if (fr.risk_level === "HIGH") throw new Error("Transfer blocked: High risk detected.");

    const tx = await recordTransfer({
      senderId: req.userId,
      recipientId: recipient._id,
      amount: amt,
      type: "TRANSFER",
      reference: `XFER-${uuidv4().split('-')[0]}`,
      description: `${note ? note + " — " : ""}To ${recipient.email || recipient.phone}`,
      session
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ transaction: tx, fraudCheck: fr });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message || "Transfer failed." });
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
      type: "DEPOSIT",
      category: "Mobile Money",
      description: `PENDING: ${provider.toUpperCase()} MoMo Deposit`,
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { amount, billType, reference, provider } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: "Amount must be greater than 0." });

    const tx = await recordTransfer({
      senderId: req.userId,
      amount: amt,
      type: "BILL_PAY",
      reference: `BILL-${uuidv4().split('-')[0]}`,
      description: `${billType} Payment (Ref: ${reference})`,
      session
    });

    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({ transaction: tx, message: `${billType} bill paid successfully` });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message || "Bill payment failed." });
  }
});

module.exports = router;

