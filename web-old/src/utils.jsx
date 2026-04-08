// Kudi — Shared design tokens, utilities, local auth, transaction store
export const T = {
  bg:"#060614", bgCard:"#0d0b1f", bgHover:"#111028",
  border:"#1e1b3a", borderLight:"#2d2a5e",
  primary:"#6366f1", primaryGlow:"#6366f133",
  success:"#10b981", warning:"#f59e0b", danger:"#ef4444", accent:"#22d3ee",
  txt:"#f1f5f9", txtSub:"#94a3b8", txtMuted:"#475569",
  gradPrimary:"linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
  gradCard:"linear-gradient(145deg,#0f0d22 0%,#0d0b1f 100%)",
};

// ── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ dark } = {}) => (
  <span style={{
    width:17, height:17,
    border: dark ? "2.5px solid #6366f133" : "2.5px solid #fff4",
    borderTopColor: dark ? "#6366f1" : "#fff",
    borderRadius:"50%", animation:"spin .7s linear infinite",
    display:"inline-block", flexShrink:0,
  }}/>
);

// ── Toast ────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
let _toastFn = null;
export const toast = (msg, type="info") => _toastFn?.(msg, type);
export function ToastContainer() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    _toastFn = (msg, type) => {
      const id = Date.now();
      setItems(p => [...p, {id, msg, type}]);
      setTimeout(() => setItems(p => p.filter(t => t.id !== id)), 4500);
    };
  }, []);
  const colors = { success:"#10b981", error:"#ef4444", info:"#6366f1", warning:"#f59e0b" };
  return (
    <div style={{position:"fixed",top:20,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:8,maxWidth:360}}>
      {items.map(t => (
        <div key={t.id} className="si" style={{
          background:`${colors[t.type] || colors.info}15`,
          border:`1px solid ${colors[t.type] || colors.info}40`,
          borderRadius:12, padding:"12px 16px",
          fontSize:13, color:T.txt, display:"flex", gap:8, alignItems:"flex-start",
        }}>
          <span>{t.type==="success"?"✅":t.type==="error"?"🚨":t.type==="warning"?"⚠️":"ℹ️"}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ── Local Auth (fallback when backend offline) ────────────────────────────────
const USERS_KEY = "bankly_users_v1";
const SESSION_KEY = "bankly_session_v1";
export const TXNS_PREFIX = "bankly_txns_";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const LocalAuth = {
  getSession: () => JSON.parse(localStorage.getItem(SESSION_KEY) || "null"),
  saveSession: s  => localStorage.setItem(SESSION_KEY, JSON.stringify(s)),
  clearSession:() => { localStorage.removeItem(SESSION_KEY); localStorage.removeItem("bankly_access_token"); localStorage.removeItem("bankly_refresh_token"); },
  hashPw: async pw => {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
  },
  getUsers: () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]"),
  saveUsers: u => localStorage.setItem(USERS_KEY, JSON.stringify(u)),
  register: async ({ name, email, phone, password, role="customer" }) => {
    const users = LocalAuth.getUsers();
    if (users.find(u => u.email === email.toLowerCase()))
      throw new Error("An account with this email already exists.");
    const hashed = await LocalAuth.hashPw(password);
    const user = { id:`usr_${Date.now()}`, name, email:email.toLowerCase(), phone, role, hashed, balance:0, currency:"GHS", createdAt:new Date().toISOString() };
    LocalAuth.saveUsers([...users, user]);
  },
  login: async (email, password) => {
    // Try backend first
    try {
      const res = await fetch(`${API}/auth/login`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("bankly_access_token", data.accessToken);
        localStorage.setItem("bankly_refresh_token", data.refreshToken);
        LocalAuth.saveSession(data.user);
        return data.user;
      }
      throw new Error(data.error || "Login failed");
    } catch (err) {
      if (err.message !== "Login failed") {
        // Backend offline — fall back to local
        const users = LocalAuth.getUsers();
        const user = users.find(u => u.email === email.toLowerCase());
        if (!user) throw new Error("No account found with this email address.");
        const hashed = await LocalAuth.hashPw(password);
        if (hashed !== user.hashed) throw new Error("Incorrect password.");
        const session = { id:user.id, name:user.name, email:user.email, phone:user.phone, role:user.role, balance:user.balance||0, currency:"GHS", createdAt:user.createdAt };
        LocalAuth.saveSession(session);
        return session;
      }
      throw err;
    }
  },
};

// ── Transaction Store ─────────────────────────────────────────────────────────
export const TxStore = {
  get: uid => JSON.parse(localStorage.getItem(TXNS_PREFIX+uid) || "[]"),
  add: (uid, tx) => {
    const all = [tx, ...TxStore.get(uid)].slice(0,200);
    localStorage.setItem(TXNS_PREFIX+uid, JSON.stringify(all));
    return all;
  },
};

// ── Chart Tooltip ────────────────────────────────────────────────────────────
export const ChartTip = ({active, payload, label}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#1a1740",border:`1px solid ${T.borderLight}`,borderRadius:11,padding:"11px 15px"}}>
      <p style={{color:T.txtSub,fontSize:12,marginBottom:5,fontWeight:600}}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{color:p.color,fontSize:13,margin:"2px 0"}}>
          {p.name}: <strong>₵{Number(p.value).toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Ghana banks list ──────────────────────────────────────────────────────────
export const GHANA_BANKS = [
  "GCB Bank","Ecobank Ghana","Absa Bank Ghana","Standard Chartered",
  "Fidelity Bank","Cal Bank","Access Bank Ghana","Zenith Bank",
  "First National Bank","Agricultural Development Bank","Republic Bank",
  "National Investment Bank","Prudential Bank","OmniBSIC Bank",
  "Universal Merchant Bank","GT Bank Ghana",
];
