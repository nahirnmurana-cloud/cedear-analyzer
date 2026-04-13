import { NextResponse } from 'next/server';
import { CEDEAR_LIST } from '@/lib/cedears';
import { fetchQuotes } from '@/lib/yahoo';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET() {
  try {
    const tickers = CEDEAR_LIST.map((c) => c.ticker);
    const quotes = await fetchQuotes(tickers);

    const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

    const cedears = CEDEAR_LIST.map((c) => {
      const q = quoteMap.get(c.ticker);
      return {
        ...c,
        price: q?.regularMarketPrice ?? 0,
        change: q?.regularMarketChangePercent ?? 0,
        volume: q?.regularMarketVolume ?? 0,
      };
    }).filter((c) => c.price > 0);

    return NextResponse.json({ cedears });
  } catch (error) {
    console.error('Error fetching cedears:', error);
    return NextResponse.json(
      { error: 'Error obteniendo datos de CEDEARs' },
      { status: 500 }
    );
  }
}
