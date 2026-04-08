const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ error: "Missing or invalid authorization header." });

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.userId = payload.sub;
    req.role   = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: "Token expired or invalid. Please sign in again." });
  }
};
