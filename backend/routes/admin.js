const express = require("express");
const router  = express.Router();
const requireAuth = require("../middleware/requireAuth");
const User = require("../models/User");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

function adminOnly(req, res, next) {
  if (req.role !== "admin") return res.status(403).json({ error: "Admin access required." });
  next();
}

router.use(requireAuth, adminOnly);

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, '-hashedPw');
    const total = await User.countDocuments();
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAccounts = await Account.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    
    // Aggregations for totals
    const depositAgg = await Transaction.aggregate([
      { $match: { type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const withdrawAgg = await Transaction.aggregate([
      { $match: { type: "expense" } },
      { $group: { _id: null, total: { $sum: { $abs: "$amount" } } } }
    ]);
    
    const totalDeposited = depositAgg.length > 0 ? depositAgg[0].total : 0;
    const totalWithdrawn = withdrawAgg.length > 0 ? withdrawAgg[0].total : 0;
    
    res.json({
      totalUsers,
      totalAccounts,
      totalTransactions,
      totalDeposited: parseFloat(totalDeposited.toFixed(2)),
      totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
      activeSessions: 0, // Mocked as we no longer have a global set
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/audit-logs", async (req, res) => {
  try {
    const logs = await Transaction.find().sort({ createdAt: -1 }).limit(100);
    const total = await Transaction.countDocuments();
    res.json({ logs, total });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ["customer","teller","admin","business"];
    if (!allowed.includes(role)) return res.status(400).json({ error: "Invalid role." });
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    
    user.role = role;
    await user.save();
    
    res.json({ message: `Role updated to ${role}.`, user: { id:user._id, name:user.name, role:user.role } });
  } catch (err) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

module.exports = router;
