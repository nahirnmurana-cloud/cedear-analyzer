import { Card, CardContent } from '@/components/ui/card';
import { Recommendation } from '@/lib/types';

const config: Record<
  Recommendation,
  { border: string; bg: string; icon: string }
> = {
  'Compra Fuerte': {
    border: 'border-green-500/30',
    bg: 'bg-green-500/5',
    icon: '2 17l4-4 4 4 4-8 4 4',
  },
  Comprar: {
    border: 'border-green-400/30',
    bg: 'bg-green-400/5',
    icon: '5 15l7-7 7 7',
  },
  Mantener: {
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/5',
    icon: '5 12h14',
  },
  Cautela: {
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
    icon: '12 9v2m0 4h.01',
  },
  Vender: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    icon: '19 9l-7 7-7-7',
  },
};

export function RecommendationText({
  summary,
  recommendation,
}: {
  summary: string;
  recommendation: Recommendation;
}) {
  const c = config[recommendation];

  return (
    <Card className={`${c.border} ${c.bg}`}>
      <CardContent className="p-4 flex gap-3 items-start">
        <svg
          className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={`M${c.icon}`} />
        </svg>
        <div>
          <h4 className="font-semibold text-sm mb-1">
            Resumen de Valoracion
          </h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
