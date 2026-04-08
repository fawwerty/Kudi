"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Shield, CheckCircle2, Building2 } from "lucide-react";
import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useUser } from "@/context/UserContext";

export default function WithdrawPage() {
  const { user, refreshUser } = useUser();
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setError("");

    try {
      await fetchApi("/transactions/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount, description: `Withdrawal to ${account}` })
      });
      await refreshUser();
      setState("success");
      setTimeout(() => {setState("idle"); setAmount("");}, 3000);
    } catch (err: any) {
      setError(err.message);
      setState("idle");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Withdraw Funds</h1>
        <p className="text-gray-400 text-sm">Move money safely from your Kudi balance to your linked accounts.</p>
      </header>

      {state === "success" ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Withdrawal Initiated</h2>
          <p className="text-gray-400 mb-6">₵{amount} is on its way to your linked account.</p>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6366f1] bg-[#6366f1]/10 px-3 py-1.5 rounded-lg">
            <Shield size={14} /> Encrypted Transfer Active
          </div>
        </motion.div>
      ) : (
        <div className="glass-card rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-semibold">{error}</div>}
            
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Amount to Withdraw (GHS)</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-bold text-gray-400 text-2xl">₵</span>
                <input 
                  type="number" 
                  required
                  min="1"
                  step="0.01"
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-2xl pl-12 pr-4 py-6 text-3xl font-bold tracking-tighter focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none transition-all placeholder:text-gray-700"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex justify-between">
                <span>Available Balance: ₵{user?.balance?.toFixed(2) || "0.00"}</span>
                <button type="button" onClick={() => setAmount(user?.balance?.toString() || "0")} className="text-[#6366f1] font-semibold hover:underline">Withdraw Max</button>
              </p>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Destination Account</label>
              <div className="space-y-3">
                {[
                  { id: "1", name: "Fidelity Bank", num: "**** 4092", balance: "" },
                  { id: "MTN MoMo", name: "MTN MoMo", num: "**** 3456", balance: "" }
                ].map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setAccount(acc.name)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                      account === acc.name 
                        ? "bg-white/10 border-white/30" 
                        : "bg-[#050508] border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 border border-white/5">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-white">{acc.name}</p>
                        <p className="text-xs text-gray-500">{acc.num}</p>
                      </div>
                    </div>
                    {account === acc.name && (
                      <div className="w-5 h-5 rounded-full bg-[#6366f1] flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={state === "loading" || !amount || !account}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:opacity-90 disabled:opacity-50 transition-all text-lg"
            >
              {state === "loading" ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowUpRight size={20} /> Confirm Withdrawal
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
}
