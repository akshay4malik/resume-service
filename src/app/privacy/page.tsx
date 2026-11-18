import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mail, MapPin, Lock } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - Kestral AI Labs',
  description: 'Privacy policy and data protection practices for Kestral AI Labs users.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      {/* Top Bar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-base tracking-tight text-slate-950">
              Kestral AI Labs
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold mb-4">
          <Lock className="w-3.5 h-3.5" />
          <span>Data Protection & Privacy</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 mt-2">Last updated: November 2026</p>

        <div className="mt-8 space-y-8 text-sm text-slate-700 leading-relaxed border-t border-slate-200 pt-8">
          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">1. Introduction</h2>
            <p className="text-slate-600">
              Kestral AI Labs (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your personal data and privacy. This Privacy Policy explains how we collect, process, and safeguard your information when you use our resume building, AI optimization, and candidate ranking services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <strong>Account & Profile Information:</strong> Email address, name, and profile details provided during registration (via Google OAuth or email signup).
              </li>
              <li>
                <strong>Resume Content & Documents:</strong> Professional history, educational background, skills, contact details, and career summaries contained in the resumes or job descriptions you upload.
              </li>
              <li>
                <strong>Transaction & Payment Information:</strong> Payment identifiers, order IDs, and credit transaction history. <em>Please note: We do not store or process sensitive credit card numbers or banking passwords on our servers. All financial transactions are securely processed by our certified payment gateway, Razorpay.</em>
              </li>
              <li>
                <strong>Usage & Technical Data:</strong> IP address, device metadata, and browser information collected to prevent fraud and maintain platform security.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">3. How We Use Your Information</h2>
            <p className="text-slate-600 mb-2">We use collected information solely to:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Operate, format, and enhance your resumes using specialized AI models.</li>
              <li>Maintain your digital credit balances and order fulfillment.</li>
              <li>Authenticate user sessions and secure account access.</li>
              <li>Provide customer support, address technical queries, and process eligible refunds.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">4. Third-Party Service Providers</h2>
            <p className="text-slate-600 mb-2">
              We partner with trusted, industry-leading infrastructure providers to deliver our services:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Razorpay:</strong> Payment processing and merchant transactions.</li>
              <li><strong>Supabase:</strong> Encrypted user authentication and database management.</li>
              <li><strong>Cloudflare R2:</strong> Secure cloud storage for generated PDF files.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">5. Data Retention & Deletion Rights</h2>
            <p className="text-slate-600">
              You have the right to request access to, correction of, or complete deletion of your resume files and personal account data at any time. To request account or data removal, please contact our privacy desk at{' '}
              <a href="mailto:info@kestralailabs.com" className="text-sky-600 font-semibold underline">
                info@kestralailabs.com
              </a>.
            </p>
          </section>

          <section className="pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-950 mb-3">6. Privacy Inquiries & Registered Office</h2>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 text-xs">Registered Address</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    VILL PO HISAWADA, Hisauda, Bagpat, Baraut, Uttar Pradesh, India, 250615
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 text-xs">Privacy & Support Contact</div>
                  <a
                    href="mailto:info@kestralailabs.com"
                    className="text-xs text-sky-600 font-mono hover:underline"
                  >
                    info@kestralailabs.com
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Kestral AI Labs. All rights reserved.</div>
          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="/refund-policy" className="hover:text-slate-900 transition">Refund Policy</Link>
            <Link href="/shipping-policy" className="hover:text-slate-900 transition">Delivery Policy</Link>
            <Link href="/contact" className="hover:text-slate-900 transition">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

