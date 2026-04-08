"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Smartphone, Building2, Send, Download, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { useUser } from "@/context/UserContext";

const PROVIDERS = [
  { id: "mtn", name: "MTN MoMo", color: "from-yellow-400 to-yellow-600", bg: "bg-yellow-500", border: "border-yellow-500", text: "text-black", fee: "0.5%", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/MTN_Logo.svg/512px-MTN_Logo.svg.png" },
  { id: "telecel", name: "Telecel Cash", color: "from-red-500 to-red-600", bg: "bg-red-500", border: "border-red-500", text: "text-white", fee: "0.75%", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Vodafone_logo.svg/512px-Vodafone_logo.svg.png" },
  { id: "airteltigo", name: "AT Money", color: "from-blue-500 to-red-600", bg: "bg-blue-600", border: "border-blue-500", text: "text-white", fee: "0.5%", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Airtel_logo.svg/512px-Airtel_logo.svg.png" },
];

export default function MobileMoneyPage() {
  const { refreshUser } = useUser();
  const [provider, setProvider] = useState("mtn");
  const [action, setAction] = useState<"send" | "receive">("send");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  const activeProvider = PROVIDERS.find(p => p.id === provider)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setError("");

    try {
      const endpoint = action === "send" ? "/momo/withdraw" : "/momo/deposit";
      await fetchApi(endpoint, {
        method: "POST",
        body: JSON.stringify({ amount, phone, provider })
      });
      await refreshUser();
      setState("success");
      setTimeout(() => {
        setState("idle");
        setAmount("");
        setPhone("");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
      setState("idle");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mobile Money Hub</h1>
        <p className="text-gray-400 text-sm">Direct integration with Ghana's premier mobile networks.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setProvider(p.id)}
            className={`glass-card relative overflow-hidden rounded-3xl p-6 transition-all duration-300 text-left ${
              provider === p.id ? `ring-2 ring-inset ring-${p.border.split('-')[1]}-500 bg-white/10` : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            {provider === p.id && (
              <div className={`absolute -right-10 -bottom-10 w-32 h-32 blur-3xl opacity-20 bg-gradient-to-br ${p.color}`} />
            )}
            <div className="flex justify-between items-center mb-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center p-2 shadow-lg ${p.bg}`}>
                <img src={p.logo} alt={p.name} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
              <span className={`text-xs font-bold ${provider === p.id ? 'bg-[#6366f1]/20 text-[#6366f1]' : 'text-gray-500 bg-white/5'} px-2 py-1 rounded`}>Fee: {p.fee}</span>
            </div>
            <h3 className={`font-bold text-lg mb-1 text-white`}>{p.name}</h3>
            <p className="text-xs text-gray-400">Instant settlements</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
        {state === "success" ? (
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center py-10">
             <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
               <CheckCircle2 size={32} />
             </div>
             <h2 className="text-2xl font-bold mb-2">Success!</h2>
             <p className="text-gray-400 text-sm">
                {action === "send" ? `₵${amount} transferred to ${phone}` : `₵${amount} pulled from ${phone}`}
             </p>
           </motion.div>
          ) : (
            <>
              <div className="flex bg-[#050508] border border-white/10 rounded-xl p-1 mb-6">
                <button 
                  onClick={() => setAction("send")} 
                  className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${action === "send" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}
                >
                  <Send size={16} /> Send to Wallet
                </button>
                <button 
                  onClick={() => setAction("receive")} 
                  className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${action === "receive" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}
                >
                  <Download size={16} /> Pull from Wallet
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-semibold">{error}</div>}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Wallet Phone Number</label>
                  <div className="flex gap-2">
                    <div className="bg-[#050508] border border-white/10 rounded-xl px-4 flex items-center text-sm text-gray-400 font-semibold shrink-0">
                      🇬🇭 +233
                    </div>
                    <input 
                      type="tel" 
                      required
                      placeholder="244 123 456" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white/40 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Amount (GHS)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₵</span>
                    <input 
                      type="number" 
                      required
                      min="1"
                      step="0.01"
                      placeholder="0.00" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-[#050508] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-lg font-semibold focus:border-white/40 outline-none transition-colors"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={state === "loading" || !phone || !amount}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {state === "loading" ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : action === "send" ? "Authorize Transfer" : "Initialize Pull"}
                </button>
              </form>
           </>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card bg-gradient-to-br from-[#1a1c3a] to-[#0a0a0f] border-[#2a2c5a] rounded-3xl p-8">
            <h3 className="font-semibold text-gray-300 mb-6 flex items-center gap-2">
              <Building2 size={18} className="text-[#6366f1]" /> Saved Wallets
            </h3>
            
            <div className="space-y-4">
              {[
                { name: "My MTN Business", num: "024 412 3456", prov: "mtn" },
                { name: "Auntie Ama", num: "050 123 9876", prov: "telecel" }
              ].map((w, i) => {
                const P = PROVIDERS.find(x => x.id === w.prov);
                return (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#050508]/50 border border-white/5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors" onClick={() => { setPhone(w.num); setProvider(w.prov); }}>
                    <div>
                      <p className="font-semibold text-sm">{w.name}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${P?.bg}`} /> {w.num}
                      </p>
                    </div>
                    <button className="text-xs font-bold text-[#6366f1] bg-[#6366f1]/10 px-3 py-1.5 rounded-lg hover:bg-[#6366f1]/20">
                      Use
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
