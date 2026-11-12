-- =============================================================================
-- Migration: Add Credit System, User History, and Payments for Kestral AI
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- =============================================================================

-- 1. Create rb_credits table
CREATE TABLE IF NOT EXISTS public.rb_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_balance INTEGER NOT NULL DEFAULT 100, -- 100 Free Starter Credits
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_consumed INTEGER NOT NULL DEFAULT 0,
  total_refunded INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_rb_credits_user_id ON public.rb_credits(user_id);

-- 2. Create rb_payments table (Razorpay orders & verifications)
CREATE TABLE IF NOT EXISTS public.rb_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT,
  amount INTEGER NOT NULL, -- Amount in paise (e.g. 50000 = ₹500)
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, REFUNDED
  credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS ix_rb_payments_user_id ON public.rb_payments(user_id);
CREATE INDEX IF NOT EXISTS ix_rb_payments_order_id ON public.rb_payments(razorpay_order_id);

-- 3. Create rb_credit_transactions table (Full ledger)
CREATE TABLE IF NOT EXISTS public.rb_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'BONUS', 'PURCHASE', 'DEBIT', 'REFUND'
  amount INTEGER NOT NULL, -- positive for credits added, negative or positive magnitude
  balance_after INTEGER NOT NULL,
  description TEXT NOT NULL,
  payment_id UUID REFERENCES public.rb_payments(id) ON DELETE SET NULL,
  service_execution_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_rb_credit_transactions_user_id ON public.rb_credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS ix_rb_credit_transactions_created_at ON public.rb_credit_transactions(created_at DESC);

-- 4. Create rb_user_history table (Activity & Service Execution log)
CREATE TABLE IF NOT EXISTS public.rb_user_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL, -- 'RESUME_BUILD', 'RESUME_RANKING', 'COVER_LETTER'
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'COMPLETED', -- 'COMPLETED', 'FAILED', 'PENDING'
  credits_used INTEGER NOT NULL DEFAULT 0,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_rb_user_history_user_id ON public.rb_user_history(user_id);
CREATE INDEX IF NOT EXISTS ix_rb_user_history_created_at ON public.rb_user_history(created_at DESC);

-- 5. Trigger: Automatically provision 100 free starter credits on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert 100 starting credits
  INSERT INTO public.rb_credits (user_id, current_balance, total_purchased, total_consumed, total_refunded)
  VALUES (NEW.id, 100, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Log the initial welcome bonus transaction
  INSERT INTO public.rb_credit_transactions (user_id, transaction_type, amount, balance_after, description)
  VALUES (NEW.id, 'BONUS', 100, 100, 'Welcome bonus: 100 free credits')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- 6. RPC Function for Atomic Concurrency Safe Credit Deduction
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_service_type TEXT,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
  v_version INTEGER;
  v_new_balance INTEGER;
  v_tx_id UUID;
BEGIN
  -- Row-lock the user's credits row (FOR UPDATE prevents race conditions)
  SELECT current_balance, version
  INTO v_balance, v_version
  FROM public.rb_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Auto-create if not exists (safety fallback)
  IF NOT FOUND THEN
    INSERT INTO public.rb_credits (user_id, current_balance, total_purchased, total_consumed, total_refunded, version)
    VALUES (p_user_id, 100, 0, 0, 0, 0)
    RETURNING current_balance, version INTO v_balance, v_version;
  END IF;

  -- Check if user has sufficient credits
  IF v_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INSUFFICIENT_CREDITS',
      'current_balance', v_balance,
      'required', p_amount
    );
  END IF;

  v_new_balance := v_balance - p_amount;

  -- Update balance with version increment
  UPDATE public.rb_credits
  SET
    current_balance = v_new_balance,
    total_consumed = total_consumed + p_amount,
    version = version + 1,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Insert ledger transaction
  INSERT INTO public.rb_credit_transactions (
    user_id,
    transaction_type,
    amount,
    balance_after,
    description,
    metadata
  )
  VALUES (
    p_user_id,
    'DEBIT',
    p_amount,
    v_new_balance,
    p_description,
    p_details
  )
  RETURNING id INTO v_tx_id;

  -- Insert user history activity
  INSERT INTO public.rb_user_history (
    user_id,
    service_type,
    title,
    status,
    credits_used,
    details
  )
  VALUES (
    p_user_id,
    p_service_type,
    p_description,
    'COMPLETED',
    p_amount,
    p_details
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'transaction_id', v_tx_id
  );
END;
$$;

