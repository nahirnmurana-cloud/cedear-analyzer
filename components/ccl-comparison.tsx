'use client';

import { CedearInfo } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useSWR from 'swr';

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

interface SubyacenteData {
  currentPrice: number;
  previousClose: number;
}

export function CclComparison({
  info,
  cedearPrice,
}: {
  info: CedearInfo;
  cedearPrice: number;
}) {
  // Fetch subyacente price in USD
  const { data, isLoading } = useSWR<SubyacenteData>(
    `/api/cedear/${encodeURIComponent(info.localTicker)}?underlying=true`,
    async (url: string) => {
      // Fetch the underlying US ticker directly
      const res = await fetcher<{ currentPrice: number; previousClose: number }>(
        `/api/underlying/${encodeURIComponent(info.localTicker)}`
      );
      return res;
    },
    { refreshInterval: 300000 }
  );

  if (isLoading || !data || data.currentPrice === 0) return null;

  const usdPrice = data.currentPrice;
  const cclImplicito =
    info.ratio > 0 && usdPrice > 0 ? (cedearPrice * info.ratio) / usdPrice : 0;
  const changeUsd =
    data.previousClose > 0
      ? ((usdPrice - data.previousClose) / data.previousClose) * 100
      : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          CEDEAR vs Subyacente
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Comparacion con {info.localTicker} en NYSE/NASDAQ y tipo de cambio
          implicito (CCL)
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {info.localTicker} (USD)
            </p>
            <p className="text-lg font-bold tabular-nums">
              US${usdPrice.toFixed(2)}
            </p>
            <p
              className={`text-xs font-medium ${changeUsd >= 0 ? 'text-green-500' : 'text-red-500'}`}
            >
              {changeUsd >= 0 ? '+' : ''}
              {changeUsd.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              CEDEAR (ARS)
            </p>
            <p className="text-lg font-bold tabular-nums">
              ${cedearPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Ratio
            </p>
            <p className="text-lg font-bold tabular-nums">{info.ratio}:1</p>
            <p className="text-xs text-muted-foreground">
              {info.ratio} CEDEAR = 1 accion
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              CCL Implicito
            </p>
            <p className="text-lg font-bold tabular-nums text-primary">
              ${cclImplicito.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">ARS/USD</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
