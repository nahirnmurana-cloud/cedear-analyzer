'use client';

import useSWR from 'swr';
import { CedearAnalysis } from '@/lib/types';

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

export function useCedearAnalysis(ticker: string | null) {
  const { data, error, isLoading, mutate } = useSWR<CedearAnalysis>(
    ticker ? `/api/cedear/${encodeURIComponent(ticker)}` : null,
    fetcher,
    { refreshInterval: 300000, shouldRetryOnError: false }
  );

  return { data, error, isLoading, refresh: mutate };
}

export function useTopOpportunities() {
  const { data, error, isLoading } = useSWR<{
    top: CedearAnalysis[];
    analyzed?: number;
    totalCedears?: number;
    skippedLowVolume?: number;
    skippedError?: number;
  }>(
    '/api/top',
    fetcher,
    { refreshInterval: 900000 }
  );

  return {
    top: data?.top ?? [],
    analyzed: data?.analyzed ?? 0,
    totalCedears: data?.totalCedears ?? 0,
    error,
    isLoading,
  };
}

export function useCedearList() {
  const { data, error, isLoading } = useSWR<{
    cedears: Array<{
      ticker: string;
      name: string;
      localTicker: string;
      sector: string;
      ratio: number;
      price: number;
      change: number;
      volume: number;
    }>;
  }>('/api/cedears', fetcher, { refreshInterval: 300000 });

  return { cedears: data?.cedears ?? [], error, isLoading };
}
