"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020205] text-white p-8">
      <div className="max-w-3xl mx-auto py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm font-semibold">
          <ArrowLeft size={16} /> Back to Kudi
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-blue max-w-none space-y-6 text-gray-300">
          <p><strong>Last Updated:</strong> April 2026</p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p>We collect information you explicitly provide during account registration, including your name, email address, and phone number. We also record transaction inputs made on the platform for analytic tracking.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. How We Use Information</h2>
          <p>Kudi uses collected data exclusively for providing the core functionalities of the wallet app, powering the AI advisor outputs, and maintaining the internal state of fraud simulation algorithms.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Information Sharing</h2>
          <p>Kudi is a closed-loop demonstration system. We do not sell, rent, or share your personal data with third parties. Analytics and AI inferences are executed locally or via bounded backend APIs.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Data Security</h2>
          <p>We implement standard cryptographic hashing (BCrypt) to store your password. Access tokens are used to securely link your active session to the provided backend application.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Contact Us</h2>
          <p>If you have any queries regarding this policy, please reach out via our primary engineering channels.</p>
        </div>
      </div>
    </div>
  );
}
