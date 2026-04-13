'use client';

import { TechnicalIndicators } from '@/lib/types';

interface Alert {
  type: 'bullish' | 'bearish' | 'warning';
  title: string;
  detail: string;
}

export function detectAlerts(
  indicators: TechnicalIndicators,
  price: number,
  previousClose: number
): Alert[] {
  const alerts: Alert[] = [];

  // MACD crossover
  if (indicators.macd) {
    if (
      indicators.macd.macdLine > indicators.macd.signalLine &&
      indicators.macd.histogram > 0 &&
      indicators.macd.histogram < Math.abs(indicators.macd.macdLine) * 0.3
    ) {
      alerts.push({
        type: 'bullish',
        title: 'Cruce MACD alcista reciente',
        detail:
          'La linea MACD cruzo por encima de la linea de senal. Histograma positivo y creciente confirma momentum.',
      });
    }
    if (
      indicators.macd.macdLine < indicators.macd.signalLine &&
      indicators.macd.histogram < 0
    ) {
      alerts.push({
        type: 'bearish',
        title: 'MACD bajista',
        detail:
          'La linea MACD esta por debajo de la linea de senal con histograma negativo.',
      });
    }
  }

  // RSI extremes
  if (indicators.rsi != null) {
    if (indicators.rsi < 30) {
      alerts.push({
        type: 'bullish',
        title: `RSI en sobreventa (${indicators.rsi.toFixed(1)})`,
        detail:
          'El RSI esta por debajo de 30, indicando que el activo puede estar sobrevendido. Posible oportunidad de compra si otros indicadores acompanan.',
      });
    }
    if (indicators.rsi > 70) {
      alerts.push({
        type: 'warning',
        title: `RSI en sobrecompra (${indicators.rsi.toFixed(1)})`,
        detail:
          'El RSI esta por encima de 70, indicando sobrecompra. Riesgo de correccion a corto plazo.',
      });
    }
  }

  // Breakout resistencia
  if (price > indicators.resistance && price > previousClose) {
    alerts.push({
      type: 'bullish',
      title: 'Ruptura de resistencia',
      detail: `El precio ($${price.toLocaleString('es-AR')}) supero la resistencia de 20 ruedas ($${indicators.resistance.toLocaleString('es-AR')}). Senal de fortaleza si el volumen acompana.`,
    });
  }

  // Perdida de soporte
  if (price < indicators.support) {
    alerts.push({
      type: 'bearish',
      title: 'Perdida de soporte',
      detail: `El precio ($${price.toLocaleString('es-AR')}) cayo por debajo del soporte de 20 ruedas ($${indicators.support.toLocaleString('es-AR')}). Senal de debilidad.`,
    });
  }

  // Volumen anormal
  if (indicators.volume.relative > 2.0) {
    alerts.push({
      type: 'warning',
      title: `Volumen anormal (${indicators.volume.relative.toFixed(1)}x)`,
      detail:
        'El volumen actual es mas del doble del promedio de 20 ruedas. Puede indicar un evento relevante o cambio de tendencia.',
    });
  }

  // Stochastic extremes
  if (indicators.stochastic) {
    if (
      indicators.stochastic.k < 20 &&
      indicators.stochastic.k > indicators.stochastic.d
    ) {
      alerts.push({
        type: 'bullish',
        title: 'Estocastico saliendo de sobreventa',
        detail:
          '%K cruzo %D al alza desde zona de sobreventa (<20). Posible inicio de recuperacion.',
      });
    }
    if (
      indicators.stochastic.k > 80 &&
      indicators.stochastic.k < indicators.stochastic.d
    ) {
      alerts.push({
        type: 'bearish',
        title: 'Estocastico saliendo de sobrecompra',
        detail:
          '%K cruzo %D a la baja desde zona de sobrecompra (>80). Posible inicio de correccion.',
      });
    }
  }

  // Bollinger squeeze
  if (indicators.bollinger && indicators.bollinger.bandwidth < 4) {
    alerts.push({
      type: 'warning',
      title: 'Compresion de Bollinger',
      detail: `Bandwidth en ${indicators.bollinger.bandwidth.toFixed(1)}%. Las bandas estan muy estrechas, lo que suele anticipar un movimiento fuerte en cualquier direccion.`,
    });
  }

  return alerts;
}

const alertConfig = {
  bullish: {
    bg: 'bg-green-500/8 border-green-500/20',
    icon: '5 15l7-7 7 7',
    iconColor: 'text-green-500',
    label: 'Alcista',
  },
  bearish: {
    bg: 'bg-red-500/8 border-red-500/20',
    icon: '19 9l-7 7-7-7',
    iconColor: 'text-red-500',
    label: 'Bajista',
  },
  warning: {
    bg: 'bg-amber-500/8 border-amber-500/20',
    icon: '12 9v2m0 4h.01',
    iconColor: 'text-amber-500',
    label: 'Atencion',
  },
};

export function AlertsPanel({
  indicators,
  price,
  previousClose,
}: {
  indicators: TechnicalIndicators;
  price: number;
  previousClose: number;
}) {
  const alerts = detectAlerts(indicators, price, previousClose);

  if (alerts.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Sin alertas activas en este momento.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const cfg = alertConfig[alert.type];
        return (
          <div
            key={i}
            className={`flex gap-3 p-3 rounded-lg border ${cfg.bg}`}
          >
            <svg
              className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.iconColor}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={`M${cfg.icon}`}
              />
            </svg>
            <div>
              <p className="text-sm font-medium">{alert.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {alert.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
