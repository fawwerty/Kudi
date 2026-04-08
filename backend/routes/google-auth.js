/**
 * Kudi — Google OAuth Route
 * POST /api/auth/google  → Verify Google ID token, create/login user, return JWT
 */
const express  = require("express");
const { OAuth2Client } = require("google-auth-library");
const jwt      = require("jsonwebtoken");
const router   = express.Router();
const User     = require("../models/User");
const Account  = require("../models/Account");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signTokens(userId, role) {
  const payload = { sub: userId, role };
  return {
    accessToken:  jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: "15m" }),
    refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'secret', { expiresIn: "7d" }),
  };
}

// POST /api/auth/google — login or register via Google
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "Google credential required." });

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) return res.status(400).json({ error: "Could not get email from Google account." });

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      // Auto-register via Google
      user = new User({
        name: name || email.split("@")[0],
        email: email.toLowerCase().trim(),
        role: "customer",
        googleId,
        picture,
      });
      await user.save();
      
      // Create default account
      const newAccount = new Account({
        userId: user._id,
        type: "checking",
        balance: 0,
        currency: "GHS",
      });
      await newAccount.save();
    } else {
      // Link Google ID if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture  = picture;
        await user.save();
      }
    }

    const { accessToken, refreshToken } = signTokens(user._id, user.role);
    
    // Note: If you want to track active sessions across devices, 
    // you would save the refreshToken to a database or shared cache.
    
    const account = await Account.findOne({ userId: user._id });

    res.json({
      accessToken, refreshToken,
      user: {
        id: user._id, name: user.name, email: user.email,
        phone: user.phone || "", role: user.role,
        picture: user.picture || picture || null,
        balance: account?.balance || 0, currency: account?.currency || "GHS",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err.message);
    res.status(401).json({ error: "Google authentication failed. Please try again." });
  }
});

// POST /api/auth/google/verify-transaction
// Used to verify a high-value transaction using Google re-authentication
router.post("/google/verify-transaction", async (req, res) => {
  try {
    const { credential, transactionId, amount } = req.body;
    if (!credential) return res.status(400).json({ error: "Google credential required for verification." });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Token must be fresh (issued within last 5 minutes)
    const issuedAt = payload.iat * 1000;
    if (Date.now() - issuedAt > 5 * 60 * 1000) {
      return res.status(401).json({ error: "Google verification expired. Please re-authenticate." });
    }

    res.json({
      verified: true,
      email: payload.email,
      transactionId,
      amount,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(401).json({ error: "Google transaction verification failed.", verified: false });
  }
});

module.exports = router;
