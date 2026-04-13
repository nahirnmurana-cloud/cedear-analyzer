'use client';

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from 'recharts';
import { Candle } from '@/lib/types';
import { runBacktest, BacktestResult, Trade } from '@/lib/backtesting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// ─── KPI Card ────────────────────────────────────────

function KPI({
  label,
  value,
  color,
  subtitle,
}: {
  label: string;
  value: string;
  color?: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/30">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
        {label}
      </p>
      <p className={`text-xl font-bold tabular-nums ${color ?? ''}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-[10px] text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

// ─── Trade Detail ────────────────────────────────────

function TradeDetail({ trade }: { trade: Trade }) {
  return (
    <div className="px-4 pb-3 space-y-3 text-xs animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Entry */}
        <div className="bg-green-500/5 border border-green-500/15 rounded-lg p-3">
          <p className="font-semibold text-green-700 dark:text-green-400 mb-1.5">
            Compra — {trade.entryDate}
          </p>
          <p className="text-muted-foreground mb-1">
            Score: <span className="font-medium text-foreground">{trade.entryScore}</span>
            {' · '}Precio: <span className="font-medium text-foreground">${trade.entryPrice.toLocaleString('es-AR')}</span>
          </p>
          <ul className="space-y-0.5 text-muted-foreground">
            {trade.entryReasons.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">+</span> {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Exit */}
        {trade.status === 'closed' ? (
          <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3">
            <p className="font-semibold text-red-700 dark:text-red-400 mb-1.5">
              Venta — {trade.exitDate}
            </p>
            <p className="text-muted-foreground mb-1">
              Score: <span className="font-medium text-foreground">{trade.exitScore}</span>
              {' · '}Precio: <span className="font-medium text-foreground">${trade.exitPrice?.toLocaleString('es-AR')}</span>
            </p>
            <ul className="space-y-0.5 text-muted-foreground">
              {trade.exitReasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-red-500 mt-0.5">-</span> {r}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-3 flex items-center justify-center">
            <p className="text-blue-700 dark:text-blue-400 font-medium">
              Posicion abierta
              <br />
              <span className="text-muted-foreground font-normal">
                {trade.holdingDays} dias en posicion
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Trades Table ────────────────────────────────────

type TradeFilter = 'all' | 'winners' | 'losers' | 'open';

function TradesTable({ trades }: { trades: Trade[] }) {
  const [filter, setFilter] = useState<TradeFilter>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = trades.filter((t) => {
    switch (filter) {
      case 'winners':
        return t.status === 'closed' && t.returnPct > 0;
      case 'losers':
        return t.status === 'closed' && t.returnPct <= 0;
      case 'open':
        return t.status === 'open';
      default:
        return true;
    }
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Historial de trades</h4>
        <div className="flex gap-1">
          {(
            [
              ['all', 'Todos'],
              ['winners', 'Ganadores'],
              ['losers', 'Perdedores'],
              ['open', 'Abiertos'],
            ] as [TradeFilter, string][]
          ).map(([key, label]) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'ghost'}
              size="sm"
              className="h-6 px-2 text-[10px]"
              onClick={() => setFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          Sin trades en esta categoria.
        </p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[3rem_1fr_5rem_1fr_5rem_3.5rem_4.5rem_4.5rem] gap-1 px-3 py-1.5 bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            <span>#</span>
            <span>Compra</span>
            <span className="text-right">Precio</span>
            <span>Venta</span>
            <span className="text-right">Precio</span>
            <span className="text-right">Dias</span>
            <span className="text-right">Retorno</span>
            <span className="text-right">Estado</span>
          </div>
          {/* Rows */}
          {filtered.map((t) => (
            <div key={t.id}>
              <button
                className="w-full grid grid-cols-[3rem_1fr_5rem_1fr_5rem_3.5rem_4.5rem_4.5rem] gap-1 px-3 py-2 text-xs hover:bg-muted/30 transition-colors text-left items-center"
                onClick={() =>
                  setExpandedId(expandedId === t.id ? null : t.id)
                }
              >
                <span className="font-medium text-muted-foreground">
                  {t.id}
                </span>
                <span>{t.entryDate}</span>
                <span className="text-right tabular-nums">
                  ${t.entryPrice.toLocaleString('es-AR')}
                </span>
                <span>{t.exitDate ?? '—'}</span>
                <span className="text-right tabular-nums">
                  {t.exitPrice
                    ? `$${t.exitPrice.toLocaleString('es-AR')}`
                    : '—'}
                </span>
                <span className="text-right tabular-nums">
                  {t.holdingDays}
                </span>
                <span
                  className={`text-right font-semibold tabular-nums ${
                    t.returnPct > 0
                      ? 'text-green-500'
                      : t.returnPct < 0
                        ? 'text-red-500'
                        : ''
                  }`}
                >
                  {t.returnPct >= 0 ? '+' : ''}
                  {t.returnPct.toFixed(2)}%
                </span>
                <span className="text-right">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      t.status === 'open'
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        : t.returnPct > 0
                          ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                          : 'bg-red-500/15 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {t.status === 'open'
                      ? 'Abierta'
                      : t.returnPct > 0
                        ? 'Ganador'
                        : 'Perdedor'}
                  </span>
                </span>
              </button>
              {expandedId === t.id && <TradeDetail trade={t} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Equity Chart ────────────────────────────────────

function EquityChart({ result }: { result: BacktestResult }) {
  const data = result.equityCurve.map((p) => ({
    date: p.date.slice(5),
    fullDate: p.date,
    strategy: p.strategy,
    buyAndHold: p.buyAndHold,
  }));

  // Mark BUY/SELL points
  const buyPoints = result.trades.map((t) => ({
    date: t.entryDate.slice(5),
    value:
      result.equityCurve.find((e) => e.date === t.entryDate)?.strategy ?? 100,
  }));
  const sellPoints = result.trades
    .filter((t) => t.exitDate)
    .map((t) => ({
      date: t.exitDate!.slice(5),
      value:
        result.equityCurve.find((e) => e.date === t.exitDate)?.strategy ?? 100,
    }));

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Curva de capital</h4>
      <div className="flex gap-4 text-xs text-muted-foreground mb-1">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-blue-500 inline-block rounded" />{' '}
          Estrategia
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-gray-400 inline-block rounded" />{' '}
          Buy & Hold
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 inline-block rounded-full" />{' '}
          Compra
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-red-500 inline-block rounded-full" />{' '}
          Venta
        </span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(156,163,175,0.1)"
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            width={40}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value, name) => [
              `${Number(value).toFixed(2)}`,
              name === 'strategy' ? 'Estrategia' : 'Buy & Hold',
            ]}
          />
          <Line
            type="monotone"
            dataKey="strategy"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={2}
            name="strategy"
          />
          <Line
            type="monotone"
            dataKey="buyAndHold"
            stroke="#9ca3af"
            dot={false}
            strokeWidth={1}
            strokeDasharray="4 2"
            name="buyAndHold"
          />
          {/* BUY markers */}
          {buyPoints.map((p, i) => (
            <ReferenceDot
              key={`b${i}`}
              x={p.date}
              y={p.value}
              r={4}
              fill="#22c55e"
              stroke="white"
              strokeWidth={1}
            />
          ))}
          {/* SELL markers */}
          {sellPoints.map((p, i) => (
            <ReferenceDot
              key={`s${i}`}
              x={p.date}
              y={p.value}
              r={4}
              fill="#ef4444"
              stroke="white"
              strokeWidth={1}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main Panel ──────────────────────────────────────

export function BacktestPanel({
  candles,
  currentPrice,
}: {
  candles: Candle[];
  currentPrice: number;
}) {
  const result = useMemo(() => runBacktest(candles), [candles]);

  if (!result) return null;

  const retColor = (v: number) =>
    v > 0 ? 'text-green-500' : v < 0 ? 'text-red-500' : '';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Backtesting</CardTitle>
          <span className="text-sm font-semibold tabular-nums">
            Precio actual: ${currentPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Simulacion historica de la estrategia de scoring. Periodo:{' '}
          {result.periodStart} a {result.periodEnd}. Compra con score &ge; 65,
          vende con score &lt; 40. Evaluacion semanal. No incluye comisiones,
          spread ni slippage.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 1. KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          <KPI
            label="Estrategia"
            value={`${result.strategyReturn >= 0 ? '+' : ''}${result.strategyReturn.toFixed(2)}%`}
            color={retColor(result.strategyReturn)}
          />
          <KPI
            label="Buy & Hold"
            value={`${result.buyAndHoldReturn >= 0 ? '+' : ''}${result.buyAndHoldReturn.toFixed(2)}%`}
            color={retColor(result.buyAndHoldReturn)}
          />
          <KPI
            label="Alpha"
            value={`${result.alpha >= 0 ? '+' : ''}${result.alpha.toFixed(2)} pp`}
            color={retColor(result.alpha)}
          />
          <KPI
            label="Trades"
            value={String(result.closedTrades)}
            subtitle={`${result.winners}G / ${result.losers}P`}
          />
          <KPI
            label="Win Rate"
            value={`${result.winRate}%`}
            color={result.winRate >= 50 ? 'text-green-500' : 'text-red-500'}
          />
          <KPI
            label="Profit Factor"
            value={
              result.profitFactor >= 999
                ? '∞'
                : result.profitFactor.toFixed(2)
            }
            color={result.profitFactor >= 1 ? 'text-green-500' : 'text-red-500'}
          />
          <KPI
            label="Max Drawdown"
            value={`${result.maxDrawdown.toFixed(1)}%`}
            color="text-red-500"
          />
          <KPI
            label="Ret/Trade"
            value={`${result.avgReturnPerTrade >= 0 ? '+' : ''}${result.avgReturnPerTrade.toFixed(2)}%`}
            color={retColor(result.avgReturnPerTrade)}
          />
        </div>

        {/* 2. Equity Chart */}
        {result.equityCurve.length > 0 && <EquityChart result={result} />}

        {/* 3. Trades Table */}
        {result.trades.length > 0 && <TradesTable trades={result.trades} />}

        {/* 4. Diagnostic */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-1.5">Diagnostico</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {result.diagnostic}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
