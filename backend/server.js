require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const rateLimit    = require("express-rate-limit");
const axios        = require("axios");

const app  = express();
const PORT = process.env.PORT || 5000;

// Environment validation
if (!process.env.PAYSTACK_SECRET_KEY && process.env.NODE_ENV === "production") {
  console.warn("⚠️  WARNING: PAYSTACK_SECRET_KEY is missing. Paystack integrations will NOT work.");
} else if (!process.env.PAYSTACK_SECRET_KEY) {
  console.warn("ℹ️  INFO: PAYSTACK_SECRET_KEY is missing from .env. Using fallback/mock for development.");
}

// Security & Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disable dynamic CSP which can block API calls
}));
app.use(cors({ 
  origin: true, // Allow any origin during setup, or use dynamic reflecting
  credentials: true 
}));
app.use(express.json({ limit:"50kb" }));
app.use(express.urlencoded({ extended:true }));

app.use("/api/auth/login",    rateLimit({ windowMs:15*60*1000, max:10, message:{error:"Too many attempts."} }));
app.use("/api/auth/register", rateLimit({ windowMs:60*60*1000, max:5,  message:{error:"Too many registrations."} }));
app.use("/api/",              rateLimit({ windowMs:60*1000,    max:120, message:{error:"Too many requests."} }));

app.use("/api/auth",         require("./routes/auth"));
app.use("/api/auth",         require("./routes/google-auth"));
app.use("/api/accounts",     require("./routes/accounts"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/admin",        require("./routes/admin"));

const requireAuth = require("./middleware/requireAuth");
const AI_URL = () => process.env.AI_API_URL || "http://localhost:8001";

const proxyAI = (method, path) => async (req, res) => {
  try {
    const r = method==="GET"
      ? await axios.get(`${AI_URL()}${path}`, {timeout:8000})
      : await axios.post(`${AI_URL()}${path}`, req.body, {timeout:8000});
    res.json(r.data);
  } catch(err) {
    res.status(err.response?.status||503).json({ error:"AI service unavailable.", details:err.message });
  }
};

app.get ("/api/ai/analytics",          requireAuth, proxyAI("GET",  "/analytics/full"));
app.get ("/api/ai/insights",           requireAuth, proxyAI("GET",  "/analytics/insights"));
app.get ("/api/ai/cashflow",           requireAuth, proxyAI("GET",  "/analytics/cashflow"));
app.post("/api/ai/fraud/detect",       requireAuth, proxyAI("POST", "/fraud/detect"));
app.post("/api/ai/fraud/batch",        requireAuth, proxyAI("POST", "/fraud/batch"));
app.post("/api/ai/advisor/categorize", requireAuth, proxyAI("POST", "/advisor/categorize"));
app.post("/api/ai/advisor/analyze",    requireAuth, proxyAI("POST", "/advisor/analyze"));
app.get ("/api/ai/health",                          proxyAI("GET",  "/health"));

app.post("/api/webhooks/paystack", express.raw({type:"application/json"}), (req, res) => {
  const event = JSON.parse(req.body);
  console.log("Paystack event:", event.event);
  res.sendStatus(200);
});

app.get("/health", (_, res) => res.json({ status:"healthy", version:"2.0.0", timestamp:new Date().toISOString() }));
app.get("/",       (_, res) => res.json({ service:"Kudi API", version:"2.0.0" }));
app.use("*",       (_, res) => res.status(404).json({ error:"Route not found." }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error:"Internal server error." }); });

require("./config/db")();

app.listen(PORT, () => {
  const os = require("os");
  const nets = os.networkInterfaces();
  let localIp = "localhost";
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        localIp = net.address;
        break;
      }
    }
  }

  console.log(`\n🏦  Kudi API   →  http://localhost:${PORT}`);
  console.log(`📡  Local IP   →  http://${localIp}:${PORT}`);
  console.log(`🤖  AI endpoint  →  ${process.env.AI_API_URL||"http://localhost:8001"}`);
  console.log(`🌍  Env          →  ${process.env.NODE_ENV||"development"}\n`);
});

module.exports = app;
// Trigger hot-reload after .env update
