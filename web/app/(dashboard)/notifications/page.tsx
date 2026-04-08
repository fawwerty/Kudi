"use client";

import { motion } from "framer-motion";
import { Bell, ShieldAlert, Tag, Calendar, CheckCircle2, MessageSquare } from "lucide-react";
import { useUser } from "@/context/UserContext";

const NOTIFICATIONS = [
  { id: 1, type: "system", title: "Welcome to Kudi!", msg: "Your account has been successfully created. Explore the modern fintech dashboard.", time: "Just now", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  { id: 2, type: "security", title: "New Login Detected", msg: "A new login was detected from Windows, Accra.", time: "2 hours ago", icon: ShieldAlert, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: 3, type: "promo", title: "Zero Transfer Fees", msg: "Enjoy zero fees on all your Kudi-to-Kudi transfers for the first 30 days.", time: "5 hours ago", icon: Tag, color: "text-[#6366f1]", bg: "bg-[#6366f1]/10" }
];

export default function NotificationsPage() {
  const { user } = useUser();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto mt-8">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Notifications</h1>
          <p className="text-gray-400 text-sm">Stay updated with alerts, messages, and promotions.</p>
        </div>
        <button className="text-sm font-semibold text-[#6366f1] hover:text-[#8b5cf6] transition-colors">
          Mark all as read
        </button>
      </header>

      <div className="glass-card rounded-3xl overflow-hidden min-h-[500px]">
        <div className="divide-y divide-white/5">
          {NOTIFICATIONS.map((notif) => {
            const Icon = notif.icon;
            return (
              <div key={notif.id} className="p-6 hover:bg-white/5 transition-colors cursor-pointer flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${notif.bg} ${notif.color}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-white">{notif.title}</h3>
                    <span className="text-xs font-semibold text-gray-500">{notif.time}</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{notif.msg}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  );
}
