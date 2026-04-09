"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Activity, Lock, Eye, Globe, CheckCircle2, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-[100dvh] bg-[#020205] overflow-hidden text-white w-full">

      {/* Navigation */}
      <nav className="absolute top-0 w-full p-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            ₵
          </div>
          <span className="font-bold text-xl tracking-tight">Kudi</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#security" className="hover:text-white transition-colors">Security</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2.5 text-sm font-medium hover:bg-white/5 rounded-full transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="px-5 py-2.5 text-sm font-medium bg-white text-black hover:bg-gray-200 rounded-full transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ─── HERO SECTION with background image ─── */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center px-8 overflow-hidden w-full">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image src="/kudi_hero_bg.png" alt="Kudi Hero Background" fill sizes="100vw" className="object-cover opacity-40" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020205]/60 via-transparent to-[#020205]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020205]/80 via-transparent to-[#020205]/80" />
        </div>

        {/* Purple glow blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6366f1] opacity-[0.12] blur-[150px] rounded-full pointer-events-none z-10" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#a855f7] opacity-[0.12] blur-[150px] rounded-full pointer-events-none z-10" />

        <main className="relative pt-24 pb-32 max-w-5xl mx-auto flex flex-col items-center z-20">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.05] premium-gradient-text"
          >
            Finance, elegantly <br className="hidden md:block" /> engineered.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mb-12 leading-relaxed"
          >
            Experience the future of banking. AI-powered fraud detection, instant global transfers, and real-time insights—all in one beautifully crafted platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <Link href="/register" className="flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Open an account <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="flex items-center justify-center px-8 py-4 text-base font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all rounded-full backdrop-blur-md">
              Sign in to your account
            </Link>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="mt-24 w-full relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-transparent to-transparent z-10 h-full w-full" />
            <div className="glass-card aspect-video w-full rounded-t-[2rem] border-b-0 overflow-hidden relative shadow-[0_-20px_80px_rgba(99,102,241,0.15)] flex justify-center items-end bg-[#0a0a0f]">
              <div className="w-[90%] h-[90%] rounded-t-2xl bg-[#0f0f16] border border-white/5 border-b-0 flex flex-col p-6 overflow-hidden relative">
                <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6366f1] to-purple-500" />
                    <div>
                      <div className="w-32 h-4 bg-white/10 rounded-full mb-2" />
                      <div className="w-20 h-3 bg-white/5 rounded-full" />
                    </div>
                  </div>
                  <div className="w-40 h-10 bg-white/5 rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                      <div className="w-10 h-10 rounded-full bg-[#6366f1]/20" />
                      <div className="w-24 h-6 bg-white/10 rounded-full" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex-1 bg-white/5 rounded-xl border border-white/5 w-full"/>
              </div>
            </div>
          </motion.div>
        </main>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="py-32 px-8 max-w-7xl mx-auto relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Built for real-world finance</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Everything you need to manage money confidently, securely, and intelligently.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ShieldCheck className="text-[#6366f1]" size={32} />}
            title="AI Fraud Detection"
            desc="Our GradientBoosting models analyze every transaction in microseconds, blocking fraud before it happens."
          />
          <FeatureCard
            icon={<Zap className="text-purple-400" size={32} />}
            title="Instant Transfers"
            desc="Send money globally in seconds. Integrated seamlessly with Ghana's Mobile Money and all major banks."
          />
          <FeatureCard
            icon={<Activity className="text-green-400" size={32} />}
            title="Smart Analytics"
            desc="Auto-categorization of expenses with a 100% accurate RandomForest model to help you budget better."
          />
        </div>
      </section>

      {/* ─── SECURITY SECTION ─── */}
      <section id="security" className="relative py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image src="/kudi_security_bg.png" alt="Security Background" fill sizes="100vw" className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020205] via-[#020205]/70 to-[#020205]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
              <ShieldCheck size={14} /> Bank-Grade Encryption
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Your money is always safe</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Kudi employs multiple layers of military-grade security to ensure your funds and personal data remain fully protected at all times.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Lock size={24} />, title: "256-bit AES Encryption", desc: "All data at rest and in transit is encrypted using AES-256, the same standard used by governments and banks worldwide." },
              { icon: <Eye size={24} />, title: "Real-Time Fraud Monitoring", desc: "Our AI engine monitors every transaction 24/7, detecting anomalies and blocking suspicious activity before it affects you." },
              { icon: <ShieldCheck size={24} />, title: "JWT Auth & Token Rotation", desc: "Secure JSON Web Tokens with 15-minute expiry and rolling refresh tokens protect every session from hijacking." },
              { icon: <Globe size={24} />, title: "Multi-Origin CORS Policy", desc: "Strict Cross-Origin policies prevent unauthorized clients from accessing your API endpoints." },
              { icon: <Activity size={24} />, title: "Atomic DB Transactions", desc: "Every balance mutation uses MongoDB atomic operators eliminating race conditions and double-spend vulnerabilities." },
              { icon: <CheckCircle2 size={24} />, title: "Rate Limiting", desc: "Aggressive API rate limits block brute-force attacks on login and registration endpoints automatically." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 rounded-2xl border border-blue-500/10 hover:border-blue-500/30 hover:-translate-y-1 transition-all"
              >
                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section id="pricing" className="relative py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image src="/kudi_pricing_bg.png" alt="Pricing Background" fill sizes="100vw" className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020205] via-[#020205]/60 to-[#020205]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Start free and grow at your own pace. No hidden charges, ever.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter", price: "Free", period: "", color: "border-white/10",
                features: ["1 virtual card", "₵5,000 monthly limit", "Standard transfers", "Basic analytics", "Email support"],
                cta: "Get started free", ctaStyle: "bg-white/5 border border-white/10 hover:bg-white/10"
              },
              {
                name: "Pro", price: "₵29", period: "/month", color: "border-[#6366f1]/50", badge: "Most Popular",
                features: ["3 virtual cards", "₵50,000 monthly limit", "Priority transfers", "AI analytics & advisor", "Fraud Shield Pro", "24/7 support"],
                cta: "Upgrade to Pro", ctaStyle: "bg-[#6366f1] hover:bg-[#8b5cf6] shadow-[0_0_20px_rgba(99,102,241,0.4)]"
              },
              {
                name: "Business", price: "₵99", period: "/month", color: "border-white/10",
                features: ["Unlimited virtual cards", "Unlimited volume", "Team accounts", "Custom analytics", "Dedicated account manager", "SLA guarantee"],
                cta: "Contact sales", ctaStyle: "bg-white/5 border border-white/10 hover:bg-white/10"
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className={`glass-card rounded-3xl p-8 border ${plan.color} relative flex flex-col`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6366f1] text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                    <Star size={10} /> {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle2 size={16} className="text-[#6366f1] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`w-full text-center py-3 rounded-xl font-bold text-white transition-all ${plan.ctaStyle}`}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-8 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] rounded-md flex items-center justify-center font-bold text-xs">₵</div>
          <span className="font-bold text-white">Kudi</span>
        </div>
        <div className="flex justify-center gap-6 mb-4 text-sm">
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#security" className="hover:text-white transition-colors">Security</Link>
        </div>
        <p>© {new Date().getFullYear()} Kudi Financial Technologies. Built in Ghana 🇬🇭</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      viewport={{ once: true }}
      className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300"
    >
      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
    </motion.div>
  );
}
