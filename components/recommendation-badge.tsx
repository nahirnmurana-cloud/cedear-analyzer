import { Badge } from '@/components/ui/badge';
import { Recommendation } from '@/lib/types';

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

// Badge para oportunidad de compra
type OpportunityLevel = 'Oportunidad fuerte' | 'Buena oportunidad' | 'Oportunidad moderada' | 'Oportunidad debil' | 'Sin oportunidad';

const opportunityColorMap: Record<OpportunityLevel, string> = {
  'Oportunidad fuerte': 'bg-green-600 hover:bg-green-700 text-white',
  'Buena oportunidad': 'bg-green-500 hover:bg-green-600 text-white',
  'Oportunidad moderada': 'bg-yellow-500 hover:bg-yellow-600 text-white',
  'Oportunidad debil': 'bg-orange-500 hover:bg-orange-600 text-white',
  'Sin oportunidad': 'bg-gray-400 hover:bg-gray-500 text-white',
};

export function OpportunityBadge({
  score,
  className = '',
}: {
  score: number;
  className?: string;
}) {
  let label: OpportunityLevel;
  if (score >= 70) label = 'Oportunidad fuerte';
  else if (score >= 55) label = 'Buena oportunidad';
  else if (score >= 40) label = 'Oportunidad moderada';
  else if (score >= 20) label = 'Oportunidad debil';
  else label = 'Sin oportunidad';

  return (
    <Badge className={`${opportunityColorMap[label]} ${className}`}>
      {label}
    </Badge>
  );
}
