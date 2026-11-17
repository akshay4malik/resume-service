'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  initialTab?: 'signin' | 'signup';
  onSuccess?: () => void;
  redirectTo?: string;
  isModal?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  initialTab = 'signin',
  onSuccess,
  redirectTo,
  isModal = false,
}) => {
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGoogleClick = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (tab === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }

      setLoading(true);
      try {
        const { error: signUpErr } = await signUpWithEmail(cleanEmail, password);
        if (signUpErr) {
          setError(signUpErr.message);
          setLoading(false);
          return;
        }

        setSuccess('Account created successfully!');
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 600);
        } else if (redirectTo) {
          setTimeout(() => {
            router.push(redirectTo);
          }, 600);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to create account. Please try again.');
        setLoading(false);
      }
    } else {
      // Sign In
      setLoading(true);
      try {
        const { error: signInErr } = await signInWithEmail(cleanEmail, password);
        if (signInErr) {
          setError(signInErr.message);
          setLoading(false);
          return;
        }

        setSuccess('Signed in successfully!');
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 500);
        } else if (redirectTo) {
          setTimeout(() => {
            router.push(redirectTo);
          }, 500);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to sign in. Please check your credentials.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-sky-50 text-sky-600 mb-3 border border-sky-100 shadow-2xs">
          <Sparkles className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {tab === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {tab === 'signin'
            ? 'Sign in to access your resumes, rankings, and credits'
            : 'Get started with 100 free credits immediately'}
        </p>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition disabled:opacity-50 cursor-pointer"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
        ) : (
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
        )}
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-white px-2.5 text-slate-400 font-medium">or continue with email</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setTab('signin');
            setError(null);
            setSuccess(null);
          }}
          className={`py-1.5 rounded-lg transition ${
            tab === 'signin'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('signup');
            setError(null);
            setSuccess(null);
          }}
          className={`py-1.5 rounded-lg transition ${
            tab === 'signup'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Email address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
              disabled={loading}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === 'signup' ? 'Min 6 characters' : 'Enter your password'}
              required
              disabled={loading}
              className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {tab === 'signup' && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Repeat password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                disabled={loading}
                className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer mt-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : tab === 'signin' ? (
            <span>Sign In</span>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      {/* Footer note */}
      <p className="text-[11px] text-slate-400 text-center mt-4">
        {tab === 'signin' ? (
          <>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setError(null);
              }}
              className="text-sky-600 font-semibold hover:underline"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setError(null);
              }}
              className="text-sky-600 font-semibold hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
};

