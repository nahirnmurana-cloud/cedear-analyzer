'use client';

import { useTopOpportunities } from '@/hooks/use-cedear-data';
import { CedearCard } from './cedear-card';

export function TopOpportunities() {
  const { top, analyzed, totalCedears, isLoading, error } = useTopOpportunities();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Top 5 Oportunidades</h2>
          <p className="text-sm text-muted-foreground">
            {analyzed > 0
              ? `Mejores de ${analyzed} CEDEARs con liquidez analizados (de ${totalCedears} totales)`
              : 'CEDEARs con mejor score tecnico compuesto'}
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Analizando mercado...
          </div>
        )}
      </div>

      {isLoading && top.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-52 bg-muted/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No se pudieron cargar las oportunidades.</p>
          <p className="text-xs mt-1">Recarga la pagina para reintentar.</p>
        </div>
      )}

      {top.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {top.map((analysis, i) => (
            <div key={analysis.info.ticker} className="relative">
              <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                {i + 1}
              </div>
              <CedearCard
                ticker={analysis.info.ticker}
                name={analysis.info.name}
                price={analysis.currentPrice}
                change={analysis.change.daily}
                score={analysis.score}
                recommendation={analysis.recommendation}
                summary={analysis.summary}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
