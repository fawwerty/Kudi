"use client";

import { motion } from "framer-motion";
import { MoveRight, Shield, CheckCircle2, User } from "lucide-react";
import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useUser } from "@/context/UserContext";

export default function TransferPage() {
  const { refreshUser } = useUser();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");
  const [fraudScore, setFraudScore] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setError("");
    setFraudScore(null);

    try {
      const res = await fetchApi("/transactions/transfer", {
        method: "POST",
        body: JSON.stringify({ amount, recipientEmail: recipient, note })
      });
      await refreshUser();
      
      if (res.fraudCheck) {
         setFraudScore(res.fraudCheck.fraud_score);
      }
      
      setState("success");
      setTimeout(() => {setState("idle"); setAmount(""); setRecipient(""); setNote("")}, 4000);
    } catch (err: any) {
      setError(err.message);
      setState("idle");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Transfer Funds</h1>
        <p className="text-gray-400 text-sm">Send money instantly to any bank account or wallet entirely free of charge.</p>
      </header>

      {state === "success" ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Transfer Successful</h2>
          <p className="text-gray-400 mb-6">₵{amount} has been successfully dispatched to {recipient}.</p>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6366f1] bg-[#6366f1]/10 px-3 py-1.5 rounded-lg">
            <Shield size={14} /> AI Fraud Check Passed {fraudScore !== null ? `(Risk: ${fraudScore.toFixed(4)})` : ''}
          </div>
        </motion.div>
      ) : (
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366f1]/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 mb-8 mt-2 relative z-10">
            <Shield className="text-[#6366f1] shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-[#8b5cf6]">GradientBoosting Model Active</p>
              <p className="text-xs text-[#8b5cf6]/70 mt-1">Every transfer is analyzed in real-time by our proprietary AI fraud detection model to ensure safety.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-semibold">{error}</div>}
            
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Recipient Email Address</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="e.g. kwame@example.com" 
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#6366f1] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Amount (GHS)</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-bold text-gray-400">₵</span>
                <input 
                  type="number" 
                  required
                  min="1"
                  step="0.01"
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-lg font-semibold focus:border-[#6366f1] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Reference Note (Optional)</label>
              <input 
                type="text" 
                placeholder="What is this for?" 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#6366f1] outline-none transition-all"
              />
            </div>

            <div className="pt-4 mt-6 border-t border-white/5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Transaction Fee</span>
                <span className="text-green-400 font-semibold">Free</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-300">Total to Deduct</span>
                <span className="font-bold text-xl">₵{amount || "0.00"}</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={state === "loading" || !amount || !recipient}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {state === "loading" ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <MoveRight size={18} /> Confirm Transfer
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
}
