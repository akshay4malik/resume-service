'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus,
  FolderOpen,
  FileText,
  Loader2,
  XCircle,
  Clock,
  Upload,
  RefreshCw,
  X,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '@/components/auth/UserMenu';

interface Project {
  id: string;
  name: string;
  job_description: string;
  created_at: string;
  file_stats?: {
    total_files: number;
    completed_files: number;
    pending_files: number;
    processing_files: number;
    failed_files: number;
  };
}

interface FileResult {
  file_id: string;
  file_name: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  updated_at: string;
  result?: {
    score?: number;
    rank?: number;
    reasoning?: string;
    match_percentage?: number;
    resume_content?: string;
  };
  error?: string;
}

export default function ResumeRankingPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectFiles, setProjectFiles] = useState<FileResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [creatingProject, setCreatingProject] = useState(false);
  const [isJobDescExpanded, setIsJobDescExpanded] = useState(false);
  const [expandedRemarks, setExpandedRemarks] = useState<Set<string>>(new Set());
  const [searchFilter, setSearchFilter] = useState('');
  const [scoreSortOrder, setScoreSortOrder] = useState<'desc' | 'asc' | null>('desc');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isBatchRunningRef = useRef(false);

  const triggerBatchProcess = async (projectId: string) => {
    if (isBatchRunningRef.current) return;
    isBatchRunningRef.current = true;
    try {
      await fetch('/api/ranking/process-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
    } catch (err) {
      console.error('Batch trigger error:', err);
    } finally {
      isBatchRunningRef.current = false;
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectFiles(selectedProject.id);
    }
  }, [selectedProject?.id]);

  // Background Batch Worker Trigger & Poller
  useEffect(() => {
    if (!autoRefresh || !selectedProject) return;

    const interval = setInterval(async () => {
      await triggerBatchProcess(selectedProject.id);
      await loadProjectFiles(selectedProject.id);
      await loadProjects(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedProject?.id]);

  const loadProjects = async (showLoadingState = true) => {
    try {
      if (showLoadingState) setLoading(true);
      const res = await fetch('/api/ranking/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data || []);
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  const loadProjectFiles = async (projectId: string) => {
    try {
      const res = await fetch(`/api/ranking/status/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProjectFiles(data.files || []);

        const hasPendingOrProcessing = (data.files || []).some(
          (f: FileResult) => f.status === 'PENDING' || f.status === 'PROCESSING'
        );
        setAutoRefresh(hasPendingOrProcessing);
      }
    } catch (error) {
      console.error('Failed to load project files:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !jobDescription.trim()) {
      alert('Please provide both a project name and job description.');
      return;
    }
    setCreatingProject(true);
    try {
      const res = await fetch('/api/ranking/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: newProjectName.trim(),
          job_description: jobDescription.trim(),
        }),
      });

      if (res.ok) {
        const created = await res.json();
        const fullProj: Project = {
          id: created.id,
          name: created.project_name,
          job_description: created.job_description,
          created_at: created.created_at,
          file_stats: {
            total_files: 0,
            completed_files: 0,
            pending_files: 0,
            processing_files: 0,
            failed_files: 0,
          },
        };
        setProjects([fullProj, ...projects]);
        setSelectedProject(fullProj);
        setShowCreateModal(false);
        setNewProjectName('');
        setJobDescription('');

        if (selectedFiles.length > 0) {
          await uploadFiles(fullProj.id, selectedFiles);
          setSelectedFiles([]);
        }
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to create project'}`);
      }
    } catch (err: any) {
      alert(`Error creating project: ${err.message}`);
    } finally {
      setCreatingProject(false);
    }
  };

  const uploadFiles = async (projectId: string, files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('project_id', projectId);
      files.forEach((file) => formData.append('files', file));

      const res = await fetch('/api/ranking/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        // 1. Immediately display all uploaded files in the table with PENDING status
        await loadProjectFiles(projectId);
        await loadProjects(false);

        // 2. Start background batch processing & polling
        setAutoRefresh(true);
        triggerBatchProcess(projectId);
      } else {
        const err = await res.json();
        alert(`Upload error: ${err.error || 'Upload failed'}`);
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (selectedProject) {
      await uploadFiles(selectedProject.id, files);
    } else {
      setSelectedFiles(files);
      setShowCreateModal(true);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleRemarks = (fileId: string) => {
    setExpandedRemarks((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const toggleScoreSort = () => {
    setScoreSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const handleDownloadOriginal = async (fileId: string, fileName: string) => {
    setDownloadingId(fileId);
    try {
      const res = await fetch(`/api/ranking/files/${fileId}/download`);
      if (res.ok) {
        const data = await res.json();
        if (data.download_url) {
          const link = document.createElement('a');
          link.href = data.download_url;
          link.download = fileName;
          link.target = '_blank';
          link.rel = 'noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const sortedAndFilteredFiles = useMemo(() => {
    const filtered = projectFiles.filter((f) =>
      f.file_name.toLowerCase().includes(searchFilter.toLowerCase())
    );

    if (!scoreSortOrder) return filtered;

    return [...filtered].sort((a, b) => {
      const aScore = typeof a.result?.score === 'number' ? a.result.score : null;
      const bScore = typeof b.result?.score === 'number' ? b.result.score : null;

      if (aScore === null && bScore === null) return 0;
      if (aScore === null) return 1;
      if (bScore === null) return -1;

      return scoreSortOrder === 'desc' ? bScore - aScore : aScore - bScore;
    });
  }, [projectFiles, searchFilter, scoreSortOrder]);

  const statsSummary = useMemo(() => {
    const completed = projectFiles.filter((f) => f.status === 'COMPLETED' && typeof f.result?.score === 'number');
    const scores = completed.map((f) => f.result!.score as number);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const topScore = scores.length > 0 ? Math.max(...scores) : null;
    const strongMatches = scores.filter((s) => s >= 80).length;
    return {
      total: projectFiles.length,
      completed: projectFiles.filter((f) => f.status === 'COMPLETED').length,
      avgScore,
      topScore,
      strongMatches,
    };
  }, [projectFiles]);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      {/* Top Navigation */}
      <header className="bg-canvas-card/95 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink-dark px-2.5 py-1.5 rounded-lg hover:bg-canvas border border-transparent hover:border-sand-border transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <div className="h-4 w-px bg-sand-border" />
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-2xs border border-sand-border bg-white flex items-center justify-center">
            <img
              src="/images/kestral-logo.jpg"
              alt="Kestral AI Labs"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-semibold text-sm sm:text-base text-ink-dark flex items-center gap-2">
              Kestral AI Labs — Resume Ranking
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                Recruiter Portal
              </span>
            </h1>
            <p className="text-xs text-ink-muted hidden sm:block">
              Batch-rank candidate resumes against your specific job criteria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <UserMenu />
          <Link
            href="/builder"
            className="hidden sm:inline-flex text-xs text-ink hover:text-ink-dark px-3.5 py-1.5 rounded-lg border border-sand-border bg-canvas-card hover:bg-canvas transition font-medium shadow-2xs"
          >
            Resume Builder
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-ink-dark hover:bg-slate-800 text-white shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            New Ranking Project
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: Projects */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-sand-border bg-canvas-card flex flex-col shrink-0">
          <div className="p-4 border-b border-sand-border/70 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider">
              <FolderOpen className="w-4 h-4 text-sky-600" />
              Projects ({projects.length})
            </div>
            <button
              onClick={() => loadProjects()}
              title="Refresh projects"
              className="p-1.5 rounded-lg hover:bg-canvas text-ink-muted hover:text-ink-dark transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-60 lg:max-h-none">
            {loading && projects.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-muted">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-600" />
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink-muted border border-dashed border-sand-border rounded-xl bg-canvas">
                No projects found. Create your first project to start ranking resumes.
              </div>
            ) : (
              projects.map((proj) => {
                const isSelected = selectedProject?.id === proj.id;
                const stats = proj.file_stats;
                return (
                  <button
                    key={proj.id}
                    onClick={() => setSelectedProject(proj)}
                    className={`w-full text-left p-3.5 rounded-xl transition border cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50/70 border-sky-300 border-l-4 border-l-sky-600 shadow-2xs'
                        : 'bg-canvas-card border-sand-border hover:bg-canvas hover:border-sand-hover'
                    }`}
                  >
                    <div className="font-semibold text-sm text-ink-dark truncate">{proj.name}</div>
                    <div className="text-xs text-ink-muted line-clamp-1 mt-1">
                      {proj.job_description}
                    </div>

                    <div className="flex items-center gap-3 mt-2.5 text-[11px] text-ink-muted font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-canvas border border-sand-border/80">
                        {stats?.total_files ?? 0} files
                      </span>
                      <span className="text-emerald-700 font-semibold">
                        {stats?.completed_files ?? 0} scored
                      </span>
                      {(stats?.pending_files || 0) + (stats?.processing_files || 0) > 0 && (
                        <span className="text-amber-600 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {(stats?.pending_files || 0) + (stats?.processing_files || 0)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Content: Ranking Table */}
        <main className="flex-1 flex flex-col overflow-hidden bg-canvas">
          {selectedProject ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Project Header Banner */}
              <div className="px-6 py-5 border-b border-sand-border bg-canvas-card">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-ink-dark tracking-tight flex items-center gap-2.5 flex-wrap">
                      <span>{selectedProject.name}</span>
                      {autoRefresh && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Processing in batches of 5...
                        </span>
                      )}
                    </h2>
                    <div className="mt-2 text-xs text-ink-muted max-w-4xl">
                      <div className="flex items-center gap-2 font-semibold text-ink-muted mb-1">
                        <span>Job Description Criteria</span>
                        <button
                          onClick={() => setIsJobDescExpanded(!isJobDescExpanded)}
                          className="text-sky-600 hover:text-sky-700 text-[11px] flex items-center gap-0.5 cursor-pointer"
                        >
                          {isJobDescExpanded ? (
                            <>
                              Show less <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              Show full JD <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>
                      <p
                        className={`text-ink bg-canvas p-3 rounded-xl border border-sand-border text-xs leading-relaxed whitespace-pre-wrap ${
                          isJobDescExpanded ? '' : 'line-clamp-2'
                        }`}
                      >
                        {selectedProject.job_description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Upload Resumes (PDFs)
                    </button>
                    <button
                      onClick={() => loadProjectFiles(selectedProject.id)}
                      className="p-2.5 rounded-xl border border-sand-border bg-canvas-card hover:bg-canvas text-ink-muted hover:text-ink-dark transition shadow-2xs cursor-pointer"
                      title="Refresh files"
                    >
                      <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* KPI Strip & Progress */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-canvas rounded-xl border border-sand-border px-3.5 py-2.5">
                    <div className="text-[11px] font-medium text-ink-muted">Uploaded Resumes</div>
                    <div className="text-lg font-bold text-ink-dark mt-0.5">{statsSummary.total}</div>
                  </div>
                  <div className="bg-canvas rounded-xl border border-sand-border px-3.5 py-2.5">
                    <div className="text-[11px] font-medium text-ink-muted">Evaluated</div>
                    <div className="text-lg font-bold text-ink-dark mt-0.5">
                      {statsSummary.completed} <span className="text-xs font-normal text-ink-muted">/ {statsSummary.total}</span>
                    </div>
                  </div>
                  <div className="bg-canvas rounded-xl border border-sand-border px-3.5 py-2.5">
                    <div className="text-[11px] font-medium text-ink-muted">Top Match Score</div>
                    <div className="text-lg font-bold text-emerald-600 mt-0.5">
                      {statsSummary.topScore !== null ? `${statsSummary.topScore}/100` : '—'}
                    </div>
                  </div>
                  <div className="bg-canvas rounded-xl border border-sand-border px-3.5 py-2.5">
                    <div className="text-[11px] font-medium text-ink-muted">Strong Matches (80+)</div>
                    <div className="text-lg font-bold text-sky-700 mt-0.5">{statsSummary.strongMatches}</div>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="px-6 py-3 border-b border-sand-border bg-canvas-subtle/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 text-ink-subtle absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search candidate file name..."
                    className="w-full pl-9 pr-3 py-1.5 bg-canvas-card border border-sand-border rounded-lg text-xs text-ink-dark placeholder-ink-subtle focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                </div>
                <div className="text-xs text-ink-muted font-medium">
                  Showing {sortedAndFilteredFiles.length} candidate {sortedAndFilteredFiles.length === 1 ? 'resume' : 'resumes'}
                </div>
              </div>

              {/* Candidates Table */}
              <div className="flex-1 overflow-auto p-6">
                {sortedAndFilteredFiles.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-sand-border rounded-2xl bg-canvas-card max-w-xl mx-auto my-8 shadow-2xs">
                    <Upload className="w-8 h-8 text-ink-subtle mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-ink-dark">No resumes uploaded yet</h3>
                    <p className="text-xs text-ink-muted mt-1 max-w-xs mx-auto">
                      Upload candidate PDF resumes to score and rank them against this Job Description.
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Resumes
                    </button>
                  </div>
                ) : (
                  <div className="bg-canvas-card border border-sand-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-sand-border bg-canvas/80 text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                            <th className="py-3.5 px-5 w-[24%]">File Name</th>
                            <th className="py-3.5 px-4 w-[15%]">
                              <button
                                type="button"
                                onClick={toggleScoreSort}
                                className="inline-flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-lg hover:bg-canvas-subtle hover:text-ink-dark transition cursor-pointer select-none group"
                                title="Click to sort by Score"
                              >
                                <span>Score</span>
                                {scoreSortOrder === 'desc' ? (
                                  <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
                                ) : scoreSortOrder === 'asc' ? (
                                  <ArrowUp className="w-3.5 h-3.5 text-sky-600" />
                                ) : (
                                  <ArrowUpDown className="w-3.5 h-3.5 text-ink-subtle group-hover:text-ink-dark" />
                                )}
                              </button>
                            </th>
                            <th className="py-3.5 px-4 w-[47%]">AI Reasoning</th>
                            <th className="py-3.5 px-5 w-[14%] text-right">Download</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sand-border/60 text-xs">
                          {sortedAndFilteredFiles.map((item) => {
                            const isCompleted = item.status === 'COMPLETED';
                            const isProcessing = item.status === 'PROCESSING';
                            const isFailed = item.status === 'FAILED';
                            const score = typeof item.result?.score === 'number' ? item.result.score : null;
                            const reasoning = item.result?.reasoning ?? '';
                            const isRemarksOpen = expandedRemarks.has(item.file_id);
                            const isLongReasoning = reasoning.length > 140;

                            return (
                              <tr
                                key={item.file_id}
                                className="hover:bg-canvas/50 transition align-top"
                              >
                                {/* File Name */}
                                <td className="py-4 px-5">
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-semibold text-ink-dark break-words">
                                        {item.file_name}
                                      </div>
                                      <div className="text-[11px] text-ink-subtle mt-0.5">
                                        {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Score */}
                                <td className="py-4 px-4">
                                  {isCompleted && score !== null ? (
                                    <div className="inline-flex flex-col gap-1.5">
                                      <div className="inline-flex items-baseline gap-1">
                                        <span
                                          className={`text-lg font-extrabold tracking-tight ${
                                            score >= 80
                                              ? 'text-emerald-600'
                                              : score >= 60
                                              ? 'text-amber-600'
                                              : 'text-red-600'
                                          }`}
                                        >
                                          {score}
                                        </span>
                                        <span className="text-[11px] text-ink-subtle font-semibold">/ 100</span>
                                      </div>
                                      <div className="w-20 h-1.5 bg-canvas-subtle rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            score >= 80
                                              ? 'bg-emerald-500'
                                              : score >= 60
                                              ? 'bg-amber-500'
                                              : 'bg-red-500'
                                          }`}
                                          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <span
                                      className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                                        isProcessing
                                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                          : isFailed
                                          ? 'bg-red-50 text-red-700 border border-red-200'
                                          : 'bg-canvas text-ink-muted border border-sand-border'
                                      }`}
                                    >
                                      {isProcessing ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : isFailed ? (
                                        <XCircle className="w-3 h-3" />
                                      ) : (
                                        <Clock className="w-3 h-3" />
                                      )}
                                      {item.status}
                                    </span>
                                  )}
                                </td>

                                {/* AI Reasoning (summary + expandable) */}
                                <td className="py-4 px-4">
                                  {isCompleted && reasoning ? (
                                    <div className="space-y-1.5">
                                      <div
                                        className={`text-xs text-ink leading-relaxed whitespace-pre-wrap ${
                                          isRemarksOpen
                                            ? 'bg-canvas p-3.5 rounded-xl border border-sand-border'
                                            : 'line-clamp-2'
                                        }`}
                                      >
                                        {reasoning}
                                      </div>
                                      {isLongReasoning && (
                                        <button
                                          type="button"
                                          onClick={() => toggleRemarks(item.file_id)}
                                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
                                        >
                                          <Sparkles className="w-3 h-3" />
                                          <span>{isRemarksOpen ? 'Show less' : 'Expand full summary'}</span>
                                          {isRemarksOpen ? (
                                            <ChevronUp className="w-3 h-3" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  ) : isFailed && item.error ? (
                                    <span className="text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 inline-block">
                                      Error: {item.error}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-ink-subtle italic">
                                      {isProcessing
                                        ? 'Evaluating candidate resume...'
                                        : 'Queued for AI evaluation...'}
                                    </span>
                                  )}
                                </td>

                                {/* Download */}
                                <td className="py-4 px-5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadOriginal(item.file_id, item.file_name)}
                                    disabled={downloadingId === item.file_id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sand-border bg-canvas-card hover:bg-sky-50 hover:border-sky-300 text-ink hover:text-sky-700 text-xs font-semibold transition shadow-2xs disabled:opacity-50 cursor-pointer"
                                  >
                                    {downloadingId === item.file_id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                                    ) : (
                                      <Download className="w-3.5 h-3.5 text-sky-600" />
                                    )}
                                    <span>Download</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs mb-4">
                <FolderOpen className="w-7 h-7 text-sky-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Select or Create a Project</h2>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
                Select an existing ranking project from the sidebar or create a new project with your job
                description to begin ranking.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-sky-400" />
                New Ranking Project
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-950 mb-1">Create Resume Ranking Project</h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter the target position name and Job Description to benchmark candidate resumes against.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project / Role Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer - Q1 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Description &amp; Criteria
                </label>
                <textarea
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job requirements, core tech stack, qualifications, and expectations..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-mono leading-relaxed transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={creatingProject || !newProjectName.trim() || !jobDescription.trim()}
                  onClick={handleCreateProject}
                  className="px-5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {creatingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-sky-400" />}
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
