const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const router   = express.Router();
const requireAuth = require("../middleware/requireAuth");

const User = require("../models/User");
const Account = require("../models/Account");

const sessions = new Map(); // Simple mock session store for refresh tokens

function signTokens(userId, role) {
  const payload = { sub: userId, role };
  return {
    accessToken:  jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: "15m" }),
    refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'secret', { expiresIn: "7d" }),
  };
}

const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePhone = (p) => /^0\d{9}$/.test(p.replace(/\s/g, ""));

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role = "customer" } = req.body;

    if (!name?.trim() || name.trim().length < 2)
      return res.status(400).json({ error: "Name must be at least 2 characters." });
    if (!validateEmail(email))
      return res.status(400).json({ error: "Invalid email address." });
    if (!validatePhone(phone || ""))
      return res.status(400).json({ error: "Enter a valid Ghana phone number (e.g. 0244123456)." });
    if (!password || password.length < 8)
      return res.status(400).json({ error: "Password must be at least 8 characters." });

    const emailLower = email.toLowerCase().trim();
    const existing = await User.findOne({ email: emailLower });
    if (existing)
      return res.status(409).json({ error: "An account with this email already exists." });

    const hashedPw = await bcrypt.hash(password, 10);
    
    const userRole = ["customer","business","teller","admin"].includes(role) ? role : "customer";
    
    const newUser = new User({
      name: name.trim(),
      email: emailLower,
      phone: phone.trim(),
      role: userRole,
      hashedPw
    });
    const savedUser = await newUser.save();

    const newAccount = new Account({
      userId: savedUser._id,
      type: "checking",
      balance: 0,
      currency: "GHS"
    });
    await newAccount.save();

    res.status(201).json({ message: "Account created successfully. Please sign in." });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(401).json({ error: "No account found with this email address." });

    const match = await bcrypt.compare(password, user.hashedPw);
    if (!match)
      return res.status(401).json({ error: "Incorrect password." });

    // Parallelize token generation and account fetching
    const [tokens, account] = await Promise.all([
      signTokens(user._id, user.role),
      Account.findOne({ userId: user._id })
    ]);

    const { accessToken, refreshToken } = tokens;
    sessions.set(refreshToken, user._id.toString());

    res.json({
      accessToken, refreshToken,
      user: {
        id: user._id, name: user.name, email: user.email,
        phone: user.phone, role: user.role,
        balance: account?.balance || 0,
        currency: account?.currency || "GHS",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !sessions.has(refreshToken))
    return res.status(401).json({ error: "Invalid or expired refresh token." });
  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'secret'
    );
    const tokens = signTokens(payload.sub, payload.role);
    sessions.delete(refreshToken);
    sessions.set(tokens.refreshToken, payload.sub);
    res.json(tokens);
  } catch {
    res.status(401).json({ error: "Refresh token expired. Please sign in again." });
  }
});

router.post("/logout", requireAuth, (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) sessions.delete(refreshToken);
  res.json({ message: "Signed out successfully." });
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const [user, account] = await Promise.all([
      User.findById(req.userId),
      Account.findOne({ userId: req.userId })
    ]);

    if (!user) return res.status(404).json({ error: "User not found." });
    
    res.json({
      id: user._id, name: user.name, email: user.email, phone: user.phone,
      role: user.role, balance: account?.balance || 0, currency: account?.currency || "GHS",
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching user data" });
  }
});

module.exports = router;
