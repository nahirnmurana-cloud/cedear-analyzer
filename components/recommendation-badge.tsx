import { Badge } from '@/components/ui/badge';
import { Recommendation, OpportunityScore } from '@/lib/types';
import { getOpportunityLabel } from '@/lib/scoring';

const colorMap: Record<Recommendation, string> = {
  'Compra Fuerte': 'bg-green-600 hover:bg-green-700 text-white',
  Comprar: 'bg-green-500 hover:bg-green-600 text-white',
  Mantener: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  Cautela: 'bg-orange-500 hover:bg-orange-600 text-white',
  Vender: 'bg-red-500 hover:bg-red-600 text-white',
};

export function RecommendationBadge({
  recommendation,
  className = '',
}: {
  recommendation: Recommendation;
  className?: string;
}) {
  return (
    <Badge className={`${colorMap[recommendation]} ${className}`}>
      {recommendation}
    </Badge>
  );
}

const opportunityColorMap: Record<string, string> = {
  'Oportunidad fuerte': 'bg-green-600 hover:bg-green-700 text-white',
  'Buena oportunidad': 'bg-green-500 hover:bg-green-600 text-white',
  'Setup interesante': 'bg-yellow-500 hover:bg-yellow-600 text-white',
  'Oportunidad debil': 'bg-orange-500 hover:bg-orange-600 text-white',
  'Sin oportunidad': 'bg-gray-400 hover:bg-gray-500 text-white',
};

export function OpportunityBadge({
  opportunityScore,
  className = '',
}: {
  opportunityScore: OpportunityScore;
  className?: string;
}) {
  const label = getOpportunityLabel(opportunityScore.total, opportunityScore);
  const colorClass = opportunityColorMap[label] ?? 'bg-gray-400 text-white';

  return (
    <Badge className={`${colorClass} ${className}`}>
      {label}
    </Badge>
  );
}
