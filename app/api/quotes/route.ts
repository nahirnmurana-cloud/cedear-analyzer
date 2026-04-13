import { NextResponse } from 'next/server';
import { fetchQuotes } from '@/lib/yahoo';

export const revalidate = 300;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tickersParam = searchParams.get('tickers');

  if (!tickersParam) {
    return NextResponse.json({ quotes: [] });
  }

  const tickers = tickersParam
    .split(',')
    .map((t) => t.trim())
    .filter((t) => /^[A-Z0-9.]{1,12}$/i.test(t));

  if (tickers.length === 0) {
    return NextResponse.json({ quotes: [] });
  }

  if (tickers.length > 50) {
    return NextResponse.json(
      { error: 'Maximo 50 tickers por consulta' },
      { status: 400 }
    );
  }

  try {
    const quotes = await fetchQuotes(tickers);

    const result = quotes.map((q) => ({
      ticker: q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChangePercent,
      volume: q.regularMarketVolume,
    }));

    return NextResponse.json({ quotes: result });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Error obteniendo cotizaciones' },
      { status: 500 }
    );
  }
}
