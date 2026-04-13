import YahooFinanceClass from 'yahoo-finance2';
import { Candle } from './types';

const yahooFinance = new (YahooFinanceClass as unknown as new () => InstanceType<typeof YahooFinanceClass>)();

export interface ChartResult {
  candles: Candle[];
  meta: {
    regularMarketPrice: number;
    chartPreviousClose: number;
    currency: string;
    symbol: string;
  };
}

// In-memory cache to reduce API calls
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function fetchChartData(
  ticker: string,
  range: string = '1y',
  _interval: string = '1d'
): Promise<ChartResult> {
  const cacheKey = `chart:${ticker}:${range}:${_interval}`;
  const cached = getCached<ChartResult>(cacheKey);
  if (cached) return cached;

  const endDate = new Date();
  const startDate = new Date();
  switch (range) {
    case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break;
    case '6mo': startDate.setMonth(startDate.getMonth() - 6); break;
    case '3mo': startDate.setMonth(startDate.getMonth() - 3); break;
    case '1mo': startDate.setMonth(startDate.getMonth() - 1); break;
    default: startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const result = await yahooFinance.chart(ticker, {
    period1: startDate,
    period2: endDate,
    interval: '1d' as '1d',
  });

  const meta = {
    regularMarketPrice: result.meta.regularMarketPrice ?? 0,
    chartPreviousClose: result.meta.chartPreviousClose ?? 0,
    currency: result.meta.currency ?? 'ARS',
    symbol: result.meta.symbol ?? ticker,
  };

  const candles: Candle[] = [];
  for (const q of result.quotes) {
    if (q.open != null && q.high != null && q.low != null && q.close != null && q.volume != null && q.date) {
      candles.push({
        date: q.date.toISOString().split('T')[0],
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
        volume: q.volume,
      });
    }
  }

  const chartResult = { candles, meta };
  setCache(cacheKey, chartResult);
  return chartResult;
}

export interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketPreviousClose: number;
}

export async function fetchQuote(ticker: string): Promise<YahooQuote> {
  const cacheKey = `quote:${ticker}`;
  const cached = getCached<YahooQuote>(cacheKey);
  if (cached) return cached;

  const result = await yahooFinance.quote(ticker);

  const quoteResult: YahooQuote = {
    symbol: result.symbol ?? ticker,
    regularMarketPrice: (result.regularMarketPrice as number) ?? 0,
    regularMarketChange: (result.regularMarketChange as number) ?? 0,
    regularMarketChangePercent: (result.regularMarketChangePercent as number) ?? 0,
    regularMarketVolume: (result.regularMarketVolume as number) ?? 0,
    regularMarketPreviousClose: (result.regularMarketPreviousClose as number) ?? 0,
  };
  setCache(cacheKey, quoteResult);
  return quoteResult;
}

export async function fetchQuotes(tickers: string[]): Promise<YahooQuote[]> {
  const results: YahooQuote[] = [];

  for (let i = 0; i < tickers.length; i++) {
    try {
      const quote = await fetchQuote(tickers[i]);
      results.push(quote);
    } catch {
      // Skip tickers that fail
    }
    if (i < tickers.length - 1 && i % 5 === 4) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return results;
}
