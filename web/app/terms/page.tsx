"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020205] text-white p-8">
      <div className="max-w-3xl mx-auto py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm font-semibold">
          <ArrowLeft size={16} /> Back to Kudi
        </Link>
        <h1 className="text-4xl font-bold tracking-tight mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-invert prose-blue max-w-none space-y-6 text-gray-300">
          <p><strong>Last Updated:</strong> April 2026</p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>By downloading, accessing, or using the Kudi application and services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the service.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Description of Service</h2>
          <p>Kudi provides a digital financial interface facilitating basic wallet transactions, mock AI advisory logic, and payment routing simulation. The service is provided "as is".</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Account Registration</h2>
          <p>Users must provide accurate, current, and complete information during the registration process. You are responsible for safeguarding your password and account details.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Privacy and Data Security</h2>
          <p>We respect your privacy. Kudi processes your data in accordance with our Privacy Policy. All mock transactions are locally sandboxed but you agree not to submit real, highly sensitive personal financial information into the demonstration app.</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Modifications to Service</h2>
          <p>Kudi reserves the right to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice.</p>
        </div>
      </div>
    </div>
  );
}
