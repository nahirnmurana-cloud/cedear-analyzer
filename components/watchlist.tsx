'use client';

import { useWatchlist } from '@/hooks/use-watchlist';
import { findCedear } from '@/lib/cedears';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecommendationBadge } from './recommendation-badge';
import { CedearAnalysis, Recommendation } from '@/lib/types';
import useSWR from 'swr';

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

function WatchlistCard({
  ticker,
  onRemove,
}: {
  ticker: string;
  onRemove: () => void;
}) {
  const info = findCedear(ticker);
  const { data, isLoading } = useSWR<CedearAnalysis>(
    `/api/cedear/${encodeURIComponent(ticker)}`,
    fetcher,
    { refreshInterval: 300000 }
  );

  const changeColor =
    data && data.change.daily >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <Card className="hover:shadow-md hover:border-primary/20 transition-all group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            href={`/cedear/${encodeURIComponent(ticker)}`}
            className="flex-1 min-w-0"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg group-hover:text-primary transition-colors">
                {ticker.replace('.BA', '')}
              </span>
              {data && <RecommendationBadge recommendation={data.recommendation} />}
              {isLoading && (
                <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {info?.name ?? ticker}
            </p>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-500 h-7 w-7 p-0 shrink-0"
            onClick={onRemove}
            aria-label={`Quitar ${ticker.replace('.BA', '')} de watchlist`}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        {data && (
          <>
            {/* Precio y variacion */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl font-bold tabular-nums">
                $
                {data.currentPrice.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span
                className={`text-xs font-semibold tabular-nums ${changeColor}`}
              >
                {data.change.daily >= 0 ? '+' : ''}
                {data.change.daily.toFixed(2)}%
              </span>
            </div>

            {/* Score bar */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${data.score.total}%`,
                    backgroundColor:
                      data.score.total >= 65
                        ? '#22c55e'
                        : data.score.total >= 45
                          ? '#eab308'
                          : '#ef4444',
                  }}
                />
              </div>
              <span className="text-sm font-bold tabular-nums w-8 text-right">
                {data.score.total}
              </span>
            </div>

            {/* Resumen */}
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {data.summary}
            </p>
          </>
        )}

        {isLoading && !data && (
          <div className="space-y-2 animate-pulse mt-1">
            <div className="h-6 bg-muted rounded w-32" />
            <div className="h-1.5 bg-muted rounded-full" />
            <div className="h-8 bg-muted rounded" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Watchlist() {
  const { tickers, removeTicker, loaded } = useWatchlist();

  if (!loaded) return null;

  if (tickers.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Mi Watchlist</h2>
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <svg
              className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
            <p className="font-medium">Tu watchlist esta vacia</p>
            <p className="text-sm mt-1">
              Busca un CEDEAR y agregalo para seguirlo de cerca
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Mi Watchlist</h2>
          <p className="text-sm text-muted-foreground">
            Analisis y valoracion de tus CEDEARs guardados
          </p>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {tickers.length} {tickers.length === 1 ? 'activo' : 'activos'}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickers.map((ticker) => (
          <WatchlistCard
            key={ticker}
            ticker={ticker}
            onRemove={() => removeTicker(ticker)}
          />
        ))}
      </div>
    </div>
  );
}
