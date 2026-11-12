/**
 * @file src/lib/credits.ts
 * @description Credit and User History management service for Kestral AI
 * 
 * Rules:
 *  - New users get 100 free credits
 *  - Resume Build / Optimization: 50 credits
 *  - Resume Ranking (per resume): 2 credits
 */

import { SupabaseClient } from '@supabase/supabase-js'

export const CREDIT_COSTS = {
  RESUME_BUILD: 50,
  RESUME_RANKING_PER_FILE: 2,
  ADVANCED_PARSING: 10,
} as const

export interface UserCredits {
  id: string
  user_id: string
  current_balance: number
  total_purchased: number
  total_consumed: number
  total_refunded: number
  version: number
}

export interface CreditTransaction {
  id: string
  user_id: string
  transaction_type: 'BONUS' | 'PURCHASE' | 'DEBIT' | 'REFUND'
  amount: number
  balance_after: number
  description: string
  created_at: string
}

export interface UserHistoryItem {
  id: string
  user_id: string
  service_type: 'RESUME_BUILD' | 'RESUME_RANKING' | 'COVER_LETTER'
  title: string
  status: 'COMPLETED' | 'FAILED' | 'PENDING'
  credits_used: number
  details: Record<string, any>
  created_at: string
}

/**
 * Fetch or initialize credit balance for a user
 */
export async function getUserCredits(
  supabase: SupabaseClient,
  userId: string
): Promise<UserCredits> {
  const { data, error } = await supabase
    .from('rb_credits')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    // Attempt insert 100 free credits if row doesn't exist yet
    const { data: newData, error: insertError } = await supabase
      .from('rb_credits')
      .insert({
        user_id: userId,
        current_balance: 100,
        total_purchased: 0,
        total_consumed: 0,
        total_refunded: 0,
      })
      .select('*')
      .single()

    if (insertError) {
      // Re-fetch in case of concurrent insert
      const { data: retryData } = await supabase
        .from('rb_credits')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (retryData) return retryData as UserCredits
      throw new Error(`Failed to load credits: ${insertError.message}`)
    }

    // Insert welcome bonus transaction
    await supabase.from('rb_credit_transactions').insert({
      user_id: userId,
      transaction_type: 'BONUS',
      amount: 100,
      balance_after: 100,
      description: 'Welcome bonus: 100 free credits',
    })

    return newData as UserCredits
  }

  return data as UserCredits
}

/**
 * Atomic credit deduction with transaction log and history entry
 */
export async function deductCredits(
  supabase: SupabaseClient,
  params: {
    userId: string
    amount: number
    description: string
    serviceType: 'RESUME_BUILD' | 'RESUME_RANKING' | 'COVER_LETTER'
    details?: Record<string, any>
  }
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  // Use the PostgreSQL RPC function for atomic row-locking
  const { data, error } = await supabase.rpc('deduct_user_credits', {
    p_user_id: params.userId,
    p_amount: params.amount,
    p_description: params.description,
    p_service_type: params.serviceType,
    p_details: params.details || {},
  })

  if (error) {
    // Fallback manual deduction if RPC is not yet created in Supabase
    return await fallbackDeductCredits(supabase, params)
  }

  if (!data?.success) {
    return {
      success: false,
      error: data?.error === 'INSUFFICIENT_CREDITS' 
        ? `Insufficient credits. You have ${data.current_balance} credits, but ${data.required} are required.`
        : 'Failed to deduct credits.',
    }
  }

  return {
    success: true,
    newBalance: data.new_balance,
  }
}

/**
 * Fallback deduction in case RPC function is pending execution
 */
async function fallbackDeductCredits(
  supabase: SupabaseClient,
  params: {
    userId: string
    amount: number
    description: string
    serviceType: 'RESUME_BUILD' | 'RESUME_RANKING' | 'COVER_LETTER'
    details?: Record<string, any>
  }
) {
  const credits = await getUserCredits(supabase, params.userId)
  if (credits.current_balance < params.amount) {
    return {
      success: false,
      error: `Insufficient credits. You need ${params.amount} credits, currently have ${credits.current_balance}.`,
    }
  }

  const newBalance = credits.current_balance - params.amount

  const { error: updateError } = await supabase
    .from('rb_credits')
    .update({
      current_balance: newBalance,
      total_consumed: (credits.total_consumed || 0) + params.amount,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', params.userId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Insert ledger transaction
  await supabase.from('rb_credit_transactions').insert({
    user_id: params.userId,
    transaction_type: 'DEBIT',
    amount: params.amount,
    balance_after: newBalance,
    description: params.description,
    metadata: params.details || {},
  })

  // Insert activity history
  await supabase.from('rb_user_history').insert({
    user_id: params.userId,
    service_type: params.serviceType,
    title: params.description,
    status: 'COMPLETED',
    credits_used: params.amount,
    details: params.details || {},
  })

  return { success: true, newBalance }
}

