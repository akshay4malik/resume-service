import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mail, MapPin, Clock, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Refund & Cancellation Policy - Kestral AI Labs',
  description: 'Cancellation and refund terms for Kestral AI Labs digital services and credits.',
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
          <span>Kestral AI Labs</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Refund & Cancellation Policy
        </h1>
        <p className="text-xs text-slate-500 mt-2">Last updated: November 2026</p>

        <div className="mt-8 space-y-8 text-sm text-slate-700 leading-relaxed border-t border-slate-200 pt-8">
          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">1. Digital Credit & Instant Service Delivery</h2>
            <p className="text-slate-600">
              Kestral AI Labs provides digital AI services (including AI resume optimization, ATS formatting, and resume ranking) on a credit-based model. Services are delivered electronically: as soon as credits are added to your account, they are immediately available for use, and our AI generation and ranking services are fulfilled instantly upon submission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">2. Cancellation & Change of Mind</h2>
            <p className="text-slate-600">
              Once a user has purchased and added credits to their account, the transaction is considered complete. If a user subsequently changes their mind about utilizing the platform or services, <strong>no refunds or cancellations will be provided</strong>. We encourage all users to explore free features, previews, and service specifications before making a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">3. Technical Issues & Genuine Service Failure</h2>
            <p className="text-slate-600 mb-2">
              If an error or technical glitch on our platform prevents you from receiving the intended service despite credits being deducted or payment being processed:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                You can report the issue by reaching out to our official support team at{' '}
                <a href="mailto:info@kestralailabs.com" className="text-sky-600 font-semibold underline">
                  info@kestralailabs.com
                </a>{' '}
                with your registered account email, transaction details, and description of the glitch.
              </li>
              <li>
                <strong>Resolution Options:</strong> If our support team verifies the technical failure as genuine, you may choose either:
                <ol className="list-decimal pl-6 mt-1 space-y-1">
                  <li>To have the service fulfilled or the consumed credits re-credited to your account at no additional cost; OR</li>
                  <li>A full refund of the amount for that specific failed transaction, processed as per your request.</li>
                </ol>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">4. Support Response & Refund Timelines</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs mb-1">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span>Support Response Window</span>
                </div>
                <p className="text-xs text-slate-600">
                  Once a service or support request is raised via email, you will receive an initial response and resolution update within <strong>5 to 7 business days</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Refund Processing Window</span>
                </div>
                <p className="text-xs text-slate-600">
                  Upon approval of a refund request, the refund will be initiated and credited back to your <strong>original payment method</strong> (credit/debit card, net banking, or UPI) within <strong>5 to 7 business days</strong>.
                </p>
              </div>
            </div>
          </section>

          <section className="pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-950 mb-3">5. Company Contact & Registered Address</h2>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 text-xs">Registered Office Address</div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    VILL PO HISAWADA, Hisauda, Bagpat, Baraut, Uttar Pradesh, India, 250615
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 text-xs">Customer Support Email</div>
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
            <Link href="/shipping-policy" className="hover:text-slate-900 transition">Delivery Policy</Link>
            <Link href="/contact" className="hover:text-slate-900 transition">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
