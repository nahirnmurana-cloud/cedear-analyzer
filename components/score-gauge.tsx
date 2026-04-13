'use client';

import { ScoreBreakdown, Recommendation } from '@/lib/types';

function getColor(score: number): string {
  if (score >= 80) return '#16a34a';
  if (score >= 65) return '#22c55e';
  if (score >= 45) return '#eab308';
  if (score >= 25) return '#f97316';
  return '#ef4444';
}

function getLabel(score: number): string {
  if (score >= 80) return 'Muy fuerte';
  if (score >= 65) return 'Positivo';
  if (score >= 45) return 'Neutral';
  if (score >= 25) return 'Debil';
  return 'Negativo';
}

export function ScoreGauge({
  score,
  size = 'md',
}: {
  score: ScoreBreakdown;
  size?: 'sm' | 'md' | 'lg';
}) {
  const total = score.total;
  const color = getColor(total);
  const circumference = 2 * Math.PI * 45;
  const progress = (total / 100) * circumference;

  const dims = { sm: 'w-20 h-20', md: 'w-32 h-32', lg: 'w-40 h-40' };
  const textSize = { sm: 'text-lg', md: 'text-3xl', lg: 'text-4xl' };
  const labelSize = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${dims[size]}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full -rotate-90"
          role="meter"
          aria-valuenow={total}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Score tecnico: ${total} de 100`}
        >
          <title>Score tecnico: {total}/100</title>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/20"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${textSize[size]} font-bold`} style={{ color }}>
            {total}
          </span>
          <span
            className={`${labelSize[size]} text-muted-foreground font-medium`}
          >
            {getLabel(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

const SCORE_LABELS: Record<
  string,
  { label: string; desc: string }
> = {
  trend: {
    label: 'Tendencia',
    desc: 'Posicion del precio vs medias moviles',
  },
  momentum: { label: 'Momentum', desc: 'Fuerza del movimiento (MACD, RSI)' },
  trendStrength: {
    label: 'Fuerza',
    desc: 'Intensidad de la tendencia (ADX/DMI)',
  },
  volume: {
    label: 'Volumen',
    desc: 'Confirmacion por volumen operado',
  },
  volatility: {
    label: 'Volatilidad',
    desc: 'Rango de precio y estabilidad',
  },
  supportResistance: {
    label: 'Soporte/Resist.',
    desc: 'Cercania a niveles clave',
  },
};

export function ScoreBreakdownTable({
  score,
  recommendation,
}: {
  score: ScoreBreakdown;
  recommendation?: Recommendation;
}) {
  const items = [
    { key: 'trend', value: score.trend, max: 30 },
    { key: 'momentum', value: score.momentum, max: 20 },
    { key: 'trendStrength', value: score.trendStrength, max: 15 },
    { key: 'volume', value: score.volume, max: 15 },
    { key: 'volatility', value: score.volatility, max: 10 },
    { key: 'supportResistance', value: score.supportResistance, max: 10 },
  ];

  return (
    <div className="space-y-3">
      {recommendation && (
        <div className="flex items-center justify-between pb-2 border-b">
          <span className="text-sm font-medium">Score Total</span>
          <span
            className="text-lg font-bold"
            style={{ color: getColor(score.total) }}
          >
            {score.total}/100
          </span>
        </div>
      )}
      {items.map((item) => {
        const info = SCORE_LABELS[item.key];
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
                style={{
                  width: `${pct}%`,
                  backgroundColor: getColor(pct),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
