import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mail, MapPin, Zap, Clock } from 'lucide-react';

export const metadata = {
  title: 'Shipping & Delivery Policy - Kestral AI Labs',
  description: 'Instant digital delivery policy for Kestral AI Labs services and credits.',
};

export default function ShippingPolicyPage() {
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
          <Zap className="w-3.5 h-3.5" />
          <span>Electronic Delivery</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Shipping & Digital Delivery Policy
        </h1>
        <p className="text-xs text-slate-500 mt-2">Last updated: November 2026</p>

        <div className="mt-8 space-y-8 text-sm text-slate-700 leading-relaxed border-t border-slate-200 pt-8">
          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">1. Purely Digital Services (No Physical Shipping)</h2>
            <p className="text-slate-600">
              Kestral AI Labs provides electronic software, AI document optimization, and resume ranking tools. <strong>No physical products, parcels, or paper documents are shipped to postal addresses.</strong> All transactions correspond to digital credit allotments and downloadable electronic assets (PDF documents, ATS analysis, and candidate scorecards).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">2. Delivery Method & Instant Fulfillment</h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mt-3">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Instant Online Delivery Timeline</span>
              </div>
              <p className="text-xs text-slate-600">
                Upon successful confirmation of payment by our payment gateway (Razorpay), your purchased credits are <strong>immediately and automatically credited</strong> to your account dashboard. You can instantly access, build, and download your resumes and rankings without any waiting period.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">3. Shipping Fees & Delivery Charges</h2>
            <p className="text-slate-600">
              Because all products and services are fulfilled digitally over the internet, there are <strong>zero shipping, handling, or courier fees</strong> associated with any purchase on Kestral AI Labs.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">4. Non-Receipt or Delayed Digital Credits</h2>
            <p className="text-slate-600">
              In rare instances where a bank transaction succeeds but network latency prevents your credit balance from updating automatically, please email our support team at{' '}
              <a href="mailto:info@kestralailabs.com" className="text-sky-600 font-semibold underline">
                info@kestralailabs.com
              </a>{' '}
              with your Razorpay payment ID. Our team will verify and manually reflect your credits or address the matter within <strong>5 to 7 business days</strong>.
            </p>
          </section>

          <section className="pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-950 mb-3">5. Registered Business Address</h2>
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
                  <div className="font-semibold text-slate-900 text-xs">Support Email</div>
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

