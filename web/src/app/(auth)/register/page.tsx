"use client";

import { motion } from "framer-motion";
import { ArrowRight, User as UserIcon, Mail, Phone, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex overflow-hidden">
      {/* Left panel — background image */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center p-16 overflow-hidden">
        <Image src="/kudi_hero_bg.png" alt="Kudi background" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020205]/20 to-[#020205]/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020205]/60 via-transparent to-[#020205]/60" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] rounded-2xl flex items-center justify-center font-bold text-2xl shadow-[0_0_30px_rgba(99,102,241,0.5)] mb-6 mx-auto">
            ₵
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Join Kudi today</h2>
          <p className="text-gray-300 text-lg leading-relaxed">Take control of your finances with AI-powered banking. Zero fees to get started.</p>
          <div className="mt-8 space-y-3 text-left">
            {["Zero balance to open your account", "Instant mobile money integration", "AI fraud protection enabled by default", "Bank-grade 256-bit encryption"].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 size={16} className="text-[#6366f1] shrink-0" /> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — register form */}
      <div className="w-full lg:w-1/2 relative flex flex-col justify-center items-center p-8 bg-[#020205]">
        {/* Mobile bg */}
        <div className="absolute inset-0 lg:hidden">
          <Image src="/kudi_hero_bg.png" alt="bg" fill sizes="100vw" className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-[#020205]/80" />
        </div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#a855f7] opacity-[0.07] blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-md my-8">
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center font-bold text-sm">₵</div>
            <span className="font-bold tracking-tight">Kudi</span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Create your account</h1>
              <p className="text-gray-400 text-sm">Join Kudi and take control of your finances</p>
            </div>

            {success ? (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card rounded-3xl p-8 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-xl font-bold mb-2">Registration Complete</h2>
                <p className="text-sm text-gray-400 mb-6">Your Kudi account has been created securely with ₵0.00 balance.</p>
                <Link href="/login" className="w-full mt-4 flex items-center justify-center gap-2 bg-[#6366f1] text-white py-3 rounded-xl font-bold hover:bg-[#8b5cf6] transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  Continue to Login <ArrowRight size={18} />
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleRegister} className="glass-card rounded-3xl p-8 space-y-5">
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-semibold">{error}</div>}

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="text" required placeholder="Kwame Mensah" value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full bg-[#050508] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="email" required placeholder="kwame@example.com" value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      className="w-full bg-[#050508] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="tel" required placeholder="0244 123 456" value={form.phone}
                      onChange={(e) => setForm({...form, phone: e.target.value})}
                      className="w-full bg-[#050508] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input type="password" required placeholder="Min. 8 characters" value={form.password}
                      onChange={(e) => setForm({...form, password: e.target.value})}
                      className="w-full bg-[#050508] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-all" />
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed text-center mt-4">
                  By creating an account, you agree to Kudi's <Link href="/terms" className="text-[#6366f1]">Terms & Conditions</Link> and <Link href="/privacy" className="text-[#6366f1]">Privacy Policy</Link>.
                </p>

                <button type="submit" disabled={loading || !form.email || !form.password || !form.name}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-[#6366f1] text-white py-3.5 rounded-xl font-bold hover:bg-[#8b5cf6] disabled:opacity-50 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Account"}
                </button>
              </form>
            )}

            <p className="text-center mt-8 text-sm text-gray-400">
              Already have an account? <Link href="/login" className="font-semibold text-white hover:underline">Sign in</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
