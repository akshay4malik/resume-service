-- =============================================================================
-- Kestral Resume Builder Service — Complete Database Setup
-- Run this in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New query -> Paste & Run
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Trigger function to automatically maintain updated_at timestamps
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

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS public.rb_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_job_description TEXT,
  target_role TEXT,
  target_industry TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Resumes Table
CREATE TABLE IF NOT EXISTS public.rb_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.rb_projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  template_id TEXT NOT NULL DEFAULT 'template1',
  parsed_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  optimized_data JSONB,
  ats_score INTEGER,
  ats_feedback JSONB,
  target_job_description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  pdf_storage_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Files Table
CREATE TABLE IF NOT EXISTS public.rb_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.rb_projects(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  parsed_text TEXT,
  extracted_data JSONB,
  ranking_score NUMERIC(5,2),
  ranking_reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. User Credits Table
CREATE TABLE IF NOT EXISTS public.rb_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_balance INTEGER NOT NULL DEFAULT 100,
  total_purchased INTEGER NOT NULL DEFAULT 100,
  total_consumed INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Payments Table (Razorpay Orders)
CREATE TABLE IF NOT EXISTS public.rb_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'PENDING',
  credits_purchased INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 6. Credit Transaction Ledger
CREATE TABLE IF NOT EXISTS public.rb_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  payment_id UUID REFERENCES public.rb_payments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-provision initial credits when new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.rb_credits (user_id, current_balance, total_purchased, total_consumed)
  VALUES (NEW.id, 100, 100, 0)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.rb_credit_transactions (user_id, transaction_type, amount, balance_after, description)
  VALUES (NEW.id, 'SIGNUP_BONUS', 100, 100, 'Welcome bonus credits for sign up')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_credits();

-- Enable RLS
ALTER TABLE public.rb_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rb_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rb_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rb_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rb_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rb_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users manage own projects" ON public.rb_projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own resumes" ON public.rb_resumes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own files" ON public.rb_files FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own credits" ON public.rb_credits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own payments" ON public.rb_payments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own transactions" ON public.rb_credit_transactions FOR ALL USING (auth.uid() = user_id);
