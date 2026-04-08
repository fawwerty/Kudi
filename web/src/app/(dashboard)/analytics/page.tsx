"use client";

import { motion } from "framer-motion";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { AlertCircle } from "lucide-react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050508] border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-gray-400 text-xs font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-semibold flex items-center justify-between gap-4" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span>₵{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/transactions?limit=100")
      .then(res => setTxns(res.transactions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalIncome = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = Math.abs(txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
  const net = totalIncome - totalExpense;

  // Aggregate Category Data
  const categories = txns.filter(t => t.type === 'expense').reduce((acc: any, t) => {
    acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    return acc;
  }, {});

  const categoryData = Object.keys(categories).map(key => ({
    name: key, value: categories[key]
  })).sort((a, b) => b.value - a.value);

  // Aggregate monthly cashflow roughly
  const cashflowData = [
    { month: "Jan", income: 0, expense: 0 },
    { month: "Feb", income: 0, expense: 0 },
    { month: "Mar", income: 0, expense: 0 },
    { month: "Apr", income: totalIncome, expense: totalExpense } // Simplified demo binding
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Financial Analytics</h1>
        <p className="text-gray-400 text-sm">Comprehensive insights into your real spending patterns.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20 text-[#6366f1]"><div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" /></div>
      ) : txns.length === 0 ? (
        <div className="glass-card rounded-3xl p-20 text-center flex flex-col items-center justify-center min-h-[500px]">
           <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
             <AlertCircle size={32} className="text-gray-500" />
           </div>
           <h2 className="text-2xl font-bold mb-2">Not Enough Data</h2>
           <p className="text-gray-400 max-w-sm">We need at least a few transactions to generate your financial analytics dashboard.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Net Cashflow", val: `${net >= 0 ? '+' : '-'}₵${Math.abs(net).toFixed(2)}`, sub: "All time", border: net >= 0 ? "border-green-500/30" : "border-red-500/30", text: net >= 0 ? "text-green-500" : "text-red-500" },
              { label: "Total Expenses", val: `₵${totalExpense.toFixed(2)}`, sub: "All time", border: "border-red-500/30", text: "text-red-500" },
              { label: "Total Income", val: `₵${totalIncome.toFixed(2)}`, sub: "All time", border: "border-[#6366f1]/30", text: "text-[#6366f1]" },
              { label: "Savings Rate", val: `${totalIncome > 0 ? Math.round((net / totalIncome) * 100) : 0}%`, sub: "Current standing", border: "border-yellow-500/30", text: "text-yellow-500" },
            ].map((kpi, i) => (
              <div key={i} className={`glass-card bg-[#050508]/50 border ${kpi.border} rounded-3xl p-6`}>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">{kpi.label}</p>
                <h3 className={`text-2xl font-bold ${kpi.text} mb-1`}>{kpi.val}</h3>
                <p className="text-xs text-gray-500">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 glass-card rounded-3xl p-6">
              <h3 className="font-semibold mb-6 flex justify-between items-center">
                Cashflow Overview (2024)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashflowData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="month" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₵${value/1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Income" />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Expense" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 flex flex-col">
              <h3 className="font-semibold mb-2">Spending by Category</h3>
              <p className="text-xs text-gray-500 mb-6">Distribution of your expenses</p>
              
              <div className="h-[200px] w-full relative mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData.length ? categoryData : [{name:"None", value: 1}]}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}
                      dataKey="value" stroke="none"
                    >
                      {categoryData.length ? categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      )) : <Cell fill="#333" />}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                  <span className="text-xs text-gray-500">Expenses</span>
                  <span className="font-bold">₵{(totalExpense/1000).toFixed(1)}k</span>
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {categoryData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-gray-300">{entry.name}</span>
                    </div>
                    <span className="font-semibold">₵{(entry.value).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
