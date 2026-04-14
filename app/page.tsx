'use client';

import { CedearSearch } from '@/components/cedear-search';
import { TopOpportunities } from '@/components/top-opportunities';
import { CedearFilters } from '@/components/cedear-filters';
import { Watchlist } from '@/components/watchlist';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12 max-w-7xl">
      {/* Hero */}
      <section className="text-center space-y-5 pt-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Analisis Tecnico de{' '}
            <span className="text-primary">CEDEARs</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Score compuesto, indicadores tecnicos y recomendaciones claras para
            cada CEDEAR del mercado argentino.
          </p>
        </div>
        <div className="flex justify-center">
          <CedearSearch />
        </div>
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            280+ CEDEARs disponibles
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            10 indicadores tecnicos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Actualizacion automatica
          </span>
        </div>
      </section>

      {/* Top 5 */}
      <section>
        <TopOpportunities />
      </section>

      {/* Filtros */}
      <section>
        <CedearFilters />
      </section>

      {/* Watchlist */}
      <section>
        <Watchlist />
      </section>
    </div>
  );
}
