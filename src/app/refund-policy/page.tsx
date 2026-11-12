import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mail } from 'lucide-react';

export const metadata = {
  title: 'Refund Policy - Kestral AI Labs',
  description: 'Terms and refund policy for Kestral AI Labs digital services.',
};

export default function RefundPolicyPage() {
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
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200">
              <img
                src="/images/kestral-logo.jpg"
                alt="Kestral AI Labs"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-950">
              Kestral AI Labs
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Kestral AI Labs LLP</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Refund & Cancellation Policy
        </h1>
        <p className="text-xs text-slate-500 mt-2">Last updated: January 2026</p>

        <div className="mt-8 space-y-8 text-sm text-slate-700 leading-relaxed border-t border-slate-200 pt-8">
          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">1. Digital Service Delivery</h2>
            <p className="text-slate-600">
              Kestral AI Labs operates as an instant digital AI service platform delivering ATS resume tailoring, keyword optimization, and resume ranking. Purchases grant immediate access to high-resolution document downloads, AI compute, and digital features.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">2. No Cancellation on Completed Orders</h2>
            <p className="text-slate-600">
              Because document tailoring and PDF generation occur in real-time upon request, completed purchases and generated files cannot be cancelled once generation or download has initiated. We encourage all users to thoroughly review on-screen previews before purchasing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">3. Non-Refundable Items</h2>
            <p className="text-slate-600 mb-2">Refunds will not be issued for:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Change of mind after document generation or export</li>
              <li>Partial usage of services or features</li>
              <li>Failure to read or review input parameters prior to generation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">4. Technical Failure & Redressal</h2>
            <p className="text-slate-600">
              In the rare event of a verified technical error on our platform that prevents you from accessing or downloading your purchased PDF document, please reach out to our support team within 48 hours of purchase. We will promptly investigate and either re-generate your document or restore your access.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <Mail className="w-5 h-5 text-sky-600 shrink-0" />
              <div>
                <div className="font-semibold text-slate-950 text-xs">Customer Support Email</div>
                <a
                  href="mailto:support@kestral.ai"
                  className="text-xs text-sky-600 font-mono hover:underline"
                >
                  support@kestral.ai
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Kestral AI Labs LLP. All rights reserved.
      </footer>
    </div>
  );
}

