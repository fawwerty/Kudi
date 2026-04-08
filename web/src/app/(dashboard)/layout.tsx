"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, CreditCard, ArrowRightLeft, Download, Upload, MoveRight,
  FileText, Smartphone, PieChart, Brain, Shield, Bell, Settings, LogOut
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
      {/* Sidebar - Desktop */}
      <aside className="fixed hidden md:flex flex-col top-0 left-0 w-64 h-full border-r border-white/5 bg-[#050508] z-20">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            ₵
          </div>
          <span className="font-bold tracking-tight">Kudi</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = pathname === link.path;
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.id} 
                href={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  isActive 
                    ? "bg-[#6366f1]/10 text-white border border-[#6366f1]/20" 
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon size={18} className={isActive ? "text-[#6366f1]" : "text-gray-500"} />
                {link.label}
              </Link>
            );
          })}
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

      {/* Main Content Wrapper */}
      <main className="md:ml-64 p-6 lg:p-10 max-w-7xl pb-24">
        {children}
      </main>
    </div>
  );
}
