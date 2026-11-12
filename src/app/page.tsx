'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Briefcase,
  Users,
  Target,
  FileText,
  Check,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { TEMPLATES } from '@/components/pdf/DynamicResumeTemplate';
import { UserMenu } from '@/components/auth/UserMenu';

export default function ReziInspiredHomePage() {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* ── 1. Top Navbar (Clean header matching theme) ──── */}
      <header className="sticky top-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-sand-border transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-sand-border group-hover:border-sky-500 transition-colors bg-white flex items-center justify-center">
              <img
                src="/images/kestral-logo.jpg"
                alt="Kestral AI Labs"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-ink-dark">
              Kestral AI Labs
            </span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-muted">
            <Link href="/builder" className="hover:text-ink-dark transition-colors">
              Resume Builder
            </Link>
            <a href="#templates" className="hover:text-ink-dark transition-colors">
              Templates
            </a>
            <a href="#pricing" className="hover:text-ink-dark transition-colors">
              Pricing
            </a>
            <Link
              href="/ranking"
              className="hover:text-ink-dark transition-colors flex items-center gap-1.5 text-sky-700 font-semibold"
            >
              <Briefcase className="w-3.5 h-3.5" />
              For Recruiters
            </Link>
          </nav>

          {/* Action CTAs & Auth */}
          <div className="flex items-center gap-3">
            <UserMenu />
            <Link
              href="/builder"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-ink-dark hover:bg-slate-800 text-white shadow-xs transition-all"
            >
              <span>Build Your Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section ──────────────── */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Subtle Radial Sky Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-sky-200/40 via-indigo-100/30 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-canvas-card border border-sand-border text-xs font-semibold text-ink-muted mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>ATS-Optimized Resumes & Real-Time Formatting</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-ink-dark tracking-tight max-w-4xl mx-auto leading-[1.1]">
          The AI resume builder that gets you <span className="text-sky-600">hired faster</span>.
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-lg sm:text-xl text-ink-muted max-w-2xl mx-auto font-normal leading-relaxed">
          Create ATS-tailored, interview-winning resumes in seconds with AI. Choose from 8 recruiter-approved minimalist templates.
        </p>

        {/* Main Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/builder"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-ink-dark hover:bg-sky-600 text-white font-semibold text-sm shadow-md hover:shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Create Your Resume Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#templates"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-canvas-card hover:bg-canvas-subtle text-ink font-semibold text-sm border border-sand-border transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            Explore 8 ATS Templates
          </a>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-14 pt-8 border-t border-sand-border flex flex-wrap items-center justify-center gap-8 text-xs text-ink-subtle uppercase tracking-widest font-semibold">
          <span>AI-Powered</span>
          <span>•</span>
          <span>100% ATS-Compliant</span>
          <span>•</span>
          <span>Zero pdflatex Overhead</span>
          <span>•</span>
          <span>Instant PDF Export</span>
        </div>
      </section>

      {/* ── 3. Visual Resume Showcase ─────────────────────────────────────── */}
      <section className="pb-24 px-6 max-w-6xl mx-auto">
        <div className="bg-canvas-subtle p-4 sm:p-6 rounded-3xl border border-sand-border shadow-lg">
          {/* Top Bar of the Mock Editor */}
          <div className="bg-canvas-card px-5 py-3.5 rounded-2xl border border-sand-border flex flex-wrap items-center justify-between gap-4 mb-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-ink-dark flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-sky-600" />
                Live Template Gallery
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                ATS Score: 98/100
              </span>
            </div>

            {/* Template Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {TEMPLATES.slice(0, 4).map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplateIndex(idx)}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                    selectedTemplateIndex === idx
                      ? 'bg-ink-dark text-white shadow-xs'
                      : 'text-ink-muted hover:bg-canvas hover:text-ink-dark'
                  }`}
                >
                  {t.name}
                </button>
              ))}
              <Link
                href="/builder"
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold px-2"
              >
                +4 More in Studio →
              </Link>
            </div>
          </div>

          {/* Featured Resume Preview Mockup */}
          <div className="bg-canvas-card rounded-2xl border border-sand-border overflow-hidden shadow-xs flex flex-col md:flex-row">
            {/* Visual Thumbnail Image */}
            <div className="md:w-1/2 p-6 bg-canvas flex items-center justify-center border-b md:border-b-0 md:border-r border-sand-border">
              <img
                src={TEMPLATES[selectedTemplateIndex]?.previewUrl || '/previews/template1.png'}
                alt={TEMPLATES[selectedTemplateIndex]?.name}
                className="w-full max-w-sm rounded-lg shadow-md border border-sand-border object-contain hover:scale-102 transition-transform duration-300"
              />
            </div>

            {/* Template Value & Feature List */}
            <div className="md:w-1/2 p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold tracking-wider uppercase text-sky-600">
                  {TEMPLATES[selectedTemplateIndex]?.category || 'Professional Classic'}
                </span>
                <h3 className="text-2xl font-bold text-ink-dark mt-1">
                  {TEMPLATES[selectedTemplateIndex]?.name}
                </h3>
                <p className="text-sm text-ink-muted mt-2 leading-relaxed">
                  {TEMPLATES[selectedTemplateIndex]?.description}
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-ink">
                      <strong>Single-page ATS geometry:</strong> Standard 1-inch margins and linear typography parsers love.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-ink">
                      <strong>Keyword-density optimized:</strong> Scans target job descriptions and aligns core technical skills.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-ink">
                      <strong>Client-side vector rendering:</strong> Zero latency rendering directly inside your browser.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-sand-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-ink-subtle block">Output Format</span>
                  <span className="text-xs font-semibold text-ink">Vector PDF & ATS Text</span>
                </div>
                <Link
                  href="/builder"
                  className="px-5 py-2.5 rounded-xl bg-ink-dark hover:bg-sky-600 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                >
                  Use This Template
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Core Features ──────────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-canvas-subtle border-t border-sand-border px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-sky-600">
              Simplicity Meets AI
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-dark tracking-tight mt-2">
              Everything you need to beat the ATS. Nothing you don't.
            </h2>
            <p className="mt-3 text-ink-muted text-sm">
              Most resume tools overload documents with icons and complex columns that break ATS software. Kestral AI Labs guarantees clean, readable, high-ranking results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-canvas-card p-8 rounded-2xl border border-sand-border shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-ink-dark mb-2">Instant PDF Import</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Upload your existing resume in PDF format. Our edge extraction engine parses all job histories, degrees, and skills into structured editable fields in seconds.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-sand-border text-xs font-semibold text-sky-700">
                100% Client-Side Parsing →
              </div>
            </div>

            <div className="bg-canvas-card p-8 rounded-2xl border border-sand-border shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-ink-dark mb-2">AI-Powered Tailoring</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Paste the job description of your target role. AI optimizes your bullet points with high-impact action verbs and exact target keywords.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-sand-border text-xs font-semibold text-sky-700">
                Contextual ATS Keyword Tuning →
              </div>
            </div>

            <div className="bg-canvas-card p-8 rounded-2xl border border-sand-border shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-ink-dark mb-2">8 Curated Layouts</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  All templates have been vetted by recruiters to ensure maximum readability, typography hierarchy, and zero parsing errors in Taleo, Greenhouse, and Lever.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-sand-border text-xs font-semibold text-sky-700">
                Guaranteed Recruiter Clarity →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. All 8 Templates Gallery ─────────────────────────────────────── */}
      <section id="templates" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-sky-600">
            Design Standards
          </span>
          <h2 className="text-3xl font-extrabold text-ink-dark tracking-tight mt-1">
            Choose from 8 Proven ATS Formats
          </h2>
          <p className="mt-2 text-ink-muted text-sm">
            Carefully crafted typography, line heights, and margins inspired by top career coaches.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="bg-canvas-card border border-sand-border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col"
            >
              <div className="h-44 bg-canvas relative overflow-hidden flex items-center justify-center border-b border-sand-border">
                <img
                  src={t.previewUrl}
                  alt={t.name}
                  className="w-full h-full object-cover object-top group-hover:scale-104 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm text-ink-dark">{t.name}</div>
                  <div className="text-xs text-ink-muted mt-0.5">{t.category}</div>
                </div>
                <Link
                  href="/builder"
                  className="mt-4 w-full py-1.5 rounded-lg border border-sand-border hover:border-slate-300 text-xs font-semibold text-ink hover:text-ink-dark text-center transition bg-canvas hover:bg-canvas-card"
                >
                  Use Template
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Resume Builder Transparent Flat Pricing ────────────────────── */}
      <section id="pricing" className="py-20 bg-canvas-subtle border-t border-sand-border px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold tracking-widest uppercase text-sky-600">
            Transparent Pricing
          </span>
          <h2 className="text-3xl font-extrabold text-ink-dark tracking-tight mt-2">
            Flat ₹50 per resume build. Zero subscriptions.
          </h2>
          <p className="mt-3 text-ink-muted text-sm max-w-xl mx-auto">
            Design, tailor with AI against any target job description, and export pixel-perfect ATS PDFs. No monthly lock-in.
          </p>

          <div className="mt-10 max-w-md mx-auto bg-canvas-card rounded-3xl border-2 border-sky-500 p-8 shadow-xl text-left relative">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-sky-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
              Flat Rate
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-ink-dark tracking-tight">₹50</span>
              <span className="text-sm font-semibold text-ink-muted">/ resume build</span>
            </div>
            <p className="text-xs text-sky-700 font-semibold mt-1">
              50 Credits = ₹50.00 per generated resume
            </p>

            <div className="mt-6 pt-6 border-t border-sand-border space-y-3 text-xs text-ink">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100 Free Starter Credits on Signup (2 Free Resumes)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>AI Job Description keyword tailoring & optimization</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Access to all 8 recruiter-approved ATS templates</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited edits and client-side vector PDF downloads</span>
              </div>
            </div>

            <Link
              href="/builder"
              className="mt-8 w-full py-3.5 rounded-xl bg-ink-dark hover:bg-sky-600 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Build Your Resume (₹50)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-subtle">
              <ShieldCheck className="w-3.5 h-3.5 text-ink-subtle" />
              <span>Instant Razorpay checkout • 100% Secure</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Clean Minimalist Footer (Navigation Links Only, Includes Refund Policy) ── */}
      <footer className="bg-canvas border-t border-sand-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-4">
          <div>
            © {new Date().getFullYear()} Kestral AI Labs LLP. All rights reserved.
          </div>
          <div className="flex items-center gap-6 font-medium text-ink-muted">
            <Link href="/builder" className="hover:text-ink-dark transition">
              Resume Builder
            </Link>
            <a href="#templates" className="hover:text-ink-dark transition">
              Templates
            </a>
            <Link href="/ranking" className="hover:text-ink-dark transition">
              For Recruiters
            </Link>
            <Link href="/refund-policy" className="hover:text-ink-dark transition">
              Refund Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
