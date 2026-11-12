'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

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
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  credits: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshCredits: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<CreditState | null>(null);
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

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
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
        signOut,
        refreshCredits: fetchCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

