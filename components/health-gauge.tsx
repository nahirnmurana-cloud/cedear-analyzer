'use client';

import { ScoreBreakdown } from '@/lib/types';

function getHealthLevel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 60) return { label: 'Alta', color: '#22c55e' };
  if (score >= 40) return { label: 'Media', color: '#eab308' };
  return { label: 'Baja', color: '#ef4444' };
}

export function HealthGauge({ score }: { score: ScoreBreakdown }) {
  const total = score.total;
  const { label, color } = getHealthLevel(total);
  const circumference = 2 * Math.PI * 45;
  const progress = (total / 100) * circumference;

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
          aria-label={`Salud tecnica: ${label} (${total}/100)`}
        >
          <title>Salud tecnica: {total}/100</title>
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke="currentColor" strokeWidth="5"
            className="text-muted/20"
          />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={color} strokeWidth="5"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {total}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            {label}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground">Salud tecnica</span>
    </div>
  );
}
