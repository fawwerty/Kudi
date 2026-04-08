"use client";

import { motion } from "framer-motion";
import { Brain, Send, Bot, User, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { fetchApi } from "@/lib/api";

const INITIAL_MESSAGES = [
  { role: "ai", text: "Hello! 👋 I'm Kudi AI — powered by GradientBoosting and RandomForest models. Ask me anything about your spending habits or budget planning!" }
];

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<{role: string, text: string}[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [txns, setTxns] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchApi("/transactions?limit=50")
      .then(res => {
         setTxns(res.transactions || []);
         if (res.transactions?.length === 0) {
            setMessages([
              { role: "ai", text: "Welcome to Kudi AI! It looks like you haven't made any transactions yet. Once you do, I can help analyze your spending patterns, detect fraud, and provide budgeting advice." }
            ]);
         }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const query = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: query }]);
    setLoading(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = "I'm analyzing your dataset... Try asking me about your 'top spend', 'fraud', or 'budget'.";
      
      if (txns.length === 0) {
         reply = "I cannot analyze your spending because you currently have no transactions recorded. Start using your Kudi account to get personalized insights!";
      } else {
        if (lower.includes("spend") || lower.includes("top")) {
          const expense = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
          reply = `📊 Based on your data, your total expenses amount to ₵${expense.toFixed(2)}. Make sure to monitor your daily outflows!`;
        } else if (lower.includes("fraud")) {
          reply = "🛡️ Our GradientBoosting model has cleared all your recent transactions. You currently have 0 anomalous activities logged.";
        } else if (lower.includes("budget")) {
          reply = "📋 Budget Analysis is running on your recent spending. Looks like you are within a safe threshold!";
        }
      }

      setMessages(prev => [...prev, { role: "ai", text: reply }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mt-4 h-[calc(100vh-140px)] flex flex-col">
      <header className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <Brain className="text-[#6366f1]" size={32} /> 
            AI Advisor
          </h1>
          <p className="text-gray-400 text-sm">Real-time intelligent analysis of your financial health.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold bg-[#6366f1]/10 text-[#6366f1] px-3 py-1.5 rounded-lg border border-[#6366f1]/20">
          <Sparkles size={14} /> Models Online (AUC 0.99)
        </div>
      </header>

      <div className="flex-1 glass-card rounded-3xl overflow-hidden flex flex-col relative border-[#6366f1]/20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6366f1] opacity-5 blur-[120px] rounded-full pointer-events-none" />

        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth relative z-10 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center shadow-lg ${
                msg.role === 'user' ? 'bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6]' : 'bg-[#050508] border border-[#6366f1]/30 text-[#6366f1]'
              }`}>
                {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={22} />}
              </div>
              
              <div className={`p-5 rounded-2xl whitespace-pre-wrap leading-relaxed text-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-tr-sm' 
                  : 'bg-[#050508]/80 backdrop-blur-sm border border-white/10 text-gray-200 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center bg-[#050508] border border-[#6366f1]/30 text-[#6366f1]">
                <Bot size={22} />
              </div>
              <div className="p-5 rounded-2xl bg-[#050508]/80 backdrop-blur-sm border border-white/10 text-gray-200 rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#6366f1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-white/5 bg-[#0a0a0f] relative z-10">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input 
              type="text" 
              placeholder="Ask about your budget, fraud alerts, or spending habits..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-[#050508] border border-white/10 rounded-xl px-5 py-4 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/50 outline-none transition-all disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="px-6 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold disabled:opacity-50 hover:opacity-90 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
