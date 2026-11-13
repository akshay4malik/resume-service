'use client';

import React from 'react';
import Link from 'next/link';
import {
  Target,
  ArrowRight,
  CheckCircle2,
  Upload,
  Cpu,
  BarChart3,
  Layers,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';
import { UserMenu } from '@/components/auth/UserMenu';
import { useGeoPricing } from '@/lib/useGeoPricing';

export default function ResumeRankerOverviewPage() {
  const { isIndia } = useGeoPricing();
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1E293B] font-sans antialiased selection:bg-sky-500 selection:text-white flex flex-col justify-between">
      {/* ── Top Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-sand-border group-hover:border-sky-500 transition-colors bg-white flex items-center justify-center">
              <img
                src="/images/kestral-logo.jpg"
                alt="Kestral AI Labs"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#0F172A]">
              Kestral AI Labs
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white text-sky-700 border border-[#E8E8E3] font-medium ml-2 shadow-2xs">
              Recruiter Ranker
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
            <Link href="/" className="hover:text-[#0F172A] transition-colors">
              Resume Builder
            </Link>
            <a href="#how-it-works" className="hover:text-[#0F172A] transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-[#0F172A] transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <UserMenu />
            <Link
              href="/ranking/app"
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-all"
            >
              <Target className="w-4 h-4" />
              <span>Launch Ranker Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main>
        <section className="pt-20 pb-20 px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E8E3] text-xs font-semibold text-sky-800 mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>AI Applicant Scoring & Batch Screening</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.15]">
            Rank hundreds of candidate resumes against your job criteria in minutes.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Eliminate manual resume screening. Upload candidate PDFs in bulk, benchmark against your exact Job Description, and receive an objective 0–100 score with explainable AI remarks.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/ranking/app"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0F172A] hover:bg-sky-600 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2.5"
            >
              <Target className="w-4 h-4 text-sky-400" />
              <span>Start Candidate Ranking</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#pricing"
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white hover:bg-[#F4F4F0] text-[#334155] font-semibold text-sm border border-[#E8E8E3] transition-all flex items-center justify-center gap-2 shadow-2xs"
            >
              View Flat Pricing ({isIndia ? '₹2' : '$0.04'} / resume)
            </a>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-20 bg-[#F4F4F0] border-y border-[#E8E8E3] px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold tracking-widest uppercase text-sky-600">
                Workflow
              </span>
              <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mt-2">
                How Resume Ranker Works
              </h2>
              <p className="mt-3 text-[#64748B] text-sm">
                Built for recruiting agencies, hiring managers, and talent acquisition teams handling large volumes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-2xl border border-[#E8E8E3] shadow-xs relative">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 font-black text-sm flex items-center justify-center mb-5">
                  1
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">Create Job Opening & JD</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Provide your target job role and paste the complete Job Description, required competencies, years of experience, and essential technical stack.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-2xl border border-[#E8E8E3] shadow-xs relative">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 font-black text-sm flex items-center justify-center mb-5">
                  2
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">Upload Candidate PDFs</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Drag and drop 5, 20, or 100+ applicant PDF resumes. Files are uploaded directly to secure Cloudflare R2 storage and batched safely.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-2xl border border-[#E8E8E3] shadow-xs relative">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 font-black text-sm flex items-center justify-center mb-5">
                  3
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">Instant Leaderboard & Scores</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Workers analyze applicants asynchronously, generating an objective 0–100 match index, qualification summary, and shortlist ranking table.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Key Advantages ── */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-sky-600">
                Engineered for Scale
              </span>
              <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mt-2">
                Non-blocking batch processing with atomic database locking.
              </h2>
              <div className="mt-6 space-y-4 text-xs text-[#64748B] leading-relaxed">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Batch queue of 5:</strong> Large uploads never hang or time out. A background queue processes files in non-blocking batches of 5 with atomic row-locking.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Explainable reasoning:</strong> No black-box scores. Every candidate row provides clear point-by-point pros, cons, and JD alignment.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Fast PDF downloads:</strong> One-click download links for every processed candidate file from Cloudflare R2.
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#0F172A] rounded-3xl p-7 text-white shadow-xl border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400">Candidate Leaderboard</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  98% Match Top Candidate
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">candidate_sarah_chen.pdf</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">8+ yrs React, Node.js, Cloud Architect</div>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950">
                    94 / 100
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">david_miller_cv.pdf</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">5 yrs Full Stack, Strong System Design</div>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-sky-500 text-slate-950">
                    86 / 100
                  </span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">applicant_4092.pdf</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Junior background, missing cloud experience</div>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950">
                    52 / 100
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Flat Pricing Section ── */}
        <section id="pricing" className="py-20 bg-[#F4F4F0] border-t border-[#E8E8E3] px-6">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-xs font-bold tracking-widest uppercase text-sky-600">
              Simple, Transparent Pricing
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mt-2">
              Flat {isIndia ? '₹2' : '$0.04'} per resume ranking. No subscriptions.
            </h2>
            <p className="mt-3 text-[#64748B] text-sm max-w-xl mx-auto">
              Pay only for what you evaluate. No monthly commitments, hidden charges, or minimum contract sizes.
            </p>

            <div className="mt-10 max-w-md mx-auto bg-white rounded-3xl border-2 border-sky-500 p-8 shadow-xl text-left relative">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-sky-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
                Flat Rate
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-[#0F172A] tracking-tight">
                  {isIndia ? '₹2' : '$0.04'}
                </span>
                <span className="text-sm font-semibold text-[#64748B]">/ candidate resume</span>
              </div>
              <p className="text-xs text-sky-700 font-semibold mt-1">
                {isIndia ? '2 Credits = ₹2.00 per resume' : '2 Credits = $0.04 per resume ($4 for 100 candidates)'}
              </p>

              <div className="mt-6 pt-6 border-t border-[#E8E8E3] space-y-3 text-xs text-[#334155]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100 Free Starter Credits on Signup (50 Free Ranks)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deep 0–100 Objective JD Match Scoring</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Explainable AI pros, cons, and key qualification remarks</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Batch uploads via secure Cloudflare R2</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Export and download sorted shortlists anytime</span>
                </div>
              </div>

              <Link
                href="/ranking/app"
                className="mt-8 w-full py-3.5 rounded-xl bg-[#0F172A] hover:bg-sky-600 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Open Candidate Ranker</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#94A3B8]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>Instant activation • 100% Secure Checkout</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#FAFAF8] border-t border-[#E8E8E3] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <div>
            © {new Date().getFullYear()} Kestral AI Labs LLP. All rights reserved.
          </div>
          <div className="flex items-center gap-6 font-medium text-[#475569]">
            <Link href="/" className="hover:text-[#0F172A] transition">
              Resume Builder ({isIndia ? '₹50' : '$1'} / resume)
            </Link>
            <Link href="/ranking/app" className="hover:text-[#0F172A] transition">
              Recruiter Dashboard
            </Link>
            <Link href="/refund-policy" className="hover:text-[#0F172A] transition">
              Refund Policy
            </Link>
            <a href="mailto:info@kestralailabs.com" className="hover:text-[#0F172A] transition">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

