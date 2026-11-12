'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePDF } from '@react-pdf/renderer';
import { DynamicResumeTemplate } from './DynamicResumeTemplate';
import { ResumeData } from '@/lib/schemas/resume';
import { Download, RefreshCw, ZoomIn, ZoomOut, CloudUpload, Check } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
  templateId?: string;
  isPaid?: boolean;
  resumeId?: string;
  onPay?: () => void;
  jobDescription?: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  templateId = 'template1',
  resumeId,
  jobDescription,
}) => {
  const [userZoom, setUserZoom] = useState<number>(1.0);
  const [rendering, setRendering] = useState<boolean>(true);
  const [pageCount, setPageCount] = useState<number>(1);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [savingToCloud, setSavingToCloud] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  // Generate the PDF blob using @react-pdf/renderer
  const [instance, updateInstance] = usePDF({
    document: <DynamicResumeTemplate templateId={templateId} data={data} />,
  });

  // Whenever templateId or data changes, update the PDF instance
  useEffect(() => {
    updateInstance(<DynamicResumeTemplate templateId={templateId} data={data} />);
  }, [templateId, data, updateInstance]);

  const fullName = `${data.personal_info?.first_name || 'Resume'}_${data.personal_info?.last_name || 'Output'}`.replace(/\s+/g, '_');
  const fileName = `${fullName}.pdf`;

  // Render the PDF cleanly onto an HTML5 Canvas using pdfjs-dist
  const renderPDF = useCallback(async () => {
    if (!instance.blob || !canvasRef.current || !containerRef.current) return;

    try {
      setRendering(true);
      setRenderError(null);

      // Dynamically import pdfjs-dist on client side
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs';

      const arrayBuffer = await instance.blob.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      setPageCount(pdf.numPages);

      // Render page 1
      const page = await pdf.getPage(1);
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      // Base unscaled viewport at scale = 1.0
      const unscaledViewport = page.getViewport({ scale: 1.0 });

      // Automatically calculate fit-to-width scale based on container width
      const containerAvailableWidth = Math.max((container.clientWidth || 550) - 48, 360);
      const fitScale = (containerAvailableWidth / unscaledViewport.width) * userZoom;

      // HiDPI / Retina pixel ratio
      const pixelRatio = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

      // Scale the PDF viewport by fitScale * pixelRatio so the backing buffer is crisp
      const renderViewport = page.getViewport({ scale: fitScale * pixelRatio });

      // Set physical canvas pixel buffer
      canvas.width = Math.floor(renderViewport.width);
      canvas.height = Math.floor(renderViewport.height);

      // Set CSS layout size (logical display size on page, without pixel ratio)
      const cssWidth = Math.floor(unscaledViewport.width * fitScale);
      const cssHeight = Math.floor(unscaledViewport.height * fitScale);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      // Cancel any running render task before starting a new one
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }

      // Standard PDF.js render call using the scaled renderViewport without manual transform
      const renderContext = {
        canvasContext: ctx,
        viewport: renderViewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      setRendering(false);
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Canvas render error:', err);
        setRenderError(err.message || 'Error rendering preview');
        setRendering(false);
      }
    }
  }, [instance.blob, userZoom, templateId]);

  useEffect(() => {
    renderPDF();

    // Re-render when container resizes
    const handleResize = () => {
      renderPDF();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [renderPDF]);

  // Auto-sync PDF blob to Cloudflare R2 and Supabase when rendered
  useEffect(() => {
    if (!instance.blob || savingToCloud || savedSuccess) return;

    let isMounted = true;
    const autoSyncToCloud = async () => {
      try {
        setSavingToCloud(true);
        const formData = new FormData();
        formData.append('pdf', instance.blob as Blob, fileName);
        formData.append('resume_data', JSON.stringify(data));
        formData.append('template_id', templateId);
        if (resumeId) formData.append('resume_id', resumeId);
        if (jobDescription) formData.append('job_description', jobDescription);

        const res = await fetch('/api/resumes/save', {
          method: 'POST',
          body: formData,
        });

        if (res.ok && isMounted) {
          setSavedSuccess(true);
        }
      } catch (err) {
        console.error('Auto-sync to Cloudflare R2 failed:', err);
      } finally {
        if (isMounted) setSavingToCloud(false);
      }
    };

    autoSyncToCloud();
    return () => {
      isMounted = false;
    };
  }, [instance.blob, data, templateId, resumeId, jobDescription]);

  return (
    <div className="flex flex-col h-full bg-canvas-card border border-sand-border rounded-2xl overflow-hidden shadow-xs">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-canvas/60 border-b border-sand-border shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm font-semibold text-ink-dark tracking-wide flex items-center gap-2">
              <span>Live Document Preview</span>
              {savedSuccess && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Saved to Cloud & Profile
                </span>
              )}
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              High-DPI vector canvas ({pageCount} {pageCount === 1 ? 'Page' : 'Pages'})
            </p>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 ml-4 bg-white border border-sand-border rounded-lg p-1 shadow-2xs">
            <button
              onClick={() => setUserZoom((z) => Math.max(0.7, z - 0.1))}
              className="p-1 text-ink-muted hover:text-ink-dark rounded hover:bg-canvas transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-ink-dark px-1.5 min-w-[42px] text-center">
              {Math.round(userZoom * 100)}%
            </span>
            <button
              onClick={() => setUserZoom((z) => Math.min(1.5, z + 0.1))}
              className="p-1 text-ink-muted hover:text-ink-dark rounded hover:bg-canvas transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savingToCloud && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 mr-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600" />
              <span>Syncing to R2...</span>
            </span>
          )}
          <a
            href={instance.url || '#'}
            download={fileName}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ink-dark hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        </div>
      </div>

      {/* Responsive Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full bg-canvas-subtle/80 overflow-y-auto overflow-x-hidden flex items-start justify-center p-4 sm:p-6 custom-scrollbar"
      >
        {instance.loading || rendering ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs z-20 text-ink-muted gap-3">
            <RefreshCw className="w-7 h-7 animate-spin text-sky-600" />
            <p className="text-xs font-medium">Rendering pixel-perfect vector canvas...</p>
          </div>
        ) : null}

        {renderError ? (
          <div className="text-red-500 text-sm p-6 text-center">
            {renderError}
          </div>
        ) : (
          <div className="shadow-lg border border-sand-border rounded-sm bg-white overflow-hidden my-auto transition-all duration-150">
            <canvas ref={canvasRef} className="block max-w-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
