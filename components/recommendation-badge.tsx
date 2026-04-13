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
