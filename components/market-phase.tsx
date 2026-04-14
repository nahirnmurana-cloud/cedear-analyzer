'use client';

import { OpportunityScore, ScoreBreakdown } from '@/lib/types';

export interface MarketPhase {
  phase: 'reversion' | 'tendencia' | 'debilidad' | 'neutral';
  label: string;
  description: string;
  action: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export function getMarketPhase(
  opportunity: OpportunityScore,
  health: ScoreBreakdown
): MarketPhase {
  const opp = opportunity.total;
  const h = health.total;

  if (opp >= 55 && h < 55) {
    return {
      phase: 'reversion',
      label: 'Reversion temprana',
      description:
        'El precio esta subiendo desde abajo con momentum positivo. Todavia no alcanzo la media — es el mejor momento para entrar si la tendencia se confirma.',
      action: 'Oportunidad de compra',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/8',
      borderColor: 'border-green-500/20',
    };
  }

  if (h >= 60 && opp < 40) {
    return {
      phase: 'tendencia',
      label: 'Tendencia confirmada',
      description:
        'El activo esta arriba de las medias con indicadores solidos. La tendencia ya arranco — entrar ahora es mas seguro pero con menos upside.',
      action: 'Mantener si ya tenes, entrada tardia si no',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/8',
      borderColor: 'border-blue-500/20',
    };
  }

  if (h < 45 && opp < 30) {
    return {
      phase: 'debilidad',
      label: 'Debilidad',
      description:
        'Indicadores tecnicos debiles y sin senales de recuperacion. El precio puede seguir cayendo o lateralizando.',
      action: 'Evitar o vender',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-500/8',
      borderColor: 'border-red-500/20',
    };
  }

  return {
    phase: 'neutral',
    label: 'Transicion',
    description:
      'Las senales son mixtas. No hay una tendencia clara ni una oportunidad definida. Esperar confirmacion antes de actuar.',
    action: 'Observar',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/30',
    borderColor: 'border-muted',
  };
}

export function MarketPhaseCard({
  opportunity,
  health,
}: {
  opportunity: OpportunityScore;
  health: ScoreBreakdown;
}) {
  const phase = getMarketPhase(opportunity, health);

  return (
    <div
      className={`rounded-lg border p-4 ${phase.bgColor} ${phase.borderColor}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className={`text-lg font-bold ${phase.color}`}>
          {phase.label}
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${phase.bgColor} ${phase.color} border ${phase.borderColor}`}
        >
          {phase.action}
        </span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {phase.description}
      </p>
      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
        <span>
          Oportunidad:{' '}
          <span className="font-bold text-foreground">
            {opportunity.total}/100
          </span>
        </span>
        <span>
          Salud tecnica:{' '}
          <span className="font-bold text-foreground">
            {health.total}/100
          </span>
        </span>
      </div>
    </div>
  );
}
