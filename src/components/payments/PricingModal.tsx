'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Zap, ShieldCheck, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredCredits?: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  requiredCredits,
}) => {
  const { user, refreshCredits } = useAuth();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>('150');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (payload: { packId?: string; customAmount?: number }) => {
    setErrorMsg(null);
    const identifier = payload.customAmount ? 'custom' : payload.packId || 'custom';
    setLoadingPack(identifier);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMsg('Failed to initialize Razorpay checkout script. Please check your connection.');
        setLoadingPack(null);
        return;
      }

      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Kestral AI Labs',
        description: orderData.pack.label,
        order_id: orderData.orderId,
        prefill: {
          email: user?.email || '',
        },
        theme: {
          color: '#0284c7', // Skyblue
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              await refreshCredits();
              onClose();
            } else {
              setErrorMsg(verifyData.error || 'Payment signature verification failed.');
            }
          } catch (e: any) {
            setErrorMsg(e.message);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment initiation failed.');
    } finally {
      setLoadingPack(null);
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          aria-label="Close pricing modal"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-950 transition z-10 shadow-xs cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-md mx-auto pt-2">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2.5 shadow-inner">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
            {requiredCredits ? 'Need More Credits?' : 'Top Up Your Credits'}
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {requiredCredits
              ? `You need ${requiredCredits} credits to complete this action. Choose an option below to instantly recharge your account balance.`
              : 'Add credits anytime to build resumes, optimize ATS keywords, and rank applicant batches.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Transparent Flat Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
          {/* Resume Building - Flat ₹50 */}
          <div className="border-2 border-sky-500 rounded-2xl p-4 sm:p-5 bg-sky-50/20 relative shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">Job Seeker</span>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-950">₹50</span>
                <span className="text-xs font-medium text-slate-500">/ resume build</span>
              </div>
              <p className="text-xs text-sky-700 font-semibold mt-0.5">50 Credits</p>
              <ul className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Full AI JD Optimization</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>All 8 ATS Templates</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Instant Vector PDF Export</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handlePurchase({ packId: 'resume_single' })}
              disabled={loadingPack !== null}
              className="mt-5 w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {loadingPack === 'resume_single' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pay ₹50 (1 Resume)'}
            </button>
          </div>

          {/* Candidate Ranking - Flat ₹2 */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-slate-400 transition bg-slate-50/50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Recruiter & Hiring</span>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-950">₹2</span>
                <span className="text-xs font-medium text-slate-500">/ resume ranked</span>
              </div>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">₹200 for 100 Candidates (200 Credits)</p>
              <ul className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Objective 0–100 JD Matching</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Explainable AI Remarks</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Batch queues of 5</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handlePurchase({ packId: 'recruiter_100' })}
              disabled={loadingPack !== null}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 font-bold text-xs text-white transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loadingPack === 'recruiter_100' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Top Up ₹200 (100 Ranks)'}
            </button>
          </div>
        </div>

        {/* Custom Amount Top-Up Box */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">Custom Credit Recharge</span>
            <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              ₹1 = 1 Credit
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Enter any custom amount you wish to add to your balance (min ₹10).
          </p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
              <input
                type="number"
                min="10"
                max="50000"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="150"
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              onClick={() => handlePurchase({ customAmount: Number(customAmount) })}
              disabled={loadingPack !== null || !customAmount || Number(customAmount) < 10}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
            >
              {loadingPack === 'custom' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              <span>Top Up {customAmount ? `${Math.floor(Number(customAmount))} Credits` : 'Credits'}</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Secured by Razorpay • Instant Crediting • 256-Bit SSL Encrypted</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
