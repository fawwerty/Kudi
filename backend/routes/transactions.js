const express  = require("express");
const axios    = require("axios");
const router   = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

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

router.post("/deposit", requireAuth, async (req, res) => {
  try {
    const { amount, description = "Account Deposit" } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: "Amount must be greater than 0." });
    if (amt > 50000) return res.status(400).json({ error: "Single deposit limit is ₵50,000." });

    const fr = await fraudCheck(amt, "Investment", "Income");
    if (fr.risk_level === "HIGH")
      return res.status(422).json({ error: "Transaction flagged as high-risk by AI. Verify your identity.", fraudScore: fr.fraud_score });

    const account = await Account.findOneAndUpdate(
      { userId: req.userId },
      { $inc: { balance: amt } },
      { new: true }
    );

    if (!account) return res.status(404).json({ error: "Account not found." });

    const tx = new Transaction({
      userId: req.userId,
      accountId: account._id,
      type: "income",
      category: "Deposit",
      description,
      amount: amt,
      balance: account.balance,
      status: "completed"
    });
    await tx.save();

    res.status(201).json({ transaction: tx, newBalance: account.balance, fraudCheck: fr });
  } catch (err) {
    res.status(500).json({ error: "Deposit failed." });
  }
});

router.post("/withdraw", requireAuth, async (req, res) => {
  try {
    const { amount, description = "Withdrawal" } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: "Amount must be greater than 0." });

    const account = await Account.findOneAndUpdate(
      { userId: req.userId, balance: { $gte: amt } },
      { $inc: { balance: -amt } },
      { new: true }
    );

    if (!account) {
      const existingAccount = await Account.findOne({ userId: req.userId });
      if (!existingAccount) return res.status(404).json({ error: "Account not found." });
      return res.status(400).json({ error: "Insufficient funds." });
    }

    const tx = new Transaction({
      userId: req.userId,
      accountId: account._id,
      type: "expense",
      category: "Withdrawal",
      description,
      amount: -amt,
      balance: account.balance,
      status: "completed"
    });
    await tx.save();

    res.status(201).json({ transaction: tx, newBalance: account.balance, fraudCheck: fr });
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
      // Rollback on fraud detection
      await Account.updateOne({ userId: req.userId }, { $inc: { balance: amt } });
      return res.status(422).json({ error: "Transfer blocked by fraud detection. Funds rollbacked.", fraudScore: fr.fraud_score });
    }

    const sender = await User.findById(req.userId);
    const desc = `${note ? note + " — " : ""}Transfer to ${recipientEmail}`;

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
    
    // Fallback search if phone given but user not found
    const finalRecipient = recipient;
    
    // Self-transfer check! High severity hack prevention.
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
  try {
    const { amount, phone, provider = "mtn", description } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: "Amount must be greater than 0." });
    if (!phone) return res.status(400).json({ error: "Phone number required." });

    const PROVIDERS = { mtn:"MTN MoMo", airteltigo:"AirtelTigo Money", telecel:"Telecel Cash" };
    const providerName = PROVIDERS[provider] || "Mobile Money";

    const account = await Account.findOneAndUpdate(
      { userId: req.userId },
      { $inc: { balance: amt } },
      { new: true }
    );

    if (!account) return res.status(404).json({ error: "Account not found." });

    const tx = new Transaction({
      userId: req.userId,
      accountId: account._id,
      type: "income",
      category: "Mobile Money",
      description: description || `${providerName} Deposit from ${phone}`,
      amount: amt,
      balance: account.balance,
      status: "completed"
    });
    await tx.save();
    
    res.status(201).json({ transaction: tx, newBalance: account.balance, provider: providerName, message:`₵${amt} deposited via ${providerName}` });
  } catch (err) {
    res.status(500).json({ error: "Mobile money deposit failed." });
  }
});

router.post("/momo/withdraw", requireAuth, async (req, res) => {
  try {
    const { amount, phone, provider = "mtn" } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: "Amount must be greater than 0." });

    const account = await Account.findOneAndUpdate(
      { userId: req.userId, balance: { $gte: amt } },
      { $inc: { balance: -amt } },
      { new: true }
    );
    
    if (!account) return res.status(400).json({ error: "Insufficient funds or account not found." });
    
    const PROVIDERS = { mtn:"MTN MoMo", airteltigo:"AirtelTigo Money", telecel:"Telecel Cash" };
    
    const tx = new Transaction({
      userId: req.userId,
      accountId: account._id,
      type: "expense",
      category: "Mobile Money",
      description: `${PROVIDERS[provider]||"MoMo"} Withdrawal to ${phone}`,
      amount: -amt,
      balance: account.balance,
      status: "completed"
    });
    await tx.save();
    
    res.status(201).json({ transaction: tx, newBalance: account.balance });
  } catch (err) {
    res.status(500).json({ error: "Mobile money withdrawal failed." });
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

router.post("/bank-transfer", requireAuth, async (req, res) => {
  try {
    const { amount, bankName, accountNumber, accountName, narration } = req.body;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return res.status(400).json({ error: "Amount must be greater than 0." });
    if (!bankName) return res.status(400).json({ error: "Bank name required." });
    if (!accountNumber) return res.status(400).json({ error: "Account number required." });

    const account = await Account.findOneAndUpdate(
      { userId: req.userId, balance: { $gte: amt } },
      { $inc: { balance: -amt } },
      { new: true }
    );

    if (!account) return res.status(400).json({ error: "Insufficient funds or account not found." });

    const fr = await fraudCheck(amt, "Transfer", "Expense");
    if (fr.risk_level === "HIGH") {
      await Account.updateOne({ userId: req.userId }, { $inc: { balance: amt } });
      return res.status(422).json({ error: "Bank transfer blocked by fraud detection. Funds rollbacked.", fraudScore: fr.fraud_score });
    }

    const tx = new Transaction({
      userId: req.userId,
      accountId: account._id,
      type: "expense",
      category: "Bank Transfer",
      description: `${bankName} Transfer to ${accountName} (${accountNumber}) — ${narration || ""}`,
      amount: -amt,
      balance: account.balance,
      status: "completed"
    });
    await tx.save();

    res.status(201).json({ transaction: tx, newBalance: account.balance, message:`₵${amt} transferred to ${bankName}` });
  } catch (err) {
    res.status(500).json({ error: "Bank transfer failed." });
  }
});

module.exports = router;
