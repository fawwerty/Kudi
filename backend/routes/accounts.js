const express = require("express");
const router  = express.Router();
const requireAuth = require("../middleware/requireAuth");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

router.get("/", requireAuth, async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.userId });
    res.json({ accounts });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.userId });
    if (!account) return res.status(404).json({ error: "Account not found." });
    
    const txns = await Transaction.find({ accountId: account._id }).sort({ createdAt: -1 }).limit(10);
    res.json({ account, recentTransactions: txns });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch account details" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { type = "savings" } = req.body;
    const allowed = ["checking", "savings", "business"];
    if (!allowed.includes(type))
      return res.status(400).json({ error: `Account type must be one of: ${allowed.join(", ")}` });
      
    const account = new Account({
      userId: req.userId,
      type,
      balance: 0,
      currency: "GHS"
    });
    await account.save();
    
    res.status(201).json({ account });
  } catch (err) {
    res.status(500).json({ error: "Failed to create account" });
  }
});

module.exports = router;
