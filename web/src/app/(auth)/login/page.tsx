"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] text-white flex overflow-hidden w-full">
      {/* Left panel — background image */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center p-16 overflow-hidden">
        <Image src="/kudi_hero_bg.png" alt="Kudi background" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020205]/20 to-[#020205]/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020205]/60 via-transparent to-[#020205]/60" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] rounded-2xl flex items-center justify-center font-bold text-2xl shadow-[0_0_30px_rgba(99,102,241,0.5)] mb-6 mx-auto">
            ₵
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Welcome back <br/>to Kudi</h2>
          <p className="text-gray-300 text-lg max-w-sm leading-relaxed">Your financial command centre. Secure, fast, and always in your control.</p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="w-full lg:w-1/2 relative flex flex-col justify-center items-center p-8 bg-[#020205]">
        {/* Mobile background */}
        <div className="absolute inset-0 lg:hidden">
          <Image src="/kudi_hero_bg.png" alt="bg" fill sizes="100vw" className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-[#020205]/80" />
        </div>
        {/* Glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#6366f1] opacity-[0.07] blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-12 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] rounded-lg flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              ₵
            </div>
            <span className="font-bold tracking-tight">Kudi</span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-10">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Sign in</h1>
              <p className="text-gray-400 text-sm">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleLogin} className="glass-card rounded-3xl p-8 space-y-6">
              {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-semibold">{error}</div>}
              
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email" 
                    required
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#050508] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-400">Password</label>
                  <Link href="#" className="text-xs font-semibold text-[#6366f1] hover:text-[#8b5cf6]">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#050508] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !email || !password}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-[#6366f1] text-white py-3.5 rounded-xl font-bold hover:bg-[#8b5cf6] disabled:opacity-50 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign in <ArrowRight size={16} /></>}
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-gray-400">
              Don't have an account? <Link href="/register" className="font-semibold text-white hover:underline">Create one</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
