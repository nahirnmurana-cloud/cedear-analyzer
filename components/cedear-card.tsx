'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { RecommendationBadge, OpportunityBadge } from './recommendation-badge';
import { Recommendation, ScoreBreakdown, OpportunityScore } from '@/lib/types';

function formatPrice(price: number): string {
  return price.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatChange(change: number): { text: string; color: string } {
  const sign = change >= 0 ? '+' : '';
  return {
    text: `${sign}${change.toFixed(2)}%`,
    color: change >= 0 ? 'text-green-500' : 'text-red-500',
  };
}

function healthLabel(score: number): { text: string; color: string } {
  if (score >= 60) return { text: 'Alta', color: 'text-green-500' };
  if (score >= 40) return { text: 'Media', color: 'text-yellow-500' };
  return { text: 'Baja', color: 'text-red-500' };
}

interface CedearCardProps {
  ticker: string;
  name: string;
  price: number;
  change: number;
  score: ScoreBreakdown;
  opportunityScore?: OpportunityScore;
  recommendation: Recommendation;
  summary: string;
}

export function CedearCard({
  ticker,
  name,
  price,
  change,
  score,
  opportunityScore,
  recommendation,
  summary,
}: CedearCardProps) {
  const isOpportunityMode = opportunityScore != null && opportunityScore.total > 0;
  const displayScore = isOpportunityMode ? opportunityScore.total : score.total;
  const ch = formatChange(change);
  const health = healthLabel(score.total);

  return (
    <Link href={`/cedear/${encodeURIComponent(ticker)}`}>
      <Card className="hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer h-full group">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                {ticker.replace('.BA', '')}
              </h3>
              <p className="text-xs text-muted-foreground truncate">{name}</p>
            </div>
            {isOpportunityMode ? (
              <OpportunityBadge opportunityScore={opportunityScore} />
            ) : (
              <RecommendationBadge recommendation={recommendation} />
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tabular-nums">
              ${formatPrice(price)}
            </span>
            <span className={`text-xs font-semibold ${ch.color}`}>
              {ch.text}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(displayScore, 100)}%`,
                  backgroundColor:
                    displayScore >= 60
                      ? '#22c55e'
                      : displayScore >= 40
                        ? '#eab308'
                        : '#ef4444',
                }}
              />
            </div>
            <span className="text-sm font-bold tabular-nums w-8 text-right">
              {displayScore}
            </span>
          </div>

          {/* Salud tecnica chica */}
          {isOpportunityMode && (
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">
                Salud: <span className={`font-semibold ${health.color}`}>{health.text} ({score.total})</span>
              </span>
              {score.total < 45 && opportunityScore.total >= 55 && (
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Reversion temprana
                </span>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {summary}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
