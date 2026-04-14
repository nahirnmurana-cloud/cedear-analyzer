import { NextResponse } from 'next/server';
import { CEDEAR_LIST } from '@/lib/cedears';
import { fetchChartData } from '@/lib/yahoo';
import { computeIndicators } from '@/lib/indicators';
import { computeScore, computeOpportunityScore, getRecommendation } from '@/lib/scoring';
import { generateSummary } from '@/lib/recommendation';
import { CedearAnalysis } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 900;
export const maxDuration = 120;

const MIN_AVG_VOLUME = 500;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  );
  return Promise.race([promise, timeout]);
}

export async function GET() {
  try {
    const analyses: CedearAnalysis[] = [];
    let skippedLowVolume = 0;
    let skippedError = 0;

    for (const cedear of CEDEAR_LIST) {
      try {
        const { candles, meta } = await withTimeout(
          fetchChartData(cedear.ticker, '1y', '1d'),
          8000
        );
        if (candles.length < 50) continue;

        // Filtro de liquidez: volumen promedio de ultimas 20 ruedas
        const recentCandles = candles.slice(-20);
        const avgVolume =
          recentCandles.reduce((s, c) => s + c.volume, 0) / recentCandles.length;
        if (avgVolume < MIN_AVG_VOLUME) {
          skippedLowVolume++;
          continue;
        }

        const currentPrice = meta.regularMarketPrice || candles[candles.length - 1].close;
        const previousClose = candles[candles.length - 2]?.close ?? currentPrice;

        const daily = previousClose > 0 ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
        const weekAgo = candles.length >= 5 ? candles[candles.length - 5].close : currentPrice;
        const weekly = weekAgo > 0 ? ((currentPrice - weekAgo) / weekAgo) * 100 : 0;
        const monthAgo = candles.length >= 22 ? candles[candles.length - 22].close : currentPrice;
        const monthly = monthAgo > 0 ? ((currentPrice - monthAgo) / monthAgo) * 100 : 0;

        const { latest: indicators, series: indicatorSeries } = computeIndicators(candles);
        const score = computeScore(currentPrice, indicators, previousClose);
        const opportunityScore = computeOpportunityScore(currentPrice, indicators, previousClose);
        const recommendation = getRecommendation(score.total);
        const summary = generateSummary(cedear.ticker, currentPrice, indicators, score, recommendation);

        analyses.push({
          info: cedear,
          currentPrice,
          previousClose,
          change: { daily, weekly, monthly },
          candles,
          indicators,
          indicatorSeries,
          score,
          opportunityScore,
          recommendation,
          summary,
          lastUpdated: new Date().toISOString(),
        });
      } catch {
        skippedError++;
        continue;
      }
    }

    // Ordenar por OPORTUNIDAD de compra, no por salud tecnica
    analyses.sort((a, b) => b.opportunityScore.total - a.opportunityScore.total);
    const top = analyses.slice(0, 5).map((a) => ({
      ...a,
      candles: [],
      indicatorSeries: {
        dates: [], close: [], sma20: [], sma50: [], sma200: [],
        rsi: [], macdLine: [], macdSignal: [], macdHistogram: [],
        plusDI: [], minusDI: [], adx: [], volume: [],
        bollingerUpper: [], bollingerLower: [], atr: [],
        stochasticK: [], stochasticD: [],
      },
    }));

    return NextResponse.json({
      top,
      analyzed: analyses.length,
      totalCedears: CEDEAR_LIST.length,
      skippedLowVolume,
      skippedError,
    });
  } catch (error) {
    console.error('Error computing top:', error);
    return NextResponse.json(
      { error: 'Error calculando top oportunidades' },
      { status: 500 }
    );
  }
}
