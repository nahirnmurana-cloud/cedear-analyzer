import { Candle, TechnicalIndicators, ScoreBreakdown, OpportunityScore, Recommendation } from './types';
import { sma } from './indicators';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ═══════════════════════════════════════════════════════
// SCORE DE SALUD TECNICA
// ═══════════════════════════════════════════════════════

export function computeScore(
  price: number,
  indicators: TechnicalIndicators,
  previousClose: number
): ScoreBreakdown {
  let trend = 0;
  if (indicators.sma50 != null) trend += price > indicators.sma50 ? 6 : 0;
  if (indicators.sma200 != null) trend += price > indicators.sma200 ? 8 : 0;
  if (indicators.sma20 != null && indicators.sma50 != null)
    trend += indicators.sma20 > indicators.sma50 ? 6 : 0;
  if (indicators.sma50 != null && indicators.sma200 != null)
    trend += indicators.sma50 > indicators.sma200 ? 5 : 0;
  if (indicators.sma50 != null && indicators.sma50 > 0 && price > 0) {
    const pctAbove = ((price - indicators.sma50) / indicators.sma50) * 100;
    if (pctAbove > 5) trend += 5;
    else if (pctAbove > 2) trend += 3;
    else if (pctAbove > 0) trend += 1;
  }
  trend = clamp(trend, 0, 30);

  let momentum = 0;
  if (indicators.macd) {
    momentum += indicators.macd.macdLine > indicators.macd.signalLine ? 6 : 0;
    momentum += indicators.macd.histogram > 0 ? 4 : 0;
    momentum += indicators.macd.macdLine > 0 ? 2 : 0;
  }
  if (indicators.rsi != null) {
    if (indicators.rsi >= 50 && indicators.rsi <= 70) momentum += 4;
    else if (indicators.rsi > 40 && indicators.rsi < 80) momentum += 2;
  }
  if (indicators.stochastic) {
    if (indicators.stochastic.k > 20 && indicators.stochastic.k < 80) momentum += 2;
    if (indicators.stochastic.k > indicators.stochastic.d) momentum += 2;
  }
  momentum = clamp(momentum, 0, 20);

  let trendStrength = 0;
  if (indicators.dmi) {
    if (indicators.dmi.adx > 25) trendStrength += 8;
    else if (indicators.dmi.adx > 20) trendStrength += 4;
    trendStrength += indicators.dmi.plusDI > indicators.dmi.minusDI ? 7 : 0;
  }
  trendStrength = clamp(trendStrength, 0, 15);

  let volume = 0;
  const rel = indicators.volume.relative;
  if (rel > 1.2) volume += 8; else if (rel > 0.8) volume += 4;
  const priceUp = price > previousClose;
  if ((priceUp && rel > 1.0) || (!priceUp && rel < 0.8)) volume += 7; else volume += 3;
  volume = clamp(volume, 0, 15);

  let volatility = 0;
  if (indicators.bollinger) {
    if (indicators.bollinger.percentB > 20 && indicators.bollinger.percentB < 80) volatility += 4; else volatility += 2;
    if (indicators.bollinger.bandwidth > 3 && indicators.bollinger.bandwidth < 20) volatility += 3; else volatility += 1;
  } else if (price > 0) {
    const priceRange = (indicators.resistance - indicators.support) / price;
    volatility = priceRange > 0.03 && priceRange < 0.15 ? 7 : 3;
  }
  if (indicators.atr != null && price > 0) {
    const atrPct = (indicators.atr / price) * 100;
    if (atrPct < 3) volatility += 3; else if (atrPct < 5) volatility += 1;
  }
  volatility = clamp(volatility, 0, 10);

  let supportResistance = 0;
  if (price > 0) {
    const distToSupport = (price - indicators.support) / price;
    if (distToSupport < 0.03) supportResistance += 7;
    else if (distToSupport < 0.07) supportResistance += 4;
    else supportResistance += 2;
    if ((indicators.resistance - price) / price < 0) supportResistance += 3;
  }
  supportResistance = clamp(supportResistance, 0, 10);

  const total = trend + momentum + trendStrength + volume + volatility + supportResistance;
  return { trend, momentum, trendStrength, volume, volatility, supportResistance, total: clamp(total, 0, 100) };
}

// ═══════════════════════════════════════════════════════
// SCORE DE OPORTUNIDAD DE COMPRA
//
// Detecta subas incipientes: el precio reboto de un piso,
// esta subiendo de manera sostenida, rompio resistencia
// de corto plazo, y tiene espacio para subir hasta la media.
//
// NO premia estar simplemente "debajo de la media".
// Premia estar SUBIENDO HACIA la media.
// ═══════════════════════════════════════════════════════

export function computeOpportunityScore(
  price: number,
  indicators: TechnicalIndicators,
  previousClose: number,
  candles: Candle[]
): OpportunityScore {
  if (candles.length < 20 || price <= 0) {
    return { recoveryPosition: 0, momentumShift: 0, breakoutSignals: 0, trendFormation: 0, volumeConfirmation: 0, riskReward: 0, total: 0 };
  }

  const closes = candles.map(c => c.close);
  const n = candles.length;

  // ── Variaciones recientes ──
  const var5d = n >= 5 ? ((price - closes[n - 6]) / closes[n - 6]) * 100 : 0;
  const var10d = n >= 10 ? ((price - closes[n - 11]) / closes[n - 11]) * 100 : 0;

  // ── Rango de lateralidad (ultimas 10 ruedas) ──
  const last10 = candles.slice(-10);
  const last10High = Math.max(...last10.map(c => c.high));
  const last10Low = Math.min(...last10.map(c => c.low));
  const rangePct = price > 0 ? ((last10High - last10Low) / price) * 100 : 0;
  const isLateral = rangePct < 3;

  // Si esta lateralizando, NO es oportunidad de compra
  if (isLateral) {
    return { recoveryPosition: 0, momentumShift: 0, breakoutSignals: 0, trendFormation: 0, volumeConfirmation: 0, riskReward: 0, total: 0 };
  }

  // ── SMA20 girando al alza ──
  const sma20Series = sma(closes, 20);
  const sma20Now = sma20Series[n - 1];
  const sma20Prev5 = n >= 6 ? sma20Series[n - 6] : null;
  const sma20Rising = sma20Now != null && sma20Prev5 != null && sma20Now > sma20Prev5;

  // ── MACD histograma creciente ──
  let histGrowing = false;
  if (indicators.macd) {
    // Comparo histograma actual vs hace 3 ruedas (necesito indicatorSeries, uso proxy)
    histGrowing = indicators.macd.histogram > 0 &&
      indicators.macd.macdLine > indicators.macd.signalLine;
  }

  // ── Volumen creciente en ultimos dias de suba ──
  const last5 = candles.slice(-5);
  const upDaysWithVol = last5.filter((c, i) =>
    i > 0 && c.close > last5[i - 1].close && c.volume > indicators.volume.avg20
  ).length;

  // ═══ PUNTUACION ═══

  // --- SUBA SOSTENIDA (max 25) ---
  // El precio TIENE QUE estar subiendo. Sin esto, no hay oportunidad.
  let recoveryPosition = 0;

  // Variacion positiva de 5 ruedas (suba sostenida, no un dia verde)
  if (var5d > 3) recoveryPosition += 10;
  else if (var5d > 1) recoveryPosition += 5;
  else if (var5d > 0) recoveryPosition += 2;
  // Si cayo en 5 ruedas, no es oportunidad
  else return { recoveryPosition: 0, momentumShift: 0, breakoutSignals: 0, trendFormation: 0, volumeConfirmation: 0, riskReward: 0, total: 0 };

  // SMA20 girando al alza = la tendencia de corto plazo cambio
  if (sma20Rising) recoveryPosition += 8;

  // Precio arriba de SMA20 = recuperacion de corto plazo confirmada
  if (indicators.sma20 != null && price > indicators.sma20) {
    recoveryPosition += 7;
  }

  recoveryPosition = clamp(recoveryPosition, 0, 25);

  // --- GIRO DE MOMENTUM (max 20) ---
  let momentumShift = 0;

  if (indicators.macd) {
    // MACD cruzando signal al alza
    if (indicators.macd.macdLine > indicators.macd.signalLine) momentumShift += 5;
    // Histograma creciendo (no solo positivo, sino con fuerza)
    if (histGrowing) momentumShift += 4;
    // Bonus: cruce desde territorio negativo (la recuperacion recien empieza)
    if (indicators.macd.macdLine < 0 && indicators.macd.macdLine > indicators.macd.signalLine) {
      momentumShift += 3;
    }
  }

  if (indicators.rsi != null) {
    // RSI entre 35-55: saliendo de zona baja pero no sobrecomprado
    if (indicators.rsi >= 35 && indicators.rsi <= 55) momentumShift += 5;
    else if (indicators.rsi > 55 && indicators.rsi <= 65) momentumShift += 2;
  }

  if (indicators.stochastic) {
    if (indicators.stochastic.k > indicators.stochastic.d && indicators.stochastic.k < 60) {
      momentumShift += 3;
    }
  }

  momentumShift = clamp(momentumShift, 0, 20);

  // --- BREAKOUT DE CORTO PLAZO (max 20) ---
  let breakoutSignals = 0;

  // Rompio resistencia de 20 ruedas
  if (price > indicators.resistance) {
    breakoutSignals += 10;
  }
  // Acercandose a romperla (dentro del 2%)
  else if (indicators.resistance > 0) {
    const distToResist = ((indicators.resistance - price) / price) * 100;
    if (distToResist < 2) breakoutSignals += 5;
  }

  // Variacion de 10 ruedas positiva = tendencia de corto plazo confirmada
  if (var10d > 3) breakoutSignals += 5;
  else if (var10d > 1) breakoutSignals += 2;

  // Saliendo de banda inferior de Bollinger
  if (indicators.bollinger && indicators.bollinger.percentB > 10 && indicators.bollinger.percentB < 50) {
    breakoutSignals += 5;
  }

  breakoutSignals = clamp(breakoutSignals, 0, 20);

  // --- FORMACION DE TENDENCIA (max 15) ---
  let trendFormation = 0;

  if (indicators.dmi) {
    // DI+ dominando = compradores en control
    if (indicators.dmi.plusDI > indicators.dmi.minusDI) trendFormation += 6;
    // ADX en 15-30: tendencia formandose (no lateral pero tampoco madura)
    if (indicators.dmi.adx >= 15 && indicators.dmi.adx <= 35) trendFormation += 5;
  }

  // Precio debajo de SMA50 acercandose = espacio para subir
  if (indicators.sma50 != null && price < indicators.sma50) {
    const distToSma50 = ((indicators.sma50 - price) / price) * 100;
    if (distToSma50 > 2 && distToSma50 < 12) trendFormation += 4; // Sweet spot
  }

  trendFormation = clamp(trendFormation, 0, 15);

  // --- VOLUMEN CRECIENTE EN SUBA (max 10) ---
  let volumeConfirmation = 0;

  // Dias de suba con volumen alto en los ultimos 5 dias
  if (upDaysWithVol >= 3) volumeConfirmation += 6;
  else if (upDaysWithVol >= 2) volumeConfirmation += 4;
  else if (upDaysWithVol >= 1) volumeConfirmation += 2;

  // Volumen relativo alto hoy
  if (indicators.volume.relative > 1.3 && price > previousClose) {
    volumeConfirmation += 4;
  }

  volumeConfirmation = clamp(volumeConfirmation, 0, 10);

  // --- RIESGO/RECOMPENSA (max 10) ---
  let riskReward = 0;

  // Cerca del soporte (poco downside si sale mal)
  if (price > 0) {
    const distToSupport = ((price - indicators.support) / price) * 100;
    if (distToSupport < 3) riskReward += 4;
    else if (distToSupport < 6) riskReward += 2;
  }

  // Espacio para subir hasta SMA50 (upside target)
  if (indicators.sma50 != null && indicators.sma50 > price) {
    const upsidePct = ((indicators.sma50 - price) / price) * 100;
    if (upsidePct > 3 && upsidePct < 15) riskReward += 4; // Upside atractivo
    else if (upsidePct >= 2) riskReward += 2;
  }

  // Ya llego a la media o esta por encima = ya no es oportunidad de "compra barata"
  if (indicators.sma50 != null && price >= indicators.sma50) {
    riskReward += 2; // Algo de puntos por haber superado la media (breakout)
  }

  riskReward = clamp(riskReward, 0, 10);

  const total = recoveryPosition + momentumShift + breakoutSignals +
    trendFormation + volumeConfirmation + riskReward;

  return {
    recoveryPosition,
    momentumShift,
    breakoutSignals,
    trendFormation,
    volumeConfirmation,
    riskReward,
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

export function getOpportunityLabel(score: number): string {
  if (score >= 70) return 'Oportunidad fuerte';
  if (score >= 55) return 'Buena oportunidad';
  if (score >= 40) return 'Oportunidad moderada';
  if (score >= 20) return 'Oportunidad debil';
  return 'Sin oportunidad';
}
