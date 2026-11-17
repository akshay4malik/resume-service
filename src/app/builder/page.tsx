'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClientResumePreview } from '@/components/pdf/ClientResumePreview';
import { TEMPLATES } from '@/components/pdf/DynamicResumeTemplate';
import { ResumeData } from '@/lib/schemas/resume';
import { COMPREHENSIVE_SAMPLE_RESUME } from '@/lib/sampleResume';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/components/auth/AuthProvider';
import { PricingModal } from '@/components/payments/PricingModal';
import { ResumeDataEditor } from '@/components/builder/ResumeDataEditor';
import Link from 'next/link';
import {
  UploadCloud,
  Wand2,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LayoutTemplate,
  ArrowLeft,
  Loader2,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

type StudioStep = 'UPLOAD' | 'EDIT' | 'PREVIEW';

function BuilderStudioContent() {
  const searchParams = useSearchParams();
  const urlResumeId = searchParams.get('resumeId');

  const [currentStep, setCurrentStep] = useState<StudioStep>('UPLOAD');
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(urlResumeId);
  const [resumeData, setResumeData] = useState<ResumeData>(COMPREHENSIVE_SAMPLE_RESUME);
  const [templateId, setTemplateId] = useState<string>('template1');
  const [dataVersion, setDataVersion] = useState<number>(0);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProceeding, setIsProceeding] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { user, credits, refreshCredits, openAuthModal } = useAuth();
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Load existing resume if resumeId query param is present
  useEffect(() => {
    if (!urlResumeId) return;
    const fetchResume = async () => {
      try {
        const res = await fetch(`/api/resumes/${urlResumeId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.resume?.optimized_data || data.resume?.parsed_data) {
          setResumeData(data.resume.optimized_data || data.resume.parsed_data);
          if (data.resume.template_id) setTemplateId(data.resume.template_id);
          if (data.resume.job_description) setJobDescription(data.resume.job_description);
          setDataVersion((v) => v + 1);
          setCurrentStep('PREVIEW');
        }
      } catch (err) {
        console.error('Failed to load resume:', err);
      }
    };
    fetchResume();
  }, [urlResumeId]);

  // Main flow: 
  // 1. User uploads resume + optional JD/Instructions
  // 2. User clicks "Enhance Resume with AI (50 Credits)"
  // 3. System extracts & enhances content, deducts credits, and takes user to EDIT step
  const handleEnhanceResume = async () => {
    if (!user) {
      openAuthModal('signin');
      return;
    }

    const balance = credits?.current_balance ?? 0;
    if (balance < 50) {
      setShowPricingModal(true);
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      let baseData = resumeData;

      // If user uploaded a new PDF, parse it first
      if (file) {
        setProcessingStatus('Extracting content from uploaded PDF...');
        const formData = new FormData();
        formData.append('file', file);
        if (jobDescription) formData.append('job_description', jobDescription);
        if (instructions) formData.append('instructions', instructions);

        const parseRes = await fetch('/api/parse-resume', {
          method: 'POST',
          body: formData,
        });

        let parseJson: any = null;
        try {
          parseJson = await parseRes.json();
        } catch {
          // Response wasn't valid JSON (e.g. HTML 504 from server timeout)
        }

        if (!parseRes.ok) {
          throw new Error(
            parseJson?.error ||
            (parseRes.status === 504
              ? 'Parsing took too long (gateway timeout). Please retry with a smaller PDF or concise document.'
              : `Server error (${parseRes.status}): Failed to extract text from PDF.`)
          );
        }
        if (parseJson?.resume_data) {
          baseData = parseJson.resume_data;
          setResumeData(baseData);
        }
      }

      // Step 2: Enhance with AI and deduct 50 credits
      setProcessingStatus('Enhancing with AI & tailoring to job description...');
      const optRes = await fetch('/api/optimize-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_id: currentResumeId || undefined,
          resume_data: baseData,
          job_description: jobDescription.trim() || null,
          instructions: instructions.trim() || 'Enhance clarity, quantify achievements, and format for maximum ATS readability.',
          template_id: templateId,
        }),
      });

      let optJson: any = null;
      try {
        optJson = await optRes.json();
      } catch {
        // Response wasn't valid JSON
      }

      if (!optRes.ok) {
        if (optRes.status === 402) {
          setShowPricingModal(true);
          throw new Error('Insufficient credits (50 credits required).');
        }
        throw new Error(
          optJson?.error ||
          (optRes.status === 504
            ? 'AI optimization took too long. Please try again.'
            : `Server error (${optRes.status}): Failed to enhance resume.`)
        );
      }

      if (optJson?.resume_id) {
        setCurrentResumeId(optJson.resume_id);
      }

      if (optJson?.resume_data) {
        setResumeData(optJson.resume_data);
        setDataVersion((v) => v + 1);
      }

      await refreshCredits();

      // Successfully enhanced! Move user to the EDIT step
      setCurrentStep('EDIT');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSuccessToast('Resume enhanced! Please review and edit your information below.');
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred during enhancement');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  // Step 3: User approves their edited information and proceeds to the final PDF layout
  const handleProceedToFinal = () => {
    // Persist user edits in the background without blocking the transition to Step 3
    if (currentResumeId) {
      fetch(`/api/resumes/${currentResumeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optimized_data: resumeData,
          template_id: templateId,
        }),
      }).catch((err) => {
        console.error('Failed to update resume edits:', err);
      });
    }
    setDataVersion((v) => v + 1);
    setCurrentStep('PREVIEW');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSuccessToast('Your tailored resume is ready! Downloading is now available.');
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      {/* Studio Header */}
      <header className="bg-canvas/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink-dark px-2.5 py-1.5 rounded-lg hover:bg-canvas-card border border-transparent hover:border-sand-border transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
          <div className="h-4 w-px bg-sand-border" />
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md overflow-hidden border border-sand-border bg-white flex items-center justify-center">
              <img
                src="/images/kestral-logo.jpg"
                alt="Kestral AI Labs"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-sm text-ink-dark">Kestral AI Labs</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 font-medium border border-sky-500/20">
              Resume Studio
            </span>
          </div>
        </div>

        {/* Workflow Breadcrumb Indicator */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setCurrentStep('UPLOAD')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
              currentStep === 'UPLOAD' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 text-[10px] flex items-center justify-center font-bold">1</span>
            <span>Upload & Tailor</span>
          </button>
          <span className="text-slate-300">→</span>
          <button
            onClick={() => setCurrentStep('EDIT')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
              currentStep === 'EDIT' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 text-[10px] flex items-center justify-center font-bold">2</span>
            <span>Review & Edit</span>
          </button>
          <span className="text-slate-300">→</span>
          <button
            onClick={() => setCurrentStep('PREVIEW')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
              currentStep === 'PREVIEW' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-700 text-[10px] flex items-center justify-center font-bold">3</span>
            <span>Final PDF & Download</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <UserMenu />
          <Link
            href="/history"
            className="text-xs text-ink-muted hover:text-ink-dark px-3 py-1.5 rounded-lg border border-sand-border bg-canvas-card hover:bg-canvas-subtle transition flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>My Resumes</span>
          </Link>
        </div>
      </header>

      {/* Notifications */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-4">
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{successToast}</span>
          </div>
        )}
      </div>

      {/* ── STEP 1: UPLOAD & TAILOR ───────────────────────────────────── */}
      {currentStep === 'UPLOAD' && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Upload PDF, JD, Instructions, Enhance Button (no inner scroll needed) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Step 1: Upload Card */}
            <div className="bg-canvas-card border border-sand-border rounded-2xl p-4 shadow-xs">
              <h2 className="text-sm font-semibold text-ink-dark flex items-center gap-2 mb-1">
                <UploadCloud className="w-4 h-4 text-sky-600" />
                1. Upload Resume (PDF)
              </h2>
              <p className="text-xs text-ink-muted mb-3">
                Select your PDF resume. We&apos;ll extract and enhance all fields for you to review before building the PDF.
              </p>

              <input
                type="file"
                accept=".pdf"
                disabled={isProcessing}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-xs text-ink-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 file:cursor-pointer cursor-pointer border border-sand-border rounded-xl p-1.5 bg-canvas disabled:opacity-60"
              />
              {file && (
                <p className="text-[11px] text-emerald-600 mt-2 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selected: {file.name}</span>
                </p>
              )}
            </div>

            {/* Step 2: Job Description & Instructions */}
            <div className="bg-canvas-card border border-sand-border rounded-2xl p-4 shadow-xs flex flex-col gap-3.5">
              <h2 className="text-sm font-semibold text-ink-dark flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-sky-600" />
                2. Target Job Description & AI Enhancement
              </h2>

              <div>
                <label className="text-xs font-medium text-ink-muted block mb-1">
                  Target Job Description (Optional)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description if you want to tailor keywords, or leave empty for general enhancement..."
                  rows={3}
                  className="w-full bg-canvas border border-sand-border rounded-lg p-2.5 text-xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-muted block mb-1">
                  Extra Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Focus on technical leadership and scalability"
                  className="w-full bg-canvas border border-sand-border rounded-lg p-2 text-xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={handleEnhanceResume}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-ink-dark hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>{processingStatus || 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-sky-400" />
                    <span>Enhance Resume with AI (50 Credits)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Template Selector & Static Template Preview (no PDF built yet) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-canvas-card border border-sand-border rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-ink-dark flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-sky-600" />
                  3. Select Template Style
                </h2>
                <span className="text-[11px] text-ink-muted font-mono">{TEMPLATES.length} ATS-Safe Designs</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {TEMPLATES.map((t) => {
                  const isSelected = templateId === t.id;
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTemplateId(t.id)}
                      className={`group relative text-left rounded-xl border overflow-hidden transition-all flex flex-col cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40 shadow-sm'
                          : 'border-sand-border bg-canvas hover:border-sand-hover'
                      }`}
                    >
                      <div className="w-full h-20 bg-white relative overflow-hidden flex items-center justify-center border-b border-sand-border">
                        <img
                          src={t.previewUrl}
                          alt={t.name}
                          className={`w-full h-full object-cover object-top transition-transform duration-300 ${
                            isSelected ? 'scale-105' : 'group-hover:scale-105 opacity-85'
                          }`}
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-sky-600 text-white rounded-full p-0.5 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="p-1.5 flex flex-col justify-between flex-1 bg-white">
                        <div className="font-semibold text-[11px] text-ink-dark leading-tight truncate">
                          {t.name}
                        </div>
                        <div className="text-[9px] text-ink-muted mt-0.5">{t.category}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Static Template Sample Image */}
            <div className="bg-canvas-card border border-sand-border rounded-2xl p-4 shadow-xs flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-xs text-ink-muted mb-3">
                <span>
                  Selected Layout: <strong className="text-ink-dark">{TEMPLATES.find(t => t.id === templateId)?.name || templateId}</strong>
                </span>
                <span className="text-[11px] text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full font-medium">
                  Next: Review &amp; Edit Extracted Fields
                </span>
              </div>
              <div className="w-full max-w-md rounded-xl overflow-hidden border border-sand-border bg-white shadow-sm">
                <img
                  src={TEMPLATES.find(t => t.id === templateId)?.previewUrl || '/previews/template1_preview.png'}
                  alt={TEMPLATES.find(t => t.id === templateId)?.name || 'Selected Template Preview'}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: REVIEW & EDIT EXTRACTED INFORMATION ───────────────── */}
      {currentStep === 'EDIT' && (
        <div className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col gap-6">
          <div className="bg-white border border-sand-border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">Step 2: Review & Edit</span>
              <h2 className="text-xl font-black text-slate-950 mt-1">Verify Your Enhanced Resume Fields</h2>
              <p className="text-xs text-slate-600 mt-1">
                All details extracted from your resume and optimized with AI are editable below. Adjust any section, then proceed to generate your final PDF.
              </p>
            </div>

            <button
              type="button"
              onClick={handleProceedToFinal}
              disabled={isProceeding}
              className="shrink-0 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-bold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {isProceeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <span>Looks Good, Proceed to PDF</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <ResumeDataEditor data={resumeData} onChange={(updated) => setResumeData(updated)} />

          <div className="flex justify-end pt-2 pb-8">
            <button
              type="button"
              onClick={handleProceedToFinal}
              disabled={isProceeding}
              className="px-8 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-sm transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {isProceeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Final PDF Layout &amp; Download</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: FINAL PDF & DOWNLOAD ──────────────────────────────── */}
      {currentStep === 'PREVIEW' && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-4">
          <div className="bg-white border border-sand-border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Step 3: Ready for Download</span>
              <h2 className="text-lg font-bold text-slate-950 mt-0.5">Your ATS-Optimized Vector Resume</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically synced to Cloudflare R2 storage and stored in your profile history.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setCurrentStep('EDIT')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Fields</span>
              </button>
              <Link
                href="/history"
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>View Profile History</span>
              </Link>
            </div>
          </div>

          <div className="h-[850px] w-full">
            <ClientResumePreview
              key={`${templateId}_${dataVersion}`}
              data={resumeData}
              templateId={templateId}
              resumeId={currentResumeId || undefined}
              jobDescription={jobDescription}
            />
          </div>
        </div>
      )}

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        requiredCredits={50}
      />
    </div>
  );
}

export default function ResumeBuilderStudio() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      }
    >
      <BuilderStudioContent />
    </Suspense>
  );
}
