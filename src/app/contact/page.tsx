import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Contact Us - Kestral AI Labs',
  description: 'Contact details, support inquiries, and registered office address for Kestral AI Labs.',
};

export default function ContactPage() {
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
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Support & Inquiries</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Contact Us
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          We are here to assist you with any questions regarding our AI resume services, credit purchases, or technical support.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Customer Support Email */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">Customer Support</h3>
              <p className="text-xs text-slate-600 mb-4">
                For technical issues, payment verifications, credit balances, or refund queries:
              </p>
            </div>
            <div>
              <a
                href="mailto:info@kestralailabs.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700 underline"
              >
                info@kestralailabs.com
              </a>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Response window: 5 to 7 business days</span>
              </div>
            </div>
          </div>

          {/* Card 2: Registered Address */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">Registered Entity Address</h3>
              <p className="text-xs text-slate-600 mb-2">
                Legal Business Entity: <strong>Kestral AI Labs</strong>
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-700 leading-relaxed font-mono bg-white p-3 rounded-xl border border-slate-200">
                VILL PO HISAWADA, Hisauda, Bagpat, Baraut, Uttar Pradesh, India, 250615
              </p>
            </div>
          </div>
        </div>

        {/* Support Instructions */}
        <div className="mt-10 p-6 rounded-2xl bg-sky-50/50 border border-sky-100 text-xs text-slate-600 space-y-2">
          <h4 className="font-bold text-slate-900 text-sm">Need help with a transaction?</h4>
          <p>
            When emailing us about a payment or credit allocation issue, please include your <strong>registered email address</strong> and the <strong>Razorpay Payment ID</strong> (e.g., <code className="bg-white px-1.5 py-0.5 rounded-sm border border-slate-200">pay_...</code>) received in your receipt email for faster resolution.
          </p>
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

