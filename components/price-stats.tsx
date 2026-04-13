'use client';

interface PriceStatsProps {
  price: number;
  change: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

function ChangeChip({ label, value }: { label: string; value: number }) {
  const color = value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const bg = value >= 0 ? 'bg-green-500/10' : 'bg-red-500/10';
  const sign = value >= 0 ? '+' : '';
  return (
    <div className={`rounded-lg px-3 py-1.5 ${bg}`}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
        {label}
      </p>
      <p className={`font-semibold text-sm tabular-nums ${color}`}>
        {sign}{value.toFixed(2)}%
      </p>
    </div>
  );
}

export function PriceStats({ price, change }: PriceStatsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">Precio actual</p>
        <p className="text-3xl font-bold tabular-nums tracking-tight">
          ${price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </p>
      </div>
      <div className="flex gap-2 sm:ml-auto">
        <ChangeChip label="Dia" value={change.daily} />
        <ChangeChip label="Semana" value={change.weekly} />
        <ChangeChip label="Mes" value={change.monthly} />
      </div>
    </div>
  );
}
