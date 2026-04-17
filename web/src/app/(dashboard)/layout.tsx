"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, CreditCard, ArrowRightLeft, Download, Upload, MoveRight,
  FileText, Smartphone, PieChart, Brain, Shield, Bell, Settings, LogOut,
  Menu, X, Search, User, QrCode
} from "lucide-react";
import { useUser } from "@/context/UserContext";

const SIDEBAR_LINKS = [
  { id: "dashboard", icon: Home, label: "Overview", path: "/dashboard" },
  { id: "accounts", icon: CreditCard, label: "Accounts", path: "/accounts" },
  { id: "transactions", icon: ArrowRightLeft, label: "Transactions", path: "/transactions" },
  { id: "deposit", icon: Download, label: "Deposit", path: "/deposit" },
  { id: "withdraw", icon: Upload, label: "Withdraw", path: "/withdraw" },
  { id: "transfer", icon: MoveRight, label: "Transfer", path: "/transfer" },
  { id: "bills", icon: FileText, label: "Pay Bills", path: "/bills" },
  { id: "mobile-money", icon: Smartphone, label: "Mobile Money", path: "/mobile-money" },
  { id: "analytics", icon: PieChart, label: "Analytics", path: "/analytics" },
  { id: "ai-advisor", icon: Brain, label: "AI Advisor", path: "/ai-advisor" },
  { id: "fraud", icon: Shield, label: "Fraud Shield", path: "/fraud" },
  { id: "notifications", icon: Bell, label: "Notifications", path: "/notifications" },
  { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen bg-[#020205] text-white flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#6366f1]/30 border-t-[#6366f1] rounded-full animate-spin" />
    </div>;
  }

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "KU";
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white">
      {/* Mobile Top Header */}
      <header className="fixed md:hidden top-0 left-0 w-full h-16 bg-[#050508]/80 backdrop-blur-md border-b border-white/5 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="w-7 h-7 bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center font-bold text-xs">₵</div>
          <span className="font-bold text-sm">Kudi</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400"><Search size={20} /></button>
          <Link href="/settings" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
            {getInitials(user?.name || "")}
          </Link>
        </div>
      </header>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 h-full border-r border-white/5 bg-[#050508] z-50 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:flex md:flex-col
        ${mobileMenuOpen ? "translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.8)]" : "-translate-x-full"}
      `}>
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            ₵
          </div>
          <span className="font-bold tracking-tight">Kudi</span>
        </div>
        
        {/* Mobile Sidebar Close Button */}
        <div className="md:hidden p-6 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#6366f1] rounded flex items-center justify-center text-[10px] font-bold">₵</div>
            <span className="font-bold text-sm">Navigation</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        {/* Links Container */}
        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <div className={`grid ${mobileMenuOpen ? "grid-cols-2 gap-3" : "grid-cols-1 space-y-1"} md:grid-cols-1 md:space-y-1`}>
            {SIDEBAR_LINKS.map((link) => {
              const isActive = pathname === link.path;
              const Icon = link.icon;
              
              return (
                <Link 
                  key={link.id} 
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all border ${
                    isActive 
                      ? "bg-[#6366f1]/10 text-white border-[#6366f1]/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                      : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
                  } ${mobileMenuOpen ? "flex-col justify-center text-center p-4 bg-white/5" : ""}`}
                >
                  <Icon size={mobileMenuOpen ? 24 : 18} className={isActive ? "text-[#6366f1]" : "text-gray-500"} />
                  <span className={mobileMenuOpen ? "text-[11px]" : ""}>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="p-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 p-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1a1a2e] flex items-center justify-center font-semibold text-xs border border-white/10 shrink-0">
              {user ? getInitials(user.name) : "KU"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Kudi User"}</p>
              <p className="text-[10px] text-gray-500 truncate uppercase mt-0.5">{user?.role || "Member"}</p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed md:hidden bottom-0 left-0 w-full h-16 bg-[#050508]/90 backdrop-blur-xl border-t border-white/5 z-40 flex items-center justify-around px-2 pb-safe">
        {[
          { icon: Home, label: "Home", path: "/dashboard" },
          { icon: Download, label: "Deposit", path: "/deposit" },
          { icon: QrCode, label: "Scan", path: "/scan", primary: true },
          { icon: Upload, label: "Send", path: "/withdraw" },
          { icon: Smartphone, label: "MoMo", path: "/mobile-money" },
        ].map((item) => (
          <Link 
            key={item.label}
            href={item.path} 
            className={`flex flex-col items-center gap-1 transition-all ${
              item.primary ? "-mt-8" : ""
            } ${pathname === item.path ? "text-[#6366f1]" : "text-gray-500"}`}
          >
            {item.primary ? (
              <div className="w-14 h-14 rounded-full bg-[#6366f1] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(99,102,241,0.4)] border-4 border-[#020205]">
                <item.icon size={24} />
              </div>
            ) : (
              <>
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Main Content Wrapper */}
      <main className="md:ml-64 p-4 md:p-6 lg:p-10 max-w-7xl pt-20 md:pt-10 pb-24 md:pb-10">
        {children}
      </main>
    </div>
  );
}
