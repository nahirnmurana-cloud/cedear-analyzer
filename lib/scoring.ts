import { TechnicalIndicators, ScoreBreakdown, Recommendation } from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeScore(
  price: number,
  indicators: TechnicalIndicators,
  previousClose: number
): ScoreBreakdown {
  // --- TENDENCIA (max 30) ---
  let trend = 0;
  if (indicators.sma50 != null) {
    trend += price > indicators.sma50 ? 6 : 0;
  }
  if (indicators.sma200 != null) {
    trend += price > indicators.sma200 ? 8 : 0;
  }
  if (indicators.sma20 != null && indicators.sma50 != null) {
    trend += indicators.sma20 > indicators.sma50 ? 6 : 0;
  }
  if (indicators.sma50 != null && indicators.sma200 != null) {
    trend += indicators.sma50 > indicators.sma200 ? 5 : 0;
  }
  if (indicators.sma50 != null && indicators.sma50 > 0 && price > 0) {
    const pctAbove = ((price - indicators.sma50) / indicators.sma50) * 100;
    if (pctAbove > 5) trend += 5;
    else if (pctAbove > 2) trend += 3;
    else if (pctAbove > 0) trend += 1;
  }
  trend = clamp(trend, 0, 30);

  // --- MOMENTUM (max 20) ---
  let momentum = 0;
  if (indicators.macd) {
    momentum += indicators.macd.macdLine > indicators.macd.signalLine ? 6 : 0;
    momentum += indicators.macd.histogram > 0 ? 4 : 0;
    momentum += indicators.macd.macdLine > 0 ? 2 : 0;
  }
  if (indicators.rsi != null) {
    if (indicators.rsi >= 50 && indicators.rsi <= 70) {
      momentum += 4;
    } else if (indicators.rsi > 40 && indicators.rsi < 80) {
      momentum += 2;
    }
  }
  // Stochastic contribuye al momentum
  if (indicators.stochastic) {
    if (indicators.stochastic.k > 20 && indicators.stochastic.k < 80) {
      momentum += 2; // zona saludable
    }
    if (indicators.stochastic.k > indicators.stochastic.d) {
      momentum += 2; // %K cruzando %D al alza
    }
  }
  momentum = clamp(momentum, 0, 20);

  // --- FUERZA DE TENDENCIA (max 15) ---
  let trendStrength = 0;
  if (indicators.dmi) {
    if (indicators.dmi.adx > 25) trendStrength += 8;
    else if (indicators.dmi.adx > 20) trendStrength += 4;
    trendStrength += indicators.dmi.plusDI > indicators.dmi.minusDI ? 7 : 0;
  }
  trendStrength = clamp(trendStrength, 0, 15);

  // --- VOLUMEN (max 15) ---
  let volume = 0;
  const rel = indicators.volume.relative;
  if (rel > 1.2) volume += 8;
  else if (rel > 0.8) volume += 4;

  const priceUp = price > previousClose;
  if ((priceUp && rel > 1.0) || (!priceUp && rel < 0.8)) {
    volume += 7;
  } else {
    volume += 3;
  }
  volume = clamp(volume, 0, 15);

  // --- VOLATILIDAD (max 10) --- usa Bollinger y ATR
  let volatility = 0;
  if (indicators.bollinger) {
    // %B entre 20 y 80 = precio en rango normal
    if (indicators.bollinger.percentB > 20 && indicators.bollinger.percentB < 80) {
      volatility += 4;
    } else if (indicators.bollinger.percentB >= 0 && indicators.bollinger.percentB <= 100) {
      volatility += 2;
    }
    // Bandwidth moderado = volatilidad operable
    if (indicators.bollinger.bandwidth > 3 && indicators.bollinger.bandwidth < 20) {
      volatility += 3;
    } else {
      volatility += 1;
    }
  } else if (price > 0) {
    const priceRange = (indicators.resistance - indicators.support) / price;
    if (priceRange > 0.03 && priceRange < 0.15) volatility = 7;
    else volatility = 3;
  }
  // ATR bajo relativo al precio = menos riesgo
  if (indicators.atr != null && price > 0) {
    const atrPct = (indicators.atr / price) * 100;
    if (atrPct < 3) volatility += 3;
    else if (atrPct < 5) volatility += 1;
  }
  volatility = clamp(volatility, 0, 10);

  // --- SOPORTE/RESISTENCIA (max 10) ---
  let supportResistance = 0;
  if (price > 0) {
    const distToSupport = (price - indicators.support) / price;
    const distToResist = (indicators.resistance - price) / price;

    if (distToSupport < 0.03) supportResistance += 7;
    else if (distToSupport < 0.07) supportResistance += 4;
    else supportResistance += 2;

    if (distToResist < 0) supportResistance += 3;
  }
  supportResistance = clamp(supportResistance, 0, 10);

  const total = trend + momentum + trendStrength + volume + volatility + supportResistance;

  return {
    trend,
    momentum,
    trendStrength,
    volume,
    volatility,
    supportResistance,
    total: clamp(total, 0, 100),
  };
}

export function getRecommendation(score: number): Recommendation {
  if (score >= 80) return 'Compra Fuerte';
  if (score >= 65) return 'Comprar';
  if (score >= 45) return 'Mantener';
  if (score >= 25) return 'Cautela';
  return 'Vender';
}
