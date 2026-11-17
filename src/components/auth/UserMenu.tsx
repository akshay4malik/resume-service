'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { PricingModal } from '../payments/PricingModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { LogOut, Coins, History, KeyRound } from 'lucide-react';
import Link from 'next/link';

export const UserMenu: React.FC = () => {
  const { user, credits, openAuthModal, signOut } = useAuth();
  const [showPricing, setShowPricing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) {
    return (
      <button
        onClick={() => openAuthModal('signin')}
        className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-800 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Credits Badge */}
        <button
          onClick={() => setShowPricing(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 hover:border-sky-300 text-sky-800 text-xs font-bold transition shadow-xs group cursor-pointer"
          title="Click to recharge credits"
        >
          <Coins className="w-3.5 h-3.5 text-sky-600 group-hover:rotate-12 transition-transform" />
          <span>{credits?.current_balance ?? 100} Credits</span>
          <span className="text-[10px] text-sky-600 bg-white px-1.5 py-0.5 rounded-md border border-sky-200">
            + Add
          </span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1 rounded-full border border-slate-200 hover:border-slate-300 transition cursor-pointer"
          >
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={user.email || 'User'}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs font-bold">
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </div>
            )}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900 truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kestral User'}
                </p>
                <p className="text-slate-500 truncate text-[11px]">{user.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/history"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition"
                >
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>Activity & History</span>
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowPricing(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition text-left cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 text-sky-600" />
                  <span>Buy Credits</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowChangePassword(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition text-left cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  <span>Change Password</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </>
  );
};
