'use client';

import { OpportunityScore } from '@/lib/types';
import { getOpportunityLabel } from '@/lib/scoring';

function getColor(score: number): string {
  if (score >= 75) return '#16a34a';
  if (score >= 60) return '#22c55e';
  if (score >= 45) return '#eab308';
  if (score >= 25) return '#f97316';
  return '#9ca3af';
}

export function OpportunityGauge({ score }: { score: OpportunityScore }) {
  const total = score.total;
  const color = getColor(total);
  const circumference = 2 * Math.PI * 45;
  const progress = (total / 100) * circumference;
  const label = getOpportunityLabel(total);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-32 h-32">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full -rotate-90"
          role="meter"
          aria-valuenow={total}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Score de oportunidad: ${total} de 100`}
        >
          <title>Oportunidad de compra: {total}/100</title>
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
          <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round"
            className="transition-all duration-700 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{total}</span>
          <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
        </div>
      </div>
    </div>
  );
}

const LABELS: Record<string, { label: string; desc: string }> = {
  recoveryPosition: {
    label: 'Posicion de recuperacion',
    desc: 'Precio debajo de SMA50 pero subiendo, pullback en tendencia alcista',
  },
  momentumShift: {
    label: 'Giro de momentum',
    desc: 'MACD cruzando al alza, RSI saliendo de zona baja, estocastico girando',
  },
  breakoutSignals: {
    label: 'Senales de breakout',
    desc: 'Ruptura de resistencia corta, rebote desde banda inferior, suba con volumen',
  },
  trendFormation: {
    label: 'Formacion de tendencia',
    desc: 'ADX subiendo, DI+ tomando control sobre DI-, tendencia naciente',
  },
  volumeConfirmation: {
    label: 'Confirmacion por volumen',
    desc: 'Volumen alto en dias de suba, interes institucional',
  },
  riskReward: {
    label: 'Riesgo/Recompensa',
    desc: 'Cerca de soporte (poco downside), espacio para subir hasta la media',
  },
};

export function OpportunityBreakdown({ score }: { score: OpportunityScore }) {
  const items = [
    { key: 'recoveryPosition', value: score.recoveryPosition, max: 25 },
    { key: 'momentumShift', value: score.momentumShift, max: 20 },
    { key: 'breakoutSignals', value: score.breakoutSignals, max: 20 },
    { key: 'trendFormation', value: score.trendFormation, max: 15 },
    { key: 'volumeConfirmation', value: score.volumeConfirmation, max: 10 },
    { key: 'riskReward', value: score.riskReward, max: 10 },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b">
        <span className="text-sm font-medium">Score de Oportunidad</span>
        <span className="text-lg font-bold" style={{ color: getColor(score.total) }}>
          {score.total}/100
        </span>
      </div>
      {items.map((item) => {
        const info = LABELS[item.key];
        const pct = (item.value / item.max) * 100;
        return (
          <div key={item.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">{info.label}</span>
                <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                  {info.desc}
                </span>
              </div>
              <span className="font-mono text-xs font-bold tabular-nums">
                {item.value}/{item.max}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: getColor(pct) }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
