import { NextResponse } from 'next/server';
import { fetchChartData } from '@/lib/yahoo';

export const revalidate = 300;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;

  try {
    // Fetch the US ticker (no .BA suffix)
    const usTicker = ticker.toUpperCase().replace('.BA', '');
    const { meta } = await fetchChartData(usTicker, '5d', '1d');

    return NextResponse.json({
      currentPrice: meta.regularMarketPrice,
      previousClose: meta.chartPreviousClose,
      symbol: meta.symbol,
      currency: meta.currency,
    });
  } catch (error) {
    console.error(`Error fetching underlying ${ticker}:`, error);
    return NextResponse.json(
      { currentPrice: 0, previousClose: 0, symbol: ticker, currency: 'USD' },
      { status: 200 }
    );
  }
}
