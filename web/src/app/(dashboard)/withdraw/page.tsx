"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Shield, CheckCircle2, Building2, Search, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useUser } from "@/context/UserContext";

export default function WithdrawPage() {
  const { user, refreshUser } = useUser();
  const [amount, setAmount] = useState("");
  const [bankList, setBankList] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankQuery, setBankQuery] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const banks = await fetchApi("/transactions/banks");
        setBankList(banks);
      } catch (err) {
        console.error("Failed to load banks");
      }
    };
    loadBanks();
  }, []);

  const filteredBanks = (bankList || []).filter(b => 
    b.name.toLowerCase().includes(bankQuery.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank) return setError("Please select a bank");
    
    setState("loading");
    setError("");

    try {
      await fetchApi("/transactions/withdraw", {
        method: "POST",
        body: JSON.stringify({ 
          amount, 
          bankCode: selectedBank.code,
          accountNumber,
          accountName,
          description: `Withdrawal to ${selectedBank.name}` 
        })
      });
      await refreshUser();
      setState("success");
      setTimeout(() => {setState("idle"); setAmount(""); setAccountNumber("");}, 5000);
    } catch (err: any) {
      setError(err.message);
      setState("idle");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Withdraw Funds</h1>
        <p className="text-gray-400 text-sm">Transfer money safely to any bank account in Ghana via Paystack.</p>
      </header>

      {state === "success" ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Withdrawal Successful</h2>
          <p className="text-gray-400 mb-6">₵{amount} has been successfully sent to {accountNumber}.</p>
          <div className="flex items-center gap-2 text-xs font-bold text-[#6366f1] bg-[#6366f1]/10 px-3 py-1.5 rounded-lg">
            <Shield size={14} /> AI & Paystack Secured Transaction
          </div>
        </motion.div>
      ) : (
        <div className="glass-card rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-semibold flex items-center gap-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            
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
                <span>Available Balance: ₵{user?.balance?.toLocaleString("en-GH", { minimumFractionDigits: 2 }) || "0.00"}</span>
                <button type="button" onClick={() => setAmount(user?.balance?.toString() || "0")} className="text-[#6366f1] font-semibold hover:underline">Withdraw Max</button>
              </p>
            </div>

            {/* Bank Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-3">Select Bank</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search banks..." 
                    value={bankQuery}
                    onChange={(e) => setBankQuery(e.target.value)}
                    className="w-full bg-[#050508] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-[#6366f1] outline-none" 
                  />
                  {bankQuery && !selectedBank && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#0d0d15] border border-white/10 rounded-xl z-50 overflow-hidden shadow-2xl">
                      {filteredBanks.map(b => (
                        <button 
                          key={b.code} 
                          type="button"
                          onClick={() => { setSelectedBank(b); setBankQuery(b.name); }}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 border-b border-white/5 last:border-0"
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-3">Account Number</label>
                <input 
                  type="text" 
                  placeholder="0123456789" 
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#6366f1] outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Account Name (Full Name)</label>
              <input 
                type="text" 
                placeholder="As seen on your bank statement" 
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#6366f1] outline-none" 
              />
            </div>

            <button 
              type="submit" 
              disabled={state === "loading" || !amount || !selectedBank || !accountNumber}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:opacity-90 disabled:opacity-50 transition-all text-lg"
            >
              {state === "loading" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing Real-time Transfer...
                </>
              ) : (
                <>
                  <ArrowUpRight size={20} /> Initiate Real-time Withdrawal
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
}
