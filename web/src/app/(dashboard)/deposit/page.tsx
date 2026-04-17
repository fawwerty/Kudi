"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, CreditCard, Landmark, CheckCircle2, Shield, ExternalLink } from "lucide-react";
import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useUser } from "@/context/UserContext";

export default function DepositPage() {
  const { refreshUser } = useUser();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("card");
  const [state, setState] = useState<"idle" | "loading" | "success" | "redirect">("idle");
  const [error, setError] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setError("");

    try {
      const res = await fetchApi("/transactions/deposit", {
        method: "POST",
        body: JSON.stringify({ amount, description: `Deposit via ${method.toUpperCase()}` })
      });
      
      if (res.checkoutUrl) {
        setCheckoutUrl(res.checkoutUrl);
        setState("redirect");
        // Open in new tab or redirect
        window.location.href = res.checkoutUrl;
      } else {
        await refreshUser();
        setState("success");
        setTimeout(() => {setState("idle"); setAmount("");}, 3000);
      }
    } catch (err: any) {
      setError(err.message);
      setState("idle");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Deposit Funds</h1>
        <p className="text-gray-400 text-sm">Add funds safely to your account using secure payment gateways.</p>
      </header>

      {state === "redirect" ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-[#6366f1]/20 text-[#6366f1] rounded-full flex items-center justify-center mb-6 animate-pulse">
            <ExternalLink size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Redirecting to Secure Payment</h2>
          <p className="text-gray-400 mb-6">We are taking you to Paystack to complete your ₵{amount} deposit.</p>
          <a 
            href={checkoutUrl}
            className="text-[#6366f1] font-bold hover:underline bg-[#6366f1]/10 px-6 py-3 rounded-xl"
          >
            Click here if you are not redirected
          </a>
        </motion.div>
      ) : state === "success" ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Deposit Successful</h2>
          <p className="text-gray-400 mb-6">₵{amount} has been successfully added to your account balance.</p>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6366f1] bg-[#6366f1]/10 px-3 py-1.5 rounded-lg">
            <Shield size={14} /> AI Anti-Money Laundering Check Passed
          </div>
        </motion.div>
      ) : (
        <div className="glass-card rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-semibold">{error}</div>}
            
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Amount to Deposit (GHS)</label>
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
                  className="w-full bg-[#050508] border border-white/10 rounded-2xl pl-12 pr-4 py-6 text-3xl font-bold tracking-tighter focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 outline-none transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            {/* Methods */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Deposit Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMethod("card")}
                  className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all ${
                    method === "card" 
                      ? "bg-[#6366f1]/10 border-[#6366f1] text-white" 
                      : "bg-[#050508] border-white/5 text-gray-400 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <CreditCard size={24} className={method === "card" ? "text-[#6366f1]" : ""} />
                  <span className="font-semibold text-sm">Credit/Debit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("bank")}
                  className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all ${
                    method === "bank" 
                      ? "bg-[#6366f1]/10 border-[#6366f1] text-white" 
                      : "bg-[#050508] border-white/5 text-gray-400 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <Landmark size={24} className={method === "bank" ? "text-[#6366f1]" : ""} />
                  <span className="font-semibold text-sm">Bank Transfer / MoMo</span>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={state === "loading" || !amount}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:opacity-90 disabled:opacity-50 transition-all text-lg"
            >
              {state === "loading" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Initializing Paystack Gateway...
                </>
              ) : (
                <>
                  <ArrowDownLeft size={20} /> Secure Deposit with Paystack
                </>
              )}
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-widest font-bold">
            Secure 256-bit SSL Encryption
          </p>
        </div>
      )}
    </motion.div>
  );
}
