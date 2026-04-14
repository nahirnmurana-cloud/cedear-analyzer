'use client';

import { use } from 'react';
import { useCedearAnalysis } from '@/hooks/use-cedear-data';
import { useWatchlist } from '@/hooks/use-watchlist';
import { PriceStats } from '@/components/price-stats';
import { ScoreGauge, ScoreBreakdownTable } from '@/components/score-gauge';
import { RecommendationBadge } from '@/components/recommendation-badge';
import { PriceChart } from '@/components/price-chart';
import {
  RsiChart,
  MacdChart,
  VolumeChart,
  DmiChart,
  StochasticChart,
  BollingerChart,
} from '@/components/indicator-chart';
import { MetricDetailPanel } from '@/components/metric-detail';
import { AlertsPanel } from '@/components/alerts';
import { BacktestPanel } from '@/components/backtest-panel';
import { CclComparison } from '@/components/ccl-comparison';
import { OpportunityGauge, OpportunityBreakdown } from '@/components/opportunity-score';
import { HealthGauge } from '@/components/health-gauge';
import { MarketPhaseCard } from '@/components/market-phase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function CedearDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = use(params);
  const decodedTicker = decodeURIComponent(ticker);
  const { data, isLoading, error } = useCedearAnalysis(decodedTicker);
  const { isSaved, addTicker, removeTicker } = useWatchlist();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-9 bg-muted rounded w-32" />
              <div className="h-4 bg-muted rounded w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-24 bg-muted rounded-xl" />
            <div className="h-24 bg-muted rounded-xl" />
          </div>
          <div className="h-20 bg-muted rounded-xl" />
          <div className="h-[440px] bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold">No se pudo cargar el analisis</h1>
          <p className="text-muted-foreground text-sm">
            Es posible que los datos para {decodedTicker.replace('.BA', '')} no
            esten disponibles temporalmente.
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const saved = isSaved(data.info.ticker);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Volver"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              {data.info.localTicker}
            </h1>
            <RecommendationBadge
              recommendation={data.recommendation}
              className="text-sm px-3 py-1"
            />
          </div>
          <p className="text-muted-foreground text-sm ml-8">
            {data.info.name} &middot; {data.info.sector} &middot; Ratio{' '}
            {data.info.ratio}:1
          </p>
        </div>
        <Button
          variant={saved ? 'outline' : 'default'}
          onClick={() =>
            saved
              ? removeTicker(data.info.ticker)
              : addTicker(data.info.ticker)
          }
          className="shrink-0"
        >
          {saved ? (
            <>
              <svg
                className="w-4 h-4 mr-1.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              En Watchlist
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
              Agregar a Watchlist
            </>
          )}
        </Button>
      </div>

      {/* Price + Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardContent className="p-5">
            <PriceStats price={data.currentPrice} change={data.change} />
          </CardContent>
        </Card>
        <Card className="flex items-center justify-center">
          <CardContent className="p-4">
            <OpportunityGauge score={data.opportunityScore} />
          </CardContent>
        </Card>
        <Card className="flex items-center justify-center">
          <CardContent className="p-4">
            <HealthGauge score={data.score} />
          </CardContent>
        </Card>
      </div>

      {/* Market Phase */}
      <MarketPhaseCard
        opportunity={data.opportunityScore}
        health={data.score}
      />

      {/* CCL / Subyacente */}
      <CclComparison info={data.info} cedearPrice={data.currentPrice} />

      {/* Alertas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Alertas Tecnicas</CardTitle>
          <p className="text-xs text-muted-foreground">
            Senales relevantes detectadas automaticamente en los indicadores
          </p>
        </CardHeader>
        <CardContent>
          <AlertsPanel
            indicators={data.indicators}
            price={data.currentPrice}
            previousClose={data.previousClose}
          />
        </CardContent>
      </Card>

      {/* Price Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Precio y Medias Moviles</CardTitle>
          <p className="text-xs text-muted-foreground">
            SMA 20 (corto plazo), SMA 50 (mediano plazo) y SMA 200 (largo
            plazo). La posicion del precio respecto a estas medias define la
            tendencia.
          </p>
        </CardHeader>
        <CardContent>
          <PriceChart series={data.indicatorSeries} candles={data.candles} />
        </CardContent>
      </Card>

      {/* Indicator Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <RsiChart series={data.indicatorSeries} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <MacdChart series={data.indicatorSeries} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <StochasticChart series={data.indicatorSeries} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <DmiChart series={data.indicatorSeries} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <BollingerChart series={data.indicatorSeries} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <VolumeChart series={data.indicatorSeries} />
          </CardContent>
        </Card>
      </div>

      {/* Score Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Oportunidad de Compra</CardTitle>
            <p className="text-xs text-muted-foreground">
              Detecta recuperaciones tempranas: precio debajo de la media,
              momentum girando, breakout con volumen. Comprar ANTES de que
              llegue a la media.
            </p>
          </CardHeader>
          <CardContent>
            <OpportunityBreakdown score={data.opportunityScore} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Salud Tecnica</CardTitle>
            <p className="text-xs text-muted-foreground">
              Evalua el estado tecnico general: tendencia, momentum, fuerza,
              volumen, volatilidad y niveles clave.
            </p>
          </CardHeader>
          <CardContent>
            <ScoreBreakdownTable
              score={data.score}
              recommendation={data.recommendation}
            />
          </CardContent>
        </Card>
      </div>

      {/* Indicadores Tecnicos - full width, descripciones siempre visibles */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Indicadores Tecnicos</CardTitle>
          <p className="text-xs text-muted-foreground">
            Descripcion, interpretacion y senal actual de cada indicador
          </p>
        </CardHeader>
        <CardContent>
          <MetricDetailPanel
            indicators={data.indicators}
            price={data.currentPrice}
          />
        </CardContent>
      </Card>

      {/* Backtesting */}
      <BacktestPanel candles={data.candles} currentPrice={data.currentPrice} />

      {/* Metadata */}
      <p className="text-xs text-muted-foreground text-center pb-4">
        Ultima actualizacion:{' '}
        {new Date(data.lastUpdated).toLocaleString('es-AR')}
      </p>
    </div>
  );
}
