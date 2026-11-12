-- =============================================================================
-- Kestral Resume Builder Service — Dedicated Supabase Schema
--
-- All tables are prefixed with `rb_` (Resume Builder) to prevent any name
-- collisions with existing database tables (e.g. users, files, projects).
--
-- Dependencies:
--   - Uses Supabase auth.users(id) for user authentication.
--   - If you have an existing public.users table, you can either link
--     rb_resumes.user_id -> auth.users(id) (standard for Supabase Auth)
--     or -> public.users(id). Here it references auth.users(id).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. UPDATED_AT TRIGGER FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_rb_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- 2. rb_projects — RESUME RANKING AND OTHER BATCH PROJECTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.rb_projects (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name            TEXT        NOT NULL,
  project_type            TEXT        NOT NULL DEFAULT 'RESUME_RANKING' CHECK (project_type IN ('RESUME_RANKING', 'INVOICE_PARSING')),
  description             TEXT,       -- Holds the Job Description for resume ranking
  deleted                 BOOLEAN     DEFAULT false NOT NULL,
  created_at              TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at              TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.rb_projects IS 'Stores resume ranking projects and their respective job descriptions.';

-- =============================================================================
-- 3. rb_files — TRACKS UPLOADED RESUMES & METADATA IN CLOUDFLARE R2
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.rb_files (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id              UUID        REFERENCES public.rb_projects(id) ON DELETE CASCADE,
  file_name               TEXT        NOT NULL,
  file_type               TEXT        NOT NULL CHECK (file_type IN ('RESUME', 'RESUME_INPUT', 'COVER_LETTER', 'INVOICE')),
  r2_key                  TEXT        NOT NULL, -- Cloudflare R2 object key
  file_size               INTEGER,
  content_type            TEXT        DEFAULT 'application/pdf',
  status                  TEXT        DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  processing_started_at   TIMESTAMPTZ,
  error_message           TEXT,
  metadata                JSONB,      -- stores extra extraction info, cover letter text, etc.
  result_data             JSONB,      -- stores score, reasoning, candidate preview
  deleted                 BOOLEAN     DEFAULT false NOT NULL,
  created_at              TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at              TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at              TIMESTAMPTZ -- for 7-day auto-lifecycle cleanup
);

COMMENT ON TABLE public.rb_files IS 'Tracks raw user-uploaded resumes, ranking candidates, and generated cover letters in Cloudflare R2.';

-- =============================================================================
-- 4. rb_resumes — CORE RESUME DATA STORE (JSONB + ATS SCORE + PAYMENT GATE)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.rb_resumes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id         UUID        REFERENCES public.rb_files(id) ON DELETE SET NULL,
  title           TEXT        NOT NULL DEFAULT 'Untitled Resume',
  template_id     TEXT        NOT NULL DEFAULT 'template1',
  job_description TEXT,
  parsed_data     JSONB,      -- raw parsed resume structure
  optimized_data  JSONB,      -- LLM ATS-tailored resume structure
  ats_score       INTEGER     CHECK (ats_score >= 0 AND ats_score <= 100),
  is_paid         BOOLEAN     DEFAULT false NOT NULL, -- gates vector PDF download
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.rb_resumes IS 'Stores structured LLM resume outputs (JSONB) and payment status.';

-- =============================================================================
-- 5. INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_rb_projects_user_id   ON public.rb_projects (user_id);
CREATE INDEX IF NOT EXISTS idx_rb_projects_type      ON public.rb_projects (project_type);
CREATE INDEX IF NOT EXISTS idx_rb_projects_created   ON public.rb_projects (created_at);

CREATE INDEX IF NOT EXISTS idx_rb_files_user_id      ON public.rb_files (user_id);
CREATE INDEX IF NOT EXISTS idx_rb_files_project_id   ON public.rb_files (project_id);
CREATE INDEX IF NOT EXISTS idx_rb_files_status       ON public.rb_files (status);
CREATE INDEX IF NOT EXISTS idx_rb_files_created_at   ON public.rb_files (created_at);

CREATE INDEX IF NOT EXISTS idx_rb_resumes_user_id    ON public.rb_resumes (user_id);
CREATE INDEX IF NOT EXISTS idx_rb_resumes_is_paid    ON public.rb_resumes (is_paid);
CREATE INDEX IF NOT EXISTS idx_rb_resumes_created_at ON public.rb_resumes (created_at);

-- =============================================================================
-- 6. TRIGGERS
-- =============================================================================
DROP TRIGGER IF EXISTS trg_rb_projects_updated_at ON public.rb_projects;
CREATE TRIGGER trg_rb_projects_updated_at
  BEFORE UPDATE ON public.rb_projects
  FOR EACH ROW EXECUTE PROCEDURE public.handle_rb_updated_at();

DROP TRIGGER IF EXISTS trg_rb_files_updated_at ON public.rb_files;
CREATE TRIGGER trg_rb_files_updated_at
  BEFORE UPDATE ON public.rb_files
  FOR EACH ROW EXECUTE PROCEDURE public.handle_rb_updated_at();

DROP TRIGGER IF EXISTS trg_rb_resumes_updated_at ON public.rb_resumes;
CREATE TRIGGER trg_rb_resumes_updated_at
  BEFORE UPDATE ON public.rb_resumes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_rb_updated_at();

-- =============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.rb_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rb_projects_select_own"
  ON public.rb_projects FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rb_projects_insert_own"
  ON public.rb_projects FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rb_projects_update_own"
  ON public.rb_projects FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "rb_projects_delete_own"
  ON public.rb_projects FOR DELETE
  USING (user_id = auth.uid());

ALTER TABLE public.rb_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rb_files_select_own"
  ON public.rb_files FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rb_files_insert_own"
  ON public.rb_files FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rb_files_update_own"
  ON public.rb_files FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "rb_files_delete_own"
  ON public.rb_files FOR DELETE
  USING (user_id = auth.uid());

ALTER TABLE public.rb_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rb_resumes_select_own"
  ON public.rb_resumes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "rb_resumes_insert_own"
  ON public.rb_resumes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rb_resumes_update_own"
  ON public.rb_resumes FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "rb_resumes_delete_own"
  ON public.rb_resumes FOR DELETE
  USING (user_id = auth.uid());
