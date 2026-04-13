'use client';

import { METRIC_DESCRIPTIONS } from '@/lib/metric-descriptions';
import { TechnicalIndicators } from '@/lib/types';

function SignalBadge({ bullish }: { bullish: boolean | null }) {
  if (bullish === null)
    return (
      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
        Neutral
      </span>
    );
  return bullish ? (
    <span className="text-[10px] font-medium text-green-700 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
      Alcista
    </span>
  ) : (
    <span className="text-[10px] font-medium text-red-700 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
      Bajista
    </span>
  );
}

function SignalDot({ bullish }: { bullish: boolean | null }) {
  if (bullish === null)
    return (
      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 inline-block shrink-0" />
    );
  return bullish ? (
    <span className="w-2 h-2 rounded-full bg-green-500 inline-block shrink-0" />
  ) : (
    <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0" />
  );
}

interface MetricRowProps {
  metricKey: string;
  value: string;
  bullish: boolean | null;
}

function MetricRow({ metricKey, value, bullish }: MetricRowProps) {
  const desc = METRIC_DESCRIPTIONS[metricKey];
  if (!desc) return null;

  const activeInterpretation = bullish === true ? desc.bullish : bullish === false ? desc.bearish : null;

  return (
    <div className="py-3 border-b border-muted/30 last:border-0">
      {/* Header: nombre, valor, senal */}
      <div className="flex items-center gap-2.5 mb-1.5">
        <SignalDot bullish={bullish} />
        <span className="font-semibold text-sm">{desc.name}</span>
        <span className="ml-auto font-mono text-sm tabular-nums">{value}</span>
        <SignalBadge bullish={bullish} />
      </div>

      {/* Descripcion siempre visible */}
      <div className="ml-[18px] space-y-1.5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {desc.detail}
        </p>

        {/* Interpretacion */}
        <div className="bg-muted/30 rounded-md px-2.5 py-2 text-xs">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground/80">Interpretacion: </span>
            {desc.interpretation}
          </p>
        </div>

        {/* Que esta pasando ahora con este indicador */}
        {activeInterpretation && (
          <div
            className={`rounded-md px-2.5 py-1.5 text-xs ${
              bullish
                ? 'bg-green-500/8 border border-green-500/15 text-green-700 dark:text-green-400'
                : 'bg-red-500/8 border border-red-500/15 text-red-700 dark:text-red-400'
            }`}
          >
            <span className="font-medium">
              {bullish ? 'Senal alcista: ' : 'Senal bajista: '}
            </span>
            {activeInterpretation}
          </div>
        )}
      </div>
    </div>
  );
}

export function MetricDetailPanel({
  indicators,
  price,
}: {
  indicators: TechnicalIndicators;
  price: number;
}) {
  const metrics: MetricRowProps[] = [
    {
      metricKey: 'sma20',
      value: indicators.sma20?.toFixed(2) ?? '-',
      bullish: indicators.sma20 != null ? price > indicators.sma20 : null,
    },
    {
      metricKey: 'sma50',
      value: indicators.sma50?.toFixed(2) ?? '-',
      bullish: indicators.sma50 != null ? price > indicators.sma50 : null,
    },
    {
      metricKey: 'sma200',
      value: indicators.sma200?.toFixed(2) ?? '-',
      bullish: indicators.sma200 != null ? price > indicators.sma200 : null,
    },
    {
      metricKey: 'rsi',
      value: indicators.rsi?.toFixed(1) ?? '-',
      bullish:
        indicators.rsi != null
          ? indicators.rsi >= 50 && indicators.rsi <= 70
          : null,
    },
    {
      metricKey: 'macd',
      value: indicators.macd?.macdLine.toFixed(4) ?? '-',
      bullish: indicators.macd
        ? indicators.macd.macdLine > indicators.macd.signalLine
        : null,
    },
    {
      metricKey: 'adx',
      value: indicators.dmi?.adx.toFixed(1) ?? '-',
      bullish: indicators.dmi ? indicators.dmi.adx > 25 : null,
    },
    {
      metricKey: 'dmi',
      value: indicators.dmi
        ? `+${indicators.dmi.plusDI.toFixed(1)} / -${indicators.dmi.minusDI.toFixed(1)}`
        : '-',
      bullish: indicators.dmi
        ? indicators.dmi.plusDI > indicators.dmi.minusDI
        : null,
    },
    {
      metricKey: 'volume',
      value: `${indicators.volume.relative.toFixed(2)}x`,
      bullish:
        indicators.volume.relative > 1.0
          ? true
          : indicators.volume.relative < 0.6
            ? false
            : null,
    },
    {
      metricKey: 'bollinger',
      value: indicators.bollinger
        ? `%B ${indicators.bollinger.percentB.toFixed(1)}%`
        : '-',
      bullish: indicators.bollinger
        ? indicators.bollinger.percentB > 20 && indicators.bollinger.percentB < 80
        : null,
    },
    {
      metricKey: 'atr',
      value: indicators.atr?.toFixed(2) ?? '-',
      bullish:
        indicators.atr != null && price > 0
          ? (indicators.atr / price) * 100 < 3
          : null,
    },
    {
      metricKey: 'stochastic',
      value: indicators.stochastic
        ? `%K ${indicators.stochastic.k.toFixed(1)} / %D ${indicators.stochastic.d.toFixed(1)}`
        : '-',
      bullish: indicators.stochastic
        ? indicators.stochastic.k > indicators.stochastic.d &&
          indicators.stochastic.k > 20 &&
          indicators.stochastic.k < 80
        : null,
    },
    {
      metricKey: 'support',
      value: `$${indicators.support.toLocaleString('es-AR')}`,
      bullish:
        price > 0 && (price - indicators.support) / price < 0.03
          ? true
          : null,
    },
    {
      metricKey: 'resistance',
      value: `$${indicators.resistance.toLocaleString('es-AR')}`,
      bullish: price > indicators.resistance ? true : null,
    },
  ];

  return (
    <div>
      {metrics.map((m) => (
        <MetricRow key={m.metricKey} {...m} />
      ))}
    </div>
  );
}
