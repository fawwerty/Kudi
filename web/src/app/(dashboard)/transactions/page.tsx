"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Search, Filter, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useUser } from "@/context/UserContext";

type Txn = {
  _id: string;
  category: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
  status: string;
};

export default function TransactionsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const { hideBalance } = useUser();

  useEffect(() => {
    fetchApi("/transactions?limit=50")
      .then(res => setTxns(res.transactions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = txns.filter(tx => {
    if (filter === "in" && tx.type !== "income") return false;
    if (filter === "out" && tx.type !== "expense") return false;
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatAmount = (amt: number) => {
    if (hideBalance) return "* * * * *";
    return `₵${Math.abs(amt).toFixed(2)}`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Transactions</h1>
        <p className="text-gray-400 text-sm">{loading ? "Loading..." : `${filtered.length} transactions found`}</p>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search descriptions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#050508] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-[#6366f1] outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {[{ id: "all", label: "All" }, { id: "in", label: "Income" }, { id: "out", label: "Expense" }].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                filter === f.id ? "bg-[#6366f1]/20 text-white border border-[#6366f1]/50" : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card rounded-2xl overflow-hidden min-h-[400px] relative">
        <div className="hidden md:grid grid-cols-5 p-4 border-b border-white/5 bg-[#050508] text-xs font-bold text-gray-400 tracking-wider uppercase">
          <div className="col-span-2">Description</div>
          <div>Date</div>
          <div>Amount</div>
          <div className="text-right">Status</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {loading ? (
             <div className="absolute inset-0 flex justify-center items-center">
                <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
             </div>
          ) : filtered.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                <AlertCircle size={24} className="text-gray-500" />
              </div>
              <p className="text-white font-semibold">No transactions found</p>
              <p className="text-gray-500 text-sm mt-1">Make a deposit to get started.</p>
            </div>
          ) : (
            filtered.map((tx) => (
              <div key={tx._id} className="grid grid-cols-1 md:grid-cols-5 items-center p-4 hover:bg-white/5 transition-colors">
                <div className="col-span-2 flex items-center gap-4">
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-gray-800 text-gray-400'}`}>
                    {tx.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm max-w-[200px] sm:max-w-[300px] truncate">{tx.description}</p>
                    <p className="text-[10px] uppercase text-gray-500 px-2 py-0.5 md:hidden bg-white/5 rounded mt-1 inline-block">{tx.category}</p>
                  </div>
                </div>
                
                <div className="hidden md:block">
                  <p className="text-sm text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  <p className="text-[10px] uppercase font-bold text-gray-600 mt-0.5 bg-white/5 px-2 py-0.5 rounded inline-block">{tx.category}</p>
                </div>
                
                <div className="mt-2 md:mt-0">
                  <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-green-400' : 'text-white'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                  </span>
                </div>
                
                <div className="hidden md:block text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/5 ${tx.status === 'completed' ? 'text-gray-300' : 'text-orange-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
