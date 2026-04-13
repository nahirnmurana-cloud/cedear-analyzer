'use client';

import { TechnicalIndicators } from '@/lib/types';

function Signal({ bullish }: { bullish: boolean | null }) {
  if (bullish === null) return <span className="text-muted-foreground">-</span>;
  return bullish ? (
    <span className="text-green-500 font-bold">Alcista</span>
  ) : (
    <span className="text-red-500 font-bold">Bajista</span>
  );
}

export function IndicatorSummary({
  indicators,
  price,
}: {
  indicators: TechnicalIndicators;
  price: number;
}) {
  const rows = [
    {
      name: 'SMA 20',
      value: indicators.sma20?.toFixed(2) ?? '-',
      signal: indicators.sma20 != null ? price > indicators.sma20 : null,
    },
    {
      name: 'SMA 50',
      value: indicators.sma50?.toFixed(2) ?? '-',
      signal: indicators.sma50 != null ? price > indicators.sma50 : null,
    },
    {
      name: 'SMA 200',
      value: indicators.sma200?.toFixed(2) ?? '-',
      signal: indicators.sma200 != null ? price > indicators.sma200 : null,
    },
    {
      name: 'RSI (14)',
      value: indicators.rsi?.toFixed(1) ?? '-',
      signal:
        indicators.rsi != null
          ? indicators.rsi >= 50 && indicators.rsi <= 70
            ? true
            : indicators.rsi < 30 || indicators.rsi > 70
              ? false
              : null
          : null,
    },
    {
      name: 'MACD',
      value: indicators.macd?.macdLine.toFixed(4) ?? '-',
      signal: indicators.macd
        ? indicators.macd.macdLine > indicators.macd.signalLine
        : null,
    },
    {
      name: 'ADX',
      value: indicators.dmi?.adx.toFixed(1) ?? '-',
      signal: indicators.dmi ? indicators.dmi.adx > 25 : null,
    },
    {
      name: 'DMI',
      value: indicators.dmi
        ? `+${indicators.dmi.plusDI.toFixed(1)} / -${indicators.dmi.minusDI.toFixed(1)}`
        : '-',
      signal: indicators.dmi
        ? indicators.dmi.plusDI > indicators.dmi.minusDI
        : null,
    },
    {
      name: 'Volumen Rel.',
      value: indicators.volume.relative.toFixed(2) + 'x',
      signal: indicators.volume.relative > 1.0 ? true : indicators.volume.relative < 0.6 ? false : null,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 font-medium">Indicador</th>
            <th className="text-right py-2 font-medium">Valor</th>
            <th className="text-right py-2 font-medium">Senal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-muted/50">
              <td className="py-2 text-muted-foreground">{row.name}</td>
              <td className="py-2 text-right font-mono">{row.value}</td>
              <td className="py-2 text-right">
                <Signal bullish={row.signal} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
