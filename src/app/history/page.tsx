'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserMenu } from '@/components/auth/UserMenu';
import { PricingModal } from '@/components/payments/PricingModal';
import {
  History,
  Coins,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Target,
  Mail,
  Loader2,
  Download,
  ExternalLink,
} from 'lucide-react';

export default function UserHistoryPage() {
  const { user, credits, loading: authLoading } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'resumes' | 'activity' | 'credits'>('resumes');
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [resumesRes, histRes, credRes] = await Promise.all([
          fetch('/api/resumes'),
          fetch('/api/user/history'),
          fetch('/api/credits'),
        ]);

        if (resumesRes.ok) {
          const r = await resumesRes.json();
          setResumes(r.resumes || []);
        }

        if (histRes.ok) {
          const d = await histRes.json();
          setHistory(d.history || []);
        }

        if (credRes.ok) {
          const c = await credRes.json();
          setTransactions(c.transactions || []);
        }
      } catch (err) {
        console.error('Failed to load user history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Please sign in to view your activity</h2>
        <p className="text-xs text-slate-600 mb-6">Sign in with your Google account to track resumes, rankings, and credits.</p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-slate-950 text-white font-semibold text-xs hover:bg-slate-800 transition"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
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
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold text-slate-600">Activity & Credits</span>
            </div>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Balance Overview Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Credit Balance
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-950 tracking-tight">
                {credits?.current_balance ?? 100}
              </span>
              <span className="text-sm font-semibold text-slate-500">Credits Available</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Resume builds: 50 credits ea • Candidate rankings: 2 credits ea
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPricing(true)}
              className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm"
            >
              <Coins className="w-4 h-4" />
              <span>Top Up Credits</span>
            </button>
            <Link
              href="/builder"
              className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition"
            >
              Create New Resume
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('resumes')}
            className={`pb-3 text-xs font-bold px-3 transition border-b-2 flex items-center gap-2 ${
              activeTab === 'resumes'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Resumes ({resumes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 text-xs font-bold px-3 transition border-b-2 flex items-center gap-2 ${
              activeTab === 'activity'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Service History ({history.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`pb-3 text-xs font-bold px-3 transition border-b-2 flex items-center gap-2 ${
              activeTab === 'credits'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Credit Transactions ({transactions.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-20 flex items-center justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
          </div>
        ) : activeTab === 'resumes' ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {resumes.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No resumes saved yet</p>
                <p className="text-slate-500 mt-1">Build or optimize a resume to store it here.</p>
                <Link
                  href="/builder"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                >
                  Create Your First Resume
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {resumes.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <span>{item.title || 'Untitled Resume'}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono uppercase">
                            {item.template_id}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Created {new Date(item.created_at).toLocaleDateString()}</span>
                          {item.ats_score && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 font-semibold">ATS Score: {item.ats_score}/100</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/builder?resumeId=${item.id}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Studio</span>
                      </Link>
                      {item.pdf_storage_key && (
                        <a
                          href={`/api/resumes/${item.id}/download`}
                          download
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'activity' ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {history.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No services executed yet. Create your first resume or rank candidates!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        {item.service_type === 'RESUME_BUILD' ? (
                          <FileText className="w-4 h-4 text-sky-600" />
                        ) : item.service_type === 'RESUME_RANKING' ? (
                          <Target className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Mail className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{item.service_type.replace('_', ' ').toLowerCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        -{item.credits_used} Credits
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {transactions.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No credit transactions logged yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{tx.description}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleString()} • Balance after: {tx.balance_after}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          tx.transaction_type === 'DEBIT'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {tx.transaction_type === 'DEBIT' ? `-${tx.amount}` : `+${tx.amount}`} Credits
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  );
}

