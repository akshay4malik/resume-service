'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GeoPricingData {
  country: string;
  currency: 'INR' | 'USD';
  symbol: string;
  isIndia: boolean;
  loading: boolean;
  rates: {
    creditsPerDollar: number;
    creditsPerRupee: number;
    resumeBuildCredits: number;
    resumeRankCredits: number;
    prices: {
      resumeBuild: string;
      resumeRank: string;
      bulk100Ranks: string;
      customRate: string;
    };
  };
  switchCurrency: (target: 'INR' | 'USD') => Promise<void>;
}

const DEFAULT_DATA: Omit<GeoPricingData, 'switchCurrency'> = {
  country: 'IN',
  currency: 'INR',
  symbol: '₹',
  isIndia: true,
  loading: true,
  rates: {
    creditsPerDollar: 50,
    creditsPerRupee: 1,
    resumeBuildCredits: 50,
    resumeRankCredits: 2,
    prices: {
      resumeBuild: '₹50',
      resumeRank: '₹2',
      bulk100Ranks: '₹200',
      customRate: '₹1 = 1 Credit',
    },
  },
};

export function useGeoPricing(): GeoPricingData {
  const [data, setData] = useState<Omit<GeoPricingData, 'switchCurrency'>>(DEFAULT_DATA);

  const fetchGeo = useCallback(async () => {
    try {
      const res = await fetch('/api/geo');
      if (res.ok) {
        const json = await res.json();
        setData({
          country: json.country || 'IN',
          currency: json.currency || 'INR',
          symbol: json.symbol || '₹',
          isIndia: json.isIndia ?? (json.currency === 'INR'),
          loading: false,
          rates: json.rates || DEFAULT_DATA.rates,
        });
      } else {
        setData((prev) => ({ ...prev, loading: false }));
      }
    } catch {
      setData((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchGeo();
  }, [fetchGeo]);

  const switchCurrency = useCallback(
    async (target: 'INR' | 'USD') => {
      setData((prev) => ({
        ...prev,
        currency: target,
        symbol: target === 'INR' ? '₹' : '$',
        isIndia: target === 'INR',
        rates: {
          ...prev.rates,
          prices: {
            resumeBuild: target === 'INR' ? '₹50' : '$1',
            resumeRank: target === 'INR' ? '₹2' : '$0.04',
            bulk100Ranks: target === 'INR' ? '₹200' : '$4',
            customRate: target === 'INR' ? '₹1 = 1 Credit' : '$1 = 50 Credits',
          },
        },
      }));

      try {
        await fetch('/api/geo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currency: target }),
        });
      } catch (e) {
        console.error('Failed to persist currency preference:', e);
      }
    },
    []
  );

  return {
    ...data,
    switchCurrency,
  };
}
