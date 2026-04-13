'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cedear-watchlist';

export function useWatchlist() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTickers(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((newTickers: string[]) => {
    setTickers(newTickers);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTickers));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const addTicker = useCallback(
    (ticker: string) => {
      const upper = ticker.toUpperCase();
      if (!tickers.includes(upper)) {
        persist([...tickers, upper]);
      }
    },
    [tickers, persist]
  );

  const removeTicker = useCallback(
    (ticker: string) => {
      const upper = ticker.toUpperCase();
      persist(tickers.filter((t) => t !== upper));
    },
    [tickers, persist]
  );

  const isSaved = useCallback(
    (ticker: string) => tickers.includes(ticker.toUpperCase()),
    [tickers]
  );

  return { tickers, addTicker, removeTicker, isSaved, loaded };
}
