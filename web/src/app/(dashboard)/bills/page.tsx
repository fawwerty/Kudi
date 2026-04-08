"use client";

import { motion } from "framer-motion";
import { Zap, Droplets, Wifi, Tv, Monitor, GraduationCap, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { fetchApi } from "@/lib/api";
import { useUser } from "@/context/UserContext";

const CATEGORIES = [
  { id: "electricity", name: "Electricity (ECG)", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { id: "water", name: "Water (GWCL)", icon: Droplets, color: "text-blue-400", bg: "bg-blue-400/10" },
  { id: "internet", name: "Internet Data", icon: Wifi, color: "text-purple-400", bg: "bg-purple-400/10" },
  { id: "tv", name: "Cable TV (DSTV)", icon: Tv, color: "text-green-400", bg: "bg-green-400/10" },
  { id: "school", name: "School Fees", icon: GraduationCap, color: "text-rose-400", bg: "bg-rose-400/10" },
];

const INSTITUTIONS = [
  "University of Ghana (UG)",
  "KNUST",
  "UCC",
  "Ashesi University",
  "GIMPA"
];

export default function BillsPage() {
  const { refreshUser } = useUser();
  const [selected, setSelected] = useState<string>("electricity");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [school, setSchool] = useState(INSTITUTIONS[0]);
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setError("");

    try {
      const selectedCat = CATEGORIES.find(c => c.id === selected);
      let reference = account;
      if (selected === "school") {
        reference = `${school} - ${account}`;
      }

      await fetchApi("/transactions/bill-pay", {
        method: "POST",
        body: JSON.stringify({ amount, billType: selectedCat?.name || "Utility", reference })
      });
      await refreshUser();
      
      setState("success");
      setTimeout(() => {
        setState("idle");
        setAccount("");
        setAmount("");
      }, 4000);
    } catch (err: any) {
      setError(err.message);
      setState("idle");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Pay Bills & Fees</h1>
        <p className="text-gray-400 text-sm">Settle your utilities, subscriptions, and institutional fees instantly.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Select Biller</h3>
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelected(cat.id)}
                  className={`p-5 rounded-2xl border transition-all text-left flex flex-col gap-3 ${
                    selected === cat.id 
                      ? `bg-white/10 border-white/30 backdrop-blur-md shadow-xl ring-1 ring-white/20` 
                      : `bg-[#050508] border-white/5 hover:bg-white/5 hover:border-white/10`
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.bg} ${cat.color}`}>
                    <Icon size={20} />
                  </div>
                  <span className="font-semibold text-sm">{cat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="glass-card rounded-2xl p-6 border-[#6366f1]/20 bg-gradient-to-r from-[#6366f1]/10 to-transparent mt-6">
            <div className="flex gap-4">
              <Monitor className="text-[#6366f1] shrink-0" size={24} />
              <div>
                <h4 className="font-semibold text-sm mb-1">Set up Auto-Pay</h4>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">
                  Never miss a due date. Let Kudi handle your recurring bills automatically.
                </p>
                <button className="text-xs font-semibold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/10">
                  Configure Auto-Pay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
          {state === "success" ? (
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center py-8">
             <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
               <CheckCircle2 size={32} />
             </div>
             <h2 className="text-2xl font-bold mb-2">Payment Complete</h2>
             <p className="text-gray-400 text-sm">₵{amount} applied to your {CATEGORIES.find(c => c.id === selected)?.name} account.</p>
           </motion.div>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                Payment Details 
                <span className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
                  {CATEGORIES.find(c => c.id === selected)?.name}
                </span>
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-semibold">{error}</div>}
                
                {selected === "school" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Institution</label>
                    <select 
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#6366f1] outline-none transition-all appearance-none"
                    >
                      {INSTITUTIONS.map(inst => (
                        <option key={inst} value={inst}>{inst}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    {selected === "school" ? "Student ID" : "Account or Meter Number"}
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder={selected === "school" ? "Enter Student ID (e.g. 10982342)" : "Enter account ID"} 
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#6366f1] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Amount to Pay (GHS)</label>
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

                <div className="pt-4 mt-6 border-t border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Service Fee</span>
                    <span className="text-white font-semibold">₵1.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-300">Total Deducted</span>
                    <span className="font-bold text-xl">₵{amount ? (parseFloat(amount) + 1).toFixed(2) : "0.00"}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={state === "loading" || !amount || !account}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {state === "loading" ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Confirm Payment"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
