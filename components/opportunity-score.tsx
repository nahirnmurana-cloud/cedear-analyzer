'use client';

import { OpportunityScore } from '@/lib/types';
import { getOpportunityLabel } from '@/lib/scoring';

function getColor(score: number): string {
  if (score >= 70) return '#16a34a';
  if (score >= 55) return '#22c55e';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#f97316';
  return '#9ca3af';
}

export function OpportunityGauge({ score }: { score: OpportunityScore }) {
  const total = score.total;
  const color = getColor(total);
  const circumference = 2 * Math.PI * 45;
  const progress = (total / 100) * circumference;
  const label = getOpportunityLabel(total, score);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-28 h-28">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full -rotate-90"
          role="meter"
          aria-valuenow={total}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Oportunidad de compra: ${total}/100`}
        >
          <title>Oportunidad: {total}/100</title>
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/20" />
          <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round"
            className="transition-all duration-700 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{total}</span>
          <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground">Oportunidad</span>
    </div>
  );
}

const LABELS: Record<string, { label: string; desc: string }> = {
  momentum: { label: 'Momentum', desc: 'Cambio de direccion (MACD, RSI, Estocastico)' },
  trendFormation: { label: 'Tendencia naciente', desc: 'Inicio de tendencia (ADX, DI, SMA20)' },
  entryTiming: { label: 'Timing de entrada', desc: 'Que tan temprano estas en el movimiento' },
  volumeConfirmation: { label: 'Volumen', desc: 'Confirmacion por volumen en dias de suba' },
  riskReward: { label: 'Riesgo / Recompensa', desc: 'Soporte cercano, upside atractivo' },
  setupQuality: { label: 'Calidad del setup', desc: 'Consistencia de senales, no lateraliza' },
};

const WEIGHT_LABELS: Record<string, string> = {
  momentum: '22%',
  trendFormation: '18%',
  entryTiming: '22%',
  volumeConfirmation: '12%',
  riskReward: '20%',
  setupQuality: '6%',
};

export function OpportunityBreakdown({ score }: { score: OpportunityScore }) {
  const factors = [
    { key: 'momentum', value: score.momentum },
    { key: 'trendFormation', value: score.trendFormation },
    { key: 'entryTiming', value: score.entryTiming },
    { key: 'volumeConfirmation', value: score.volumeConfirmation },
    { key: 'riskReward', value: score.riskReward },
    { key: 'setupQuality', value: score.setupQuality },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <span className="text-sm font-medium">Score de Oportunidad</span>
        <span className="text-lg font-bold" style={{ color: getColor(score.total) }}>
          {score.total}/100
        </span>
      </div>

      {/* Factores */}
      <div className="space-y-3">
        {factors.map((f) => {
          const info = LABELS[f.key];
          return (
            <div key={f.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{info.label}</span>
                  <span className="text-xs text-muted-foreground ml-1">({WEIGHT_LABELS[f.key]})</span>
                </div>
                <span className="font-mono text-xs font-bold tabular-nums" style={{ color: getColor(f.value) }}>
                  {f.value}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${f.value}%`, backgroundColor: getColor(f.value) }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">{info.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Explicacion */}
      {score.explanation.length > 0 && (
        <div className="bg-green-500/5 border border-green-500/15 rounded-lg p-3">
          <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">A favor</p>
          <ul className="space-y-0.5">
            {score.explanation.slice(0, 5).map((r, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                <span className="text-green-500 shrink-0">+</span> {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {score.warnings.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Advertencias</p>
          <ul className="space-y-0.5">
            {score.warnings.slice(0, 4).map((w, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                <span className="text-amber-500 shrink-0">!</span> {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
