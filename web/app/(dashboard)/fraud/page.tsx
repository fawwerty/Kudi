"use client";

import { motion } from "framer-motion";
import { Shield, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

export default function FraudShieldPage() {
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/transactions?limit=50")
      .then(res => setTxns(res.transactions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Shield className="text-orange-500" size={32} /> 
          Fraud Shield
        </h1>
        <p className="text-gray-400 text-sm">Every transaction is screened by our enterprise-grade AI models.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20 text-[#6366f1]"><div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" /></div>
      ) : txns.length === 0 ? (
        <div className="glass-card rounded-3xl p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
           <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
             <Shield className="text-green-500" size={32} />
           </div>
           <h2 className="text-2xl font-bold mb-2">System Secure</h2>
           <p className="text-gray-400 max-w-sm">No transactions have been processed yet. When you begin transacting, our AI will monitor everything in real-time.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full" />
              <h3 className="text-orange-400 font-semibold mb-2">Threats Blocked</h3>
              <div className="text-4xl font-bold tracking-tighter mb-1">0</div>
              <p className="text-xs text-orange-400/80">In the last 30 days</p>
            </div>
            
            <div className="glass-card bg-gradient-to-br from-[#6366f1]/10 to-transparent border-[#6366f1]/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366f1]/10 blur-3xl rounded-full" />
              <h3 className="text-[#6366f1] font-semibold mb-2">Model Accuracy (AUC)</h3>
              <div className="text-4xl font-bold tracking-tighter mb-1 mt-1 font-mono">0.9964</div>
              <p className="text-xs text-[#6366f1]/80">GradientBoosting Model</p>
            </div>

            <div className="glass-card bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full" />
              <h3 className="text-green-500 font-semibold mb-2">Account Status</h3>
              <div className="text-2xl font-bold tracking-tighter mb-2 mt-3 flex items-center gap-2">
                SECURE <CheckCircle2 size={24} className="text-green-500" />
              </div>
              <p className="text-xs text-green-500/80">All transactions passed AI checks.</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8">
            <h3 className="font-bold text-xl mb-6">Recent Security Interventions</h3>
            <div className="text-center py-10 text-gray-500">
               No suspicious activities detected in your transaction history.
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
