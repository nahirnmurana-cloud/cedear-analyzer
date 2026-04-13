'use client';

import { useState } from 'react';
import { useTopOpportunities } from '@/hooks/use-cedear-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CedearAnalysis } from '@/lib/types';
import { RecommendationBadge } from './recommendation-badge';
import Link from 'next/link';

type FilterType =
  | 'all'
  | 'comprar'
  | 'sobre-sma200'
  | 'rsi-bajo'
  | 'volumen-alto';

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'Todos',
  comprar: 'Solo Compra',
  'sobre-sma200': 'Sobre SMA 200',
  'rsi-bajo': 'RSI < 35',
  'volumen-alto': 'Volumen alto',
};

function FilteredCedearRow({ analysis }: { analysis: CedearAnalysis }) {
  const changeColor =
    analysis.change.daily >= 0 ? 'text-green-500' : 'text-red-500';
  return (
    <Link href={`/cedear/${encodeURIComponent(analysis.info.ticker)}`}>
      <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
        <span className="font-bold text-sm w-14">
          {analysis.info.localTicker}
        </span>
        <span className="text-xs text-muted-foreground flex-1 truncate">
          {analysis.info.name}
        </span>
        <span className="text-sm font-semibold tabular-nums w-24 text-right">
          ${analysis.currentPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
        <span className={`text-xs font-medium tabular-nums w-16 text-right ${changeColor}`}>
          {analysis.change.daily >= 0 ? '+' : ''}{analysis.change.daily.toFixed(2)}%
        </span>
        <span className="font-bold tabular-nums w-8 text-right text-sm">
          {analysis.score.total}
        </span>
        <RecommendationBadge recommendation={analysis.recommendation} />
      </div>
    </Link>
  );
}

export function CedearFilters() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [expanded, setExpanded] = useState(false);

  const { top: allAnalyses, isLoading } = useTopOpportunities();

  const filtered = allAnalyses.filter((a) => {
    switch (filter) {
      case 'comprar':
        return a.recommendation === 'Comprar' || a.recommendation === 'Compra Fuerte';
      case 'sobre-sma200':
        return a.indicators.sma200 != null && a.currentPrice > a.indicators.sma200;
      case 'rsi-bajo':
        return a.indicators.rsi != null && a.indicators.rsi < 35;
      case 'volumen-alto':
        return a.indicators.volume.relative > 1.2;
      default:
        return true;
    }
  });

  if (!expanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setExpanded(true)}
        className="text-xs"
      >
        <svg
          className="w-3.5 h-3.5 mr-1.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filtrar CEDEARs
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Filtros</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(false)}
            className="h-7 w-7 p-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(FILTER_LABELS) as FilterType[]).map((key) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key)}
              className="text-xs h-7"
            >
              {FILTER_LABELS[key]}
            </Button>
          ))}
        </div>

        {isLoading && (
          <p className="text-xs text-muted-foreground">Cargando datos...</p>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">
            Ningun CEDEAR cumple este filtro en este momento.
          </p>
        )}

        {filtered.length > 0 && (
          <div className="divide-y divide-muted/30">
            {/* Header */}
            <div className="flex items-center gap-3 px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              <span className="w-14">Ticker</span>
              <span className="flex-1">Nombre</span>
              <span className="w-24 text-right">Precio</span>
              <span className="w-16 text-right">Dia</span>
              <span className="w-8 text-right">Score</span>
              <span className="w-20 text-right">Senal</span>
            </div>
            {filtered.map((a) => (
              <FilteredCedearRow key={a.info.ticker} analysis={a} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
