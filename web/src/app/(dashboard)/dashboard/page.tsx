"use client";

import { motion } from "framer-motion";
import { ArrowRightLeft, ArrowUpRight, ArrowDownLeft, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

type Txn = {
  _id: string;
  category: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
};

export default function Dashboard() {
  const { user, hideBalance, toggleBalanceVisibility } = useUser();
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/transactions?limit=4")
      .then(res => setTxns(res.transactions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatBalance = (amount: number) => {
    if (hideBalance) return "₵ * * * * *";
    return `₵${amount.toLocaleString("en-GH", { minimumFractionDigits: 2 })}`;
  };

  const getFirstName = () => user?.name?.split(" ")[0] || "User";

  return (
    <>
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Good morning, {getFirstName()}</h1>
          <p className="text-gray-400 text-sm">Here's your financial overview for today.</p>
        </div>
        <button className="hidden sm:flex items-center gap-2 bg-[#6366f1] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#8b5cf6] transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)]">
          <ArrowRightLeft size={16} /> Send Money
        </button>
      </header>

      {/* Balance Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl p-8 overflow-hidden mb-8 shadow-2xl glass-card bg-gradient-to-br from-[#1a1c3a] to-[#0a0a0f] border-[#2a2c5a]"
      >
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] bg-[#6366f1] opacity-20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-sm font-medium text-gray-300">Total Balance</p>
              <button onClick={toggleBalanceVisibility} className="text-gray-400 hover:text-white transition-colors">
                {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <h2 className="text-5xl font-bold tracking-tighter mb-2">{formatBalance(user?.balance || 0)}</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-xs ${user?.balance === 0 ? "bg-gray-500/10 text-gray-400" : "bg-green-400/10 text-green-400"}`}>
                {user?.balance === 0 ? "New Account" : <><ArrowUpRight size={14} /> Active</>}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Link href="/deposit" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
              <ArrowDownLeft size={16} /> Deposit
            </Link>
            <Link href="/withdraw" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors">
              <ArrowUpRight size={16} /> Withdraw
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <Link href="/transactions" className="text-sm text-[#6366f1] font-medium hover:text-[#8b5cf6]">View all</Link>
          </div>
          
          <div className="glass-card rounded-2xl p-2 h-full min-h-[300px]">
            {loading ? (
               <div className="p-12 flex justify-center text-[#6366f1]">
                 <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
               </div>
            ) : txns.length > 0 ? (
              txns.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-gray-800 text-gray-400'}`}>
                      {tx.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm truncate max-w-[200px] sm:max-w-xs">{tx.description}</p>
                      <p className="text-xs text-gray-500">{tx.category} • {new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-green-400' : 'text-white'}`}>
                    {tx.type === 'income' ? '+' : '-'}₵{Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center h-full">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                    <ArrowRightLeft size={24} className="text-gray-500" />
                  </div>
                  <h4 className="font-semibold mb-1">No Transactions Yet</h4>
                  <p className="text-sm text-gray-500 max-w-xs">Your transaction history will appear here once you make your first deposit.</p>
                  <Link href="/deposit" className="mt-4 text-sm text-[#6366f1] font-semibold hover:underline">Make a deposit</Link>
                </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h3 className="text-lg font-semibold">Security Alerts</h3>
          
          <div className="glass-card rounded-2xl p-6 border-orange-500/20 bg-gradient-to-b from-orange-500/5 to-transparent relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="text-orange-400 mt-1">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1 text-orange-200">AI Fraud Detection Active</h4>
                <p className="text-xs text-orange-200/70 leading-relaxed mb-4">
                  Your transactions are monitored by our GradientBoosting model (AUC 0.9964). 
                </p>
                <Link href="/fraud" className="inline-block text-xs font-semibold bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-lg hover:bg-orange-500/30 transition-colors">
                  View Security Logs
                </Link>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h4 className="font-semibold text-sm mb-4">Quick Transfer</h4>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input type="text" placeholder="0244 *** ***" className="flex-1 w-0 bg-[#050508] border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-[#6366f1] outline-none" />
                <input type="text" placeholder="Amt" className="w-20 bg-[#050508] border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-[#6366f1] outline-none" />
              </div>
              <button className="w-full bg-white text-black py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                Send Now
              </button>
            </div>
          </div>

        </motion.div>

      </div>
    </>
  );
}
