'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { ResumeData } from '@/lib/schemas/resume';

// Skeleton/loading state for SSR fallback
const PreviewSkeleton = () => (
  <div className="w-full h-[650px] bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center animate-pulse">
    <div className="w-12 h-12 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin mb-4" />
    <p className="text-sm text-slate-400 font-medium">Initializing PDF Engine...</p>
    <p className="text-xs text-slate-500 mt-1">Rendering client-side document safely in RAM</p>
  </div>
);

// Dynamic import with ssr: false to guarantee 0MB overhead on Vercel Edge/Serverless functions
const DynamicPreview = dynamic(
  () => import('./ResumePreview').then((mod) => mod.ResumePreview),
  {
    ssr: false,
    loading: () => <PreviewSkeleton />,
  }
);

interface ClientResumePreviewProps {
  data: ResumeData;
  templateId?: string;
  isPaid?: boolean;
  resumeId?: string;
  onPay?: () => void;
  jobDescription?: string;
}

export const ClientResumePreview: React.FC<ClientResumePreviewProps> = (props) => {
  return <DynamicPreview {...props} />;
};

export default ClientResumePreview;

