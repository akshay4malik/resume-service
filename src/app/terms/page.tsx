import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mail, MapPin, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - Kestral AI Labs',
  description: 'Terms and conditions governing the use of Kestral AI Labs services and platforms.',
};

export default function TermsPage() {
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
          <FileText className="w-3.5 h-3.5" />
          <span>Legal Agreement</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-xs text-slate-500 mt-2">Last updated: November 2026</p>

        <div className="mt-8 space-y-8 text-sm text-slate-700 leading-relaxed border-t border-slate-200 pt-8">
          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">1. Agreement to Terms</h2>
            <p className="text-slate-600">
              By accessing or using the website, applications, and services provided by Kestral AI Labs (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound by these Terms and Conditions. If you do not agree to all terms, you are prohibited from using the site and our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">2. Description of Services & Digital Credits</h2>
            <p className="text-slate-600 mb-2">
              Kestral AI Labs operates a digital, credit-based artificial intelligence platform providing resume optimization, ATS-friendly formatting, and candidate ranking tools.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Users acquire digital credits through secure online payment processing.</li>
              <li>Credits are loaded to your account immediately upon successful payment verification.</li>
              <li>Services are consumed in real-time as you utilize AI features, downloads, and batch ranking tools.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">3. Payments, Pricing & Billing</h2>
            <p className="text-slate-600">
              Payments are securely processed through authorized payment gateway partners, including Razorpay. Prices for credit packages are clearly displayed on our platform in Indian Rupees (INR) or designated local currency. You agree to provide current, complete, and accurate purchase and account information for all transactions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">4. Refund & Cancellation Terms</h2>
            <p className="text-slate-600">
              Our full Refund and Cancellation Policy is incorporated herein by reference. As a digital service, once credits are added to your account, purchases are final and non-refundable in instances of change of mind. If a genuine technical error prevents service delivery, users may contact us via email, and eligible resolutions (service completion or refund to original payment method within 5–7 business days) will be provided pursuant to our{' '}
              <Link href="/refund-policy" className="text-sky-600 font-semibold underline">
                Refund & Cancellation Policy
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">5. User Accounts & Content Ownership</h2>
            <p className="text-slate-600 mb-2">
              You retain full ownership of all resume documents, personal information, and professional text you upload to our platform. You grant Kestral AI Labs a limited, non-exclusive license solely to process, analyze, and format your documents as directed by you. You are responsible for maintaining the confidentiality of your account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">6. Intellectual Property</h2>
            <p className="text-slate-600">
              All platform software, resume layout templates, user interface designs, logos, and proprietary algorithms are the exclusive property of Kestral AI Labs. You may not copy, reverse engineer, or commercially distribute platform assets without express written consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">7. Disclaimer & Limitation of Liability</h2>
            <p className="text-slate-600">
              Our AI resume tools are designed to assist and enhance career application documents. We do not guarantee employment, interview invitations, or specific career outcomes. In no event shall Kestral AI Labs be liable for any indirect, incidental, or consequential damages arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-950 mb-2">8. Governing Law & Jurisdiction</h2>
            <p className="text-slate-600">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts of Uttar Pradesh, India.
            </p>
          </section>

          <section className="pt-4 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-950 mb-3">9. Contact & Registered Details</h2>
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
                  <div className="font-semibold text-slate-900 text-xs">Official Support Email</div>
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

