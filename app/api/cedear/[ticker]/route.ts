import { NextResponse } from 'next/server';
import { findCedear } from '@/lib/cedears';
import { fetchChartData } from '@/lib/yahoo';
import { computeIndicators } from '@/lib/indicators';
import { computeScore, computeOpportunityScore, getRecommendation } from '@/lib/scoring';
import { generateSummary } from '@/lib/recommendation';
import { CedearAnalysis } from '@/lib/types';

export const revalidate = 300;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();
  const fullTicker = upperTicker.endsWith('.BA')
    ? upperTicker
    : `${upperTicker}.BA`;

  const info = findCedear(fullTicker) || findCedear(upperTicker);

  if (!info) {
    return NextResponse.json(
      { error: `CEDEAR ${ticker} no encontrado` },
      { status: 404 }
    );
  }

  try {
    const { candles, meta } = await fetchChartData(info.ticker, '1y', '1d');

    if (candles.length < 30) {
      return NextResponse.json(
        { error: `Datos insuficientes para ${info.ticker}` },
        { status: 422 }
      );
    }

    const currentPrice = meta.regularMarketPrice || candles[candles.length - 1].close;
    const previousClose = candles[candles.length - 2]?.close ?? currentPrice;

    // Variaciones
    const daily = previousClose > 0 ? ((currentPrice - previousClose) / previousClose) * 100 : 0;
    const weekAgo = candles.length >= 5 ? candles[candles.length - 5].close : currentPrice;
    const weekly = weekAgo > 0 ? ((currentPrice - weekAgo) / weekAgo) * 100 : 0;
    const monthAgo = candles.length >= 22 ? candles[candles.length - 22].close : currentPrice;
    const monthly = monthAgo > 0 ? ((currentPrice - monthAgo) / monthAgo) * 100 : 0;

    const { latest: indicators, series: indicatorSeries } = computeIndicators(candles);
    const score = computeScore(currentPrice, indicators, previousClose);
    const opportunityScore = computeOpportunityScore(currentPrice, indicators, previousClose, candles);
    const recommendation = getRecommendation(score.total);
    const summary = generateSummary(
      info.ticker,
      currentPrice,
      indicators,
      score,
      recommendation
    );

    const analysis: CedearAnalysis = {
      info,
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
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error(`Error analyzing ${info.ticker}:`, error);
    return NextResponse.json(
      { error: `No se pudo obtener datos para ${info.name}. Intenta de nuevo en unos minutos.` },
      { status: 500 }
    );
  }
}
