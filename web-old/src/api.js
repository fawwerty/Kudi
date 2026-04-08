/**
 * Kudi API Client
 * Centralises all HTTP calls to:
 *   - Node.js backend (API_BASE)   — auth, transactions, accounts
 *   - FastAPI AI backend (AI_BASE) — fraud detection, advisor, analytics
 *
 * Drop this file in src/ and import: import api from './api'
 */

const API_BASE = import.meta?.env?.VITE_API_URL    || "http://localhost:5000/api";
const AI_BASE  = import.meta?.env?.VITE_AI_API_URL || "http://localhost:8001";

// ─── Token Management ─────────────────────────────────────────────────────────
let _accessToken = localStorage.getItem("bankly_access_token") || null;

function setToken(t) {
  _accessToken = t;
  if (t) localStorage.setItem("bankly_access_token", t);
  else    localStorage.removeItem("bankly_access_token");
}

// ─── Core Fetch ───────────────────────────────────────────────────────────────
async function req(base, path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && _accessToken) headers["Authorization"] = `Bearer ${_accessToken}`;

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Try to refresh if 401
  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${_accessToken}`;
      const retry = await fetch(`${base}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
      if (!retry.ok) throw new Error((await retry.json()).error || "Request failed");
      return retry.json();
    }
    setToken(null);
    window.location.href = "/";
    throw new Error("Session expired. Please sign in again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function tryRefresh() {
  const rt = localStorage.getItem("bankly_refresh_token");
  if (!rt) return false;
  try {
    const res  = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    const data = await res.json();
    if (!res.ok) return false;
    setToken(data.accessToken);
    localStorage.setItem("bankly_refresh_token", data.refreshToken);
    return true;
  } catch { return false; }
}

// Convenience wrappers
const apiGet  = (path, opts)      => req(API_BASE, path, { ...opts, method: "GET"  });
const apiPost = (path, body, opts)=> req(API_BASE, path, { ...opts, method: "POST", body });
const aiGet   = (path)            => req(AI_BASE,  path, { auth: false, method: "GET"  });
const aiPost  = (path, body)      => req(AI_BASE,  path, { auth: false, method: "POST", body });

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  register: (data)                  => apiPost("/auth/register", data, { auth: false }),
  login:    async (email, password) => {
    const res = await apiPost("/auth/login", { email, password }, { auth: false });
    setToken(res.accessToken);
    localStorage.setItem("bankly_refresh_token", res.refreshToken);
    return res;
  },
  logout: async () => {
    const rt = localStorage.getItem("bankly_refresh_token");
    try { await apiPost("/auth/logout", { refreshToken: rt }); } catch {}
    setToken(null);
    localStorage.removeItem("bankly_refresh_token");
  },
  me: () => apiGet("/auth/me"),
};

// ─── Accounts ────────────────────────────────────────────────────────────────
export const accounts = {
  list: () => apiGet("/accounts"),
};

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactions = {
  list:     (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiGet(`/transactions${qs ? "?" + qs : ""}`);
  },
  deposit:  (amount, description) => apiPost("/transactions/deposit",  { amount, description }),
  withdraw: (amount, description) => apiPost("/transactions/withdraw", { amount, description }),
  transfer: (recipientEmail, amount, description) =>
    apiPost("/transactions/transfer", { recipientEmail, amount, description }),
};

// ─── AI — Fraud Detection (calls real XGBoost/GradientBoosting model) ─────────
export const fraud = {
  /**
   * Score a single transaction against the trained fraud model.
   * Returns: { fraud_score, risk_level, is_suspicious, z_score, recommendation, model_auc }
   */
  detect: (amount, category, transaction_type = "Expense", day_of_week, day_of_month, month_num) =>
    aiPost("/fraud/detect", {
      amount,
      category,
      transaction_type,
      day_of_week:  day_of_week  ?? new Date().getDay(),
      day_of_month: day_of_month ?? new Date().getDate(),
      month_num:    month_num    ?? new Date().getMonth() + 1,
    }),

  /** Score up to 100 transactions in one call */
  batch: (transactions) => aiPost("/fraud/batch", { transactions }),
};

// ─── AI — Financial Advisor (calls real RandomForest model) ───────────────────
export const advisor = {
  /**
   * Categorize a transaction and get budget comparison + tip.
   */
  categorize: (amount, category, transaction_type = "Expense") =>
    aiPost("/advisor/categorize", { amount, category, transaction_type }),

  /**
   * Full spending analysis for a batch of transactions.
   */
  analyze: (txList) =>
    aiPost("/advisor/analyze", {
      transactions: txList.map((t) => ({
        amount:           t.amount,
        category:         t.category || "Other",
        transaction_type: t.type === "income" ? "Income" : "Expense",
      })),
    }),
};

// ─── AI — Analytics (pre-computed from training data) ─────────────────────────
export const analytics = {
  /** Full 2024 dashboard data */
  full:         () => aiGet("/analytics/full"),
  /** KPI stats */
  summary:      () => aiGet("/analytics/summary"),
  /** Monthly income vs expense */
  cashflow:     () => aiGet("/analytics/cashflow"),
  /** AI-generated insights + category breakdown */
  insights:     () => aiGet("/analytics/insights"),
  /** Recent transactions with fraud flags */
  transactions: () => aiGet("/analytics/transactions"),
};

// ─── AI Health ────────────────────────────────────────────────────────────────
export const aiHealth = () => aiGet("/health");

export default { auth, accounts, transactions, fraud, advisor, analytics, aiHealth };
