'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  createChart,
  IChartApi,
  LineSeries,
  CandlestickSeries,
} from 'lightweight-charts';
import { IndicatorSeries, Candle } from '@/lib/types';
import { Button } from '@/components/ui/button';

type ChartMode = 'line' | 'candle';
type TimeRange = '1M' | '3M' | '6M' | '1Y';

function filterByRange<T extends { time: string }>(
  data: T[],
  range: TimeRange
): T[] {
  if (data.length === 0) return data;
  const now = new Date();
  const cutoff = new Date();
  switch (range) {
    case '1M':
      cutoff.setMonth(now.getMonth() - 1);
      break;
    case '3M':
      cutoff.setMonth(now.getMonth() - 3);
      break;
    case '6M':
      cutoff.setMonth(now.getMonth() - 6);
      break;
    case '1Y':
      cutoff.setFullYear(now.getFullYear() - 1);
      break;
  }
  const cutoffStr = cutoff.toISOString().split('T')[0];
  return data.filter((d) => d.time >= cutoffStr);
}

export function PriceChart({
  series,
  candles,
}: {
  series: IndicatorSeries;
  candles?: Candle[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [mode, setMode] = useState<ChartMode>(candles ? 'candle' : 'line');
  const [range, setRange] = useState<TimeRange>('1Y');

  const handleResize = useCallback(() => {
    if (containerRef.current && chartRef.current) {
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
      });
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || series.dates.length === 0) return;

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#9ca3af' : '#6b7280';
    const gridColor = isDark
      ? 'rgba(156, 163, 175, 0.08)'
      : 'rgba(156, 163, 175, 0.15)';

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 420,
      layout: {
        background: { color: 'transparent' },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: gridColor },
      timeScale: { borderColor: gridColor, timeVisible: false },
    });
    chartRef.current = chart;

    if (mode === 'candle' && candles && candles.length > 0) {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        wickUpColor: '#22c55e',
        priceLineVisible: false,
      });
      const candleData = candles.map((c) => ({
        time: c.date,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      candleSeries.setData(filterByRange(candleData, range));
    } else {
      const priceSeries = chart.addSeries(LineSeries, {
        color: '#3b82f6',
        lineWidth: 2,
        priceLineVisible: false,
      });
      const lineData = series.dates.map((d, i) => ({
        time: d,
        value: series.close[i],
      }));
      priceSeries.setData(filterByRange(lineData, range));
    }

    // SMA overlays
    const addSma = (
      values: (number | null)[],
      color: string
    ) => {
      const s = chart.addSeries(LineSeries, {
        color,
        lineWidth: 1,
        priceLineVisible: false,
      });
      const smaData = series.dates
        .map((d, i) =>
          values[i] != null ? { time: d, value: values[i]! } : null
        )
        .filter(Boolean) as { time: string; value: number }[];
      s.setData(filterByRange(smaData, range));
    };

    addSma(series.sma20, '#f59e0b');
    addSma(series.sma50, '#8b5cf6');
    addSma(series.sma200, '#ef4444');

    chart.timeScale().fitContent();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current = null;
      chart.remove();
    };
  }, [series, candles, mode, range, handleResize]);

  const ranges: TimeRange[] = ['1M', '3M', '6M', '1Y'];

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-4 h-0.5 inline-block rounded ${mode === 'candle' ? 'bg-green-500' : 'bg-blue-500'}`}
            />{' '}
            Precio
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-amber-500 inline-block rounded" />{' '}
            SMA 20
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-violet-500 inline-block rounded" />{' '}
            SMA 50
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-red-500 inline-block rounded" />{' '}
            SMA 200
          </span>
        </div>
        <div className="flex gap-1">
          {/* Range selector */}
          {ranges.map((r) => (
            <Button
              key={r}
              variant={range === r ? 'default' : 'ghost'}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setRange(r)}
            >
              {r}
            </Button>
          ))}
          {/* Mode toggle */}
          {candles && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs ml-1"
              onClick={() =>
                setMode((m) => (m === 'line' ? 'candle' : 'line'))
              }
            >
              {mode === 'line' ? 'Velas' : 'Linea'}
            </Button>
          )}
        </div>
      </div>
      <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
    </div>
  );
}
