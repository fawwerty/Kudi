"use client";

import { motion } from "framer-motion";
import { User, Lock, Link as LinkIcon, Bell, Shield, Wallet, Zap, Key } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/context/UserContext";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useUser();

  const TABS = [
    { id: "profile", label: "Profile Details", icon: User },
    { id: "security", label: "Security & Fraud", icon: Lock },
    { id: "plans", label: "Plan & limits", icon: Zap },
    { id: "connections", label: "Connections", icon: LinkIcon },
    { id: "notifications", label: "Preferences", icon: Bell },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Account Settings</h1>
        <p className="text-gray-400 text-sm">Manage your Kudi profile, security features, limits, and connections.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold text-left ${
                  activeTab === tab.id 
                    ? "bg-[#6366f1]/10 text-white border border-[#6366f1]/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon size={18} className={activeTab === tab.id ? "text-[#6366f1]" : "text-gray-500"} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-card rounded-3xl p-8 min-h-[500px]">
          
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-xl font-bold border-b border-white/5 pb-4">Personal Information</h3>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] flex items-center justify-center font-bold text-3xl shadow-[0_0_20px_rgba(99,102,241,0.3)] border-4 border-[#050508]">
                  {user?.name?.substring(0, 2).toUpperCase() || "KU"}
                </div>
                <div>
                  <button className="bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg text-sm font-semibold mb-2">Change Avatar</button>
                  <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Full Name</label>
                  <input type="text" defaultValue={user?.name || ""} disabled className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-300" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Email Address</label>
                  <input type="email" defaultValue={user?.email || ""} disabled className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-300" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Phone Number</label>
                  <input type="tel" defaultValue={user?.phone || ""} disabled className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-gray-300" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Account Type</label>
                  <input type="text" defaultValue={user?.role?.toUpperCase() || ""} disabled className="w-full bg-[#050508] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none text-[#6366f1] font-bold" />
                </div>
              </div>

              <div className="pt-6">
                <button className="bg-[#6366f1] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:opacity-90">
                  Save Details
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "plans" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-xl font-bold border-b border-white/5 pb-4">Plan & limits</h3>
              
              <div className="glass-card bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-2xl p-6 relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366f1]/20 blur-3xl" />
                <h4 className="font-bold text-lg text-white flex items-center gap-2 mb-2">
                  <Zap className="text-[#6366f1]" size={20} /> Kudi Tier 1
                </h4>
                <p className="text-sm text-gray-400 max-w-md mb-4">Your current verification level sets your daily transaction limits. Upgrade to Tier 2 by providing a Ghana Card.</p>
                <button className="bg-[#6366f1] text-white px-4 py-2 rounded-lg text-sm font-semibold">Verify Identity</button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-gray-300">Daily Transfer Limit</span>
                    <span className="text-sm font-bold">₵0.00 / ₵10,000</span>
                  </div>
                  <div className="h-2 w-full bg-[#050508] rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-[#10b981] w-[0%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-gray-300">Monthly Deposit Limit</span>
                    <span className="text-sm font-bold">₵0.00 / ₵50,000</span>
                  </div>
                  <div className="h-2 w-full bg-[#050508] rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-[#6366f1] w-[0%]" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "connections" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-xl font-bold border-b border-white/5 pb-4">Linked Connections</h3>
              <p className="text-sm text-gray-400 mb-6">Manage external applications and APIs connected to your Kudi account.</p>
              
              <div className="space-y-4">
                <div className="p-5 bg-[#050508] border border-white/10 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/GitHub_Invertocat_Logo.svg/512px-GitHub_Invertocat_Logo.svg.png" className="w-8 h-8" alt="Github" />
                     </div>
                     <div>
                       <h4 className="font-bold">GitHub Copilot API</h4>
                       <p className="text-xs text-gray-500">Connected 2 days ago</p>
                     </div>
                   </div>
                   <button className="text-xs text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 font-semibold">Disconnect</button>
                </div>

                <div className="p-5 bg-[#050508] border border-white/10 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/512px-Bitcoin.svg.png" className="w-full h-full object-contain" alt="Binance" />
                     </div>
                     <div>
                       <h4 className="font-bold">Binance Pay</h4>
                       <p className="text-xs text-gray-500">Connected 1 month ago</p>
                     </div>
                   </div>
                   <button className="text-xs text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 font-semibold">Disconnect</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Similar implementations replacing demo data */}
              <h3 className="text-xl font-bold border-b border-white/5 pb-4">Security</h3>
              <p className="text-sm text-gray-400">Manage 2FA and passwords.</p>
              <button className="w-full bg-[#050508] border border-white/10 p-4 rounded-xl flex justify-between items-center text-sm font-semibold hover:border-white/30 transition-colors">
                <span className="flex items-center gap-3"><Key size={18} className="text-[#6366f1]" /> Change Password</span>
                <span className="text-gray-500">Last changed 30 days ago</span>
              </button>
            </motion.div>
          )}

          {activeTab === "notifications" && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
               <h3 className="text-xl font-bold border-b border-white/5 pb-4">Notification Preferences</h3>
               {['Email transaction receipts', 'SMS alerts for withdrawals', 'Marketing & Newsletter', 'AI Fraud Alert push notifications'].map((label, i) => (
                 <label key={i} className="flex items-center justify-between cursor-pointer p-4 bg-[#050508] border border-white/5 rounded-xl hover:bg-white/5">
                   <span className="text-sm font-semibold text-gray-300">{label}</span>
                   <div className={`w-10 h-5 rounded-full relative transition-colors ${i !== 2 ? 'bg-[#6366f1]' : 'bg-gray-700'}`}>
                     <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${i !== 2 ? 'translate-x-5' : 'translate-x-0'}`} />
                   </div>
                 </label>
               ))}
             </motion.div>
          )}

        </div>
      </div>
    </motion.div>
  );
}
