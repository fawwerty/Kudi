"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Plus, Snowflake, ShieldBan, Smartphone, X, CheckCircle2, ChevronRight, Building } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useState } from "react";

export default function AccountsPage() {
  const { user } = useUser();
  const [isFrozen, setIsFrozen] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [activeModal, setActiveModal] = useState<"bank" | "momo" | null>(null);
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);

  // Form states
  const [linkDetails, setLinkDetails] = useState({ provider: "GTBank", accountRef: "" });

  const handleLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkDetails.accountRef) return;
    
    setLinkedAccounts(prev => [...prev, {
      id: Date.now(),
      type: activeModal,
      provider: linkDetails.provider,
      ref: linkDetails.accountRef,
      date: new Date().toLocaleDateString()
    }]);
    
    setActiveModal(null);
    setLinkDetails({ provider: "GTBank", accountRef: "" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto mt-8 relative">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Accounts & Cards</h1>
          <p className="text-gray-400 text-sm">Manage your Kudi Virtual Cards and linked bank accounts.</p>
        </div>
        <button 
          onClick={() => setActiveModal("bank")}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          <Plus size={16} /> Add New
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Virtual Cards */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b border-white/5 pb-4">Virtual Cards</h3>
          
          <div className="relative w-full aspect-[1.6] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group mb-6 transition-all">
            {isCancelled ? (
               <div className="absolute inset-0 bg-[#0a0a0f] border border-red-500/30 flex flex-col items-center justify-center text-red-500 z-10">
                 <ShieldBan size={40} className="mb-4 opacity-50" />
                 <span className="font-bold tracking-widest text-lg">CARD CANCELLED</span>
               </div>
            ) : (
              <>
                <div className={`absolute inset-0 transition-all duration-700 ${isFrozen ? 'bg-blue-900 grayscale' : 'bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#ec4899]'}`} />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                
                {isFrozen && (
                  <div className="absolute inset-0 backdrop-blur-[2px] bg-blue-500/10 flex items-center justify-center z-10 border border-blue-400/30 rounded-3xl">
                    <div className="bg-blue-950/80 px-4 py-2 rounded-full border border-blue-500/50 flex items-center gap-2 text-blue-200 font-bold tracking-widest">
                      <Snowflake size={16} className="animate-pulse" /> TEMPORARILY FROZEN
                    </div>
                  </div>
                )}

                <div className="relative h-full flex flex-col justify-between p-8">
                  <div className="flex justify-between items-start">
                    <div className="text-white font-bold text-xl tracking-widest">Kudi Platinum</div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm" />
                      <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-sm -ml-4" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-white/80 font-mono text-sm tracking-[0.2em] mb-1 group-hover:text-white transition-colors">**** **** **** 4092</div>
                    <div className="flex justify-between items-end">
                      <div className="uppercase text-white tracking-widest font-semibold text-sm">{user?.name || "Kudi User"}</div>
                      <div className="text-white font-mono text-sm tracking-widest">12/28</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {!isCancelled && (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setIsFrozen(!isFrozen)}
                className={`glass-card flex items-center justify-center gap-2 py-4 rounded-2xl hover:bg-white/5 transition-all w-full border ${isFrozen ? 'text-blue-300 border-blue-400/50 bg-blue-900/20' : 'text-blue-400 border-blue-500/20'}`}
              >
                <Snowflake size={18} /> {isFrozen ? "Unfreeze Card" : "Freeze Card"}
              </button>
              <button 
                onClick={() => {
                  if(confirm("Are you sure you want to permanently cancel your virtual card?")) setIsCancelled(true);
                }}
                className="glass-card flex items-center justify-center gap-2 py-4 rounded-2xl hover:bg-red-500/10 transition-all w-full text-red-500 border border-red-500/20"
              >
                <ShieldBan size={18} /> Cancel Card
              </button>
            </div>
          )}
          {isCancelled && (
            <button 
              onClick={() => setIsCancelled(false)}
              className="w-full py-4 mt-2 bg-[#6366f1] text-white rounded-2xl font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            >
              Issue New Virtual Card
            </button>
          )}
        </div>

        {/* Linked Accounts */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold border-b border-white/5 pb-4">Linked Accounts</h3>
          
          <div className="space-y-4">
            {/* Primary Main Account Info based on Context */}
            <div className="glass-card rounded-2xl p-5 border border-[#6366f1]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 bg-[#6366f1] h-full" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#6366f1]/10 rounded-xl flex items-center justify-center text-[#6366f1]">
                  <CreditCard size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Kudi Primary Checking</h4>
                  <p className="text-xs text-gray-400 mt-1">Acct: ***{user?.id?.substring(0, 4) || "0000"}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#6366f1]">₵{user?.balance?.toFixed(2) || "0.00"}</p>
                  <p className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded mt-1 uppercase">Default</p>
                </div>
              </div>
            </div>

            {linkedAccounts.map(acc => (
              <div key={acc.id} className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden flex items-center gap-4">
                <div className="w-12 h-12 bg-[#050508] border border-white/10 rounded-xl flex items-center justify-center text-gray-300">
                  {acc.type === 'bank' ? <Building size={20} /> : <Smartphone size={20} />}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{acc.provider}</h4>
                  <p className="text-xs text-gray-400 mt-1">Ref: {acc.ref.replace(/.(?=.{4})/g, '*')}</p>
                </div>
                <div className="text-right">
                  <span className="text-green-500 flex items-center gap-1 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">
                     <CheckCircle2 size={12} /> Linked
                  </span>
                </div>
              </div>
            ))}

            <button 
              onClick={() => setActiveModal("bank")}
              className="w-full glass-card rounded-2xl p-5 hover:bg-white/5 transition-colors cursor-pointer group border border-dashed border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#050508] border border-white/10 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                  <Plus size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-sm group-hover:text-white text-gray-300">Link Bank Account</h4>
                  <p className="text-xs text-gray-500 mt-1">Connect your GTBank, Ecobank...</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-600 group-hover:text-white" />
            </button>

            <button 
              onClick={() => setActiveModal("momo")}
              className="w-full glass-card rounded-2xl p-5 hover:bg-white/5 transition-colors cursor-pointer group border border-dashed border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#050508] border border-white/10 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                  <Smartphone size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-sm group-hover:text-white text-gray-300">Link Mobile Money</h4>
                  <p className="text-xs text-gray-500 mt-1">MTN, Telecel, AT...</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-600 group-hover:text-white" />
            </button>

          </div>
        </div>
      </div>

      {/* Link Accounts Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0a0a0f] border border-white/10 rounded-3xl w-full max-w-md p-6 relative shadow-2xl"
            >
              <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white">
                <X size={20} />
              </button>
              
              <div className="mb-6">
                <div className="w-12 h-12 bg-[#6366f1]/20 text-[#6366f1] rounded-xl flex items-center justify-center mb-4">
                   {activeModal === 'bank' ? <Building size={24} /> : <Smartphone size={24} />}
                </div>
                <h2 className="text-2xl font-bold">Link {activeModal === 'bank' ? 'Bank Account' : 'Mobile Wallet'}</h2>
                <p className="text-gray-400 text-sm mt-1">Securely route external funds into your Kudi account.</p>
              </div>

              <form onSubmit={handleLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Provider institution</label>
                  <select 
                    value={linkDetails.provider}
                    onChange={(e) => setLinkDetails({...linkDetails, provider: e.target.value})}
                    className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#6366f1] outline-none appearance-none"
                  >
                    {activeModal === 'bank' ? (
                      <>
                        <option>GTBank Ghana</option>
                        <option>Ecobank</option>
                        <option>Stanbic Bank</option>
                        <option>CBG</option>
                      </>
                    ) : (
                      <>
                        <option>MTN Mobile Money</option>
                        <option>Telecel Cash</option>
                        <option>AT Money</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">
                    {activeModal === 'bank' ? 'Account Number' : 'Registered Mobile Number'}
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder={activeModal === 'bank' ? "Enter 10-13 digit account number" : "e.g., 024 412 3456"}
                    value={linkDetails.accountRef}
                    onChange={(e) => setLinkDetails({...linkDetails, accountRef: e.target.value})}
                    className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#6366f1] outline-none"
                  />
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={!linkDetails.accountRef} className="w-full bg-[#6366f1] text-white py-3.5 rounded-xl font-bold disabled:opacity-50 hover:bg-[#8b5cf6] transition-colors flex justify-center items-center gap-2">
                    <CheckCircle2 size={18} /> Confirm Link
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-4 leading-relaxed">
                    By linking, you authorize Kudi to verify and process transactions against this external method.
                  </p>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
