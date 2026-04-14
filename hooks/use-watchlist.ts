'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

const STORAGE_KEY = 'cedear-watchlist';

export function useWatchlist() {
  const { user, isLoaded: userLoaded } = useUser();
  const isLoggedIn = userLoaded && !!user;

  const [tickers, setTickers] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load watchlist: from API if logged in, from localStorage if not
  useEffect(() => {
    if (!userLoaded) return;

    if (isLoggedIn) {
      fetch('/api/watchlist')
        .then((r) => r.json())
        .then((data) => {
          setTickers(data.tickers || []);
          setLoaded(true);
        })
        .catch(() => {
          setTickers([]);
          setLoaded(true);
        });
    } else {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setTickers(JSON.parse(stored));
      } catch {
        // ignore
      }
      setLoaded(true);
    }
  }, [userLoaded, isLoggedIn]);

  const addTicker = useCallback(
    async (ticker: string) => {
      const upper = ticker.toUpperCase();
      if (tickers.includes(upper)) return;

      const updated = [...tickers, upper];
      setTickers(updated);

      if (isLoggedIn) {
        try {
          const res = await fetch('/api/watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker: upper }),
          });
          const data = await res.json();
          if (data.tickers) setTickers(data.tickers);
        } catch {
          // Optimistic update already applied
        }
      } else {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
    },
    [tickers, isLoggedIn]
  );

  const removeTicker = useCallback(
    async (ticker: string) => {
      const upper = ticker.toUpperCase();
      const updated = tickers.filter((t) => t !== upper);
      setTickers(updated);

      if (isLoggedIn) {
        try {
          const res = await fetch('/api/watchlist', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker: upper }),
          });
          const data = await res.json();
          if (data.tickers) setTickers(data.tickers);
        } catch {
          // Optimistic update already applied
        }
      } else {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
    },
    [tickers, isLoggedIn]
  );

  const isSaved = useCallback(
    (ticker: string) => tickers.includes(ticker.toUpperCase()),
    [tickers]
  );

  return { tickers, addTicker, removeTicker, isSaved, loaded, isLoggedIn };
}
