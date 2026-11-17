'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { AuthModal } from './AuthModal';

interface CreditState {
  current_balance: number;
  total_purchased: number;
  total_consumed: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  credits: CreditState | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  openAuthModal: (tab?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  credits: null,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  changePassword: async () => ({ error: null }),
  signOut: async () => {},
  refreshCredits: async () => {},
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<CreditState | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  const supabase = createClient();

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/credits');
      if (res.ok) {
        const data = await res.json();
        if (data.credits) {
          setCredits(data.credits);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchCredits();
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await fetchCredits();
      } else {
        setCredits(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (tab: 'signin' | 'signup' = 'signin') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { error: new Error(error.message) };
    }
    if (data.user) {
      setUser(data.user);
      await fetchCredits();
    }
    return { error: null };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      return { error: new Error(error.message) };
    }
    if (data.user) {
      setUser(data.user);
      await fetchCredits();
    }
    return { error: null };
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user || !user.email) {
      return { error: new Error('You must be signed in to change your password.') };
    }

    // Step 1: Verify current credentials
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });
    if (verifyError) {
      return { error: new Error('Current password is incorrect.') };
    }

    // Step 2: Update password with current_password for compatibility
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      current_password: oldPassword,
    } as any);

    if (updateError) {
      return { error: new Error(updateError.message) };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCredits(null);
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        credits,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        changePassword,
        signOut,
        refreshCredits: fetchCredits,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialTab={authModalTab}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
