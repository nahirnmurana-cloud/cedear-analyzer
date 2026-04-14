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
// Arquitectura de factores conceptuales:
// Cada factor se calcula de 0 a 100 internamente,
// despues se pondera al score final.
//
// Pesos:
//   Momentum:      22%  — cambio de direccion
//   Tendencia:     18%  — inicio de trend
//   Entry Timing:  22%  — que tan temprano estas
//   Volumen:       14%  — confirmacion
//   Riesgo/Rec:    18%  — vale la pena
//   Calidad:        6%  — filtro de ruido
// ═══════════════════════════════════════════════════════

const WEIGHTS = {
  momentum: 0.22,
  trendFormation: 0.18,
  entryTiming: 0.22,
  volumeConfirmation: 0.14,
  riskReward: 0.18,
  setupQuality: 0.06,
};

// --- Factor: Momentum (0-100) ---
function scoreMomentum(indicators: TechnicalIndicators): { score: number; reasons: string[]; warns: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const warns: string[] = [];

  if (indicators.macd) {
    if (indicators.macd.macdLine > indicators.macd.signalLine) {
      s += 35;
      reasons.push('MACD cruzo al alza');
      if (indicators.macd.macdLine < 0) {
        s += 15; // Cruce desde territorio negativo = early
        reasons.push('Cruce desde territorio negativo (senal temprana)');
      }
    } else {
      warns.push('MACD bajista');
    }
    if (indicators.macd.histogram > 0) s += 10;
  }

  if (indicators.rsi != null) {
    if (indicators.rsi >= 35 && indicators.rsi <= 55) {
      s += 25;
      reasons.push(`RSI en ${indicators.rsi.toFixed(0)} (zona de recuperacion)`);
    } else if (indicators.rsi > 55 && indicators.rsi <= 65) {
      s += 10;
    } else if (indicators.rsi < 35) {
      s += 15;
      reasons.push(`RSI en ${indicators.rsi.toFixed(0)} (sobreventa)`);
    } else if (indicators.rsi > 70) {
      s -= 10;
      warns.push(`RSI en ${indicators.rsi.toFixed(0)} (sobrecompra)`);
    }
  }

  if (indicators.stochastic) {
    if (indicators.stochastic.k > indicators.stochastic.d && indicators.stochastic.k < 60) {
      s += 15;
    }
  }

  return { score: clamp(s, 0, 100), reasons, warns };
}

// --- Factor: Tendencia naciente (0-100) ---
function scoreTrendFormation(indicators: TechnicalIndicators, price: number, sma20Rising: boolean): { score: number; reasons: string[]; warns: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const warns: string[] = [];

  if (indicators.dmi) {
    if (indicators.dmi.plusDI > indicators.dmi.minusDI) {
      s += 30;
      reasons.push('Compradores dominan (DI+ > DI-)');
    } else {
      warns.push('Vendedores dominan (DI- > DI+)');
    }
    if (indicators.dmi.adx >= 15 && indicators.dmi.adx <= 35) {
      s += 25;
      reasons.push(`ADX en ${indicators.dmi.adx.toFixed(0)} (tendencia formandose)`);
    } else if (indicators.dmi.adx < 15) {
      s += 5;
      warns.push('ADX muy bajo (sin tendencia)');
    }
  }

  if (sma20Rising) {
    s += 25;
    reasons.push('SMA20 girando al alza');
  }

  if (indicators.sma20 != null && price > indicators.sma20) {
    s += 20;
  }

  return { score: clamp(s, 0, 100), reasons, warns };
}

// --- Factor: Entry Timing (0-100) ---
// Que tan temprano estas en el movimiento
function scoreEntryTiming(
  price: number, indicators: TechnicalIndicators,
  var5d: number, var10d: number
): { score: number; reasons: string[]; warns: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const warns: string[] = [];

  // Distancia a SMA50: debajo pero acercandose = early
  if (indicators.sma50 != null && price > 0) {
    const distPct = ((indicators.sma50 - price) / price) * 100;
    if (distPct > 2 && distPct < 12) {
      s += 35; // Sweet spot: debajo de la media con espacio
      reasons.push(`${distPct.toFixed(1)}% debajo de SMA50 (entrada temprana)`);
    } else if (distPct >= 0 && distPct <= 2) {
      s += 20; // A punto de romper
      reasons.push('Cerca de SMA50, posible ruptura');
    } else if (distPct < 0 && distPct > -3) {
      s += 10; // Apenas arriba, todavia aceptable
    } else if (distPct < -5) {
      s -= 15; // Muy arriba de la media = llegaste tarde
      warns.push('Ya supero la media por mucho (entrada tardia)');
    }
  }

  // Pullback en tendencia alcista (debajo de SMA50 pero arriba de SMA200)
  if (indicators.sma200 != null && indicators.sma50 != null) {
    if (price > indicators.sma200 && price < indicators.sma50) {
      s += 30;
      reasons.push('Pullback en tendencia alcista de fondo');
    }
  }

  // Variacion de corto plazo como penalizacion/bonus suave (no hard filter)
  if (var5d > 3) s += 20;
  else if (var5d > 0) s += 10;
  else if (var5d > -2) s -= 5; // Caida leve, penalizacion suave
  else s -= 20; // Caida fuerte, penalizacion fuerte

  if (var10d > 5) s += 15;
  else if (var10d > 0) s += 5;

  return { score: clamp(s, 0, 100), reasons, warns };
}

// --- Factor: Volumen (0-100) ---
function scoreVolume(
  indicators: TechnicalIndicators, price: number, previousClose: number,
  upDaysWithVol: number
): { score: number; reasons: string[]; warns: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const warns: string[] = [];

  const isUp = price > previousClose;

  if (isUp && indicators.volume.relative > 1.5) {
    s += 40;
    reasons.push(`Volumen ${indicators.volume.relative.toFixed(1)}x en dia de suba`);
  } else if (isUp && indicators.volume.relative > 1.0) {
    s += 20;
  } else if (!isUp && indicators.volume.relative > 1.5) {
    s -= 10;
    warns.push('Volumen alto en dia de caida');
  }

  // Dias de suba con volumen en la semana
  if (upDaysWithVol >= 3) {
    s += 35;
    reasons.push(`${upDaysWithVol} de 5 dias subieron con volumen`);
  } else if (upDaysWithVol >= 2) {
    s += 20;
  } else if (upDaysWithVol >= 1) {
    s += 10;
  } else {
    warns.push('Sin dias de suba con volumen esta semana');
  }

  if (indicators.volume.relative > 1.2) s += 15;
  if (indicators.volume.relative < 0.5) {
    s -= 15;
    warns.push('Volumen muy bajo');
  }

  return { score: clamp(s, 0, 100), reasons, warns };
}

// --- Factor: Riesgo/Recompensa (0-100) ---
function scoreRiskReward(
  price: number, indicators: TechnicalIndicators
): { score: number; reasons: string[]; warns: string[] } {
  let s = 0;
  const reasons: string[] = [];
  const warns: string[] = [];

  if (price <= 0) return { score: 0, reasons, warns };

  // Distancia al soporte (downside risk)
  const distToSupport = ((price - indicators.support) / price) * 100;
  if (distToSupport < 3) {
    s += 30;
    reasons.push('Cerca del soporte (poco downside)');
  } else if (distToSupport < 6) {
    s += 15;
  } else if (distToSupport > 12) {
    s -= 10;
    warns.push('Lejos del soporte (riesgo elevado)');
  }

  // Upside hasta SMA50
  if (indicators.sma50 != null && indicators.sma50 > price) {
    const upsidePct = ((indicators.sma50 - price) / price) * 100;
    if (upsidePct > 3 && upsidePct < 15) {
      s += 35;
      reasons.push(`${upsidePct.toFixed(1)}% de upside hasta SMA50`);
    } else if (upsidePct >= 2) {
      s += 15;
    }
  } else if (indicators.sma50 != null) {
    // Ya paso la media — breakout, target es resistencia
    if (price > indicators.resistance) {
      s += 20;
      reasons.push('Rompio resistencia, nuevo terreno');
    } else {
      s += 10;
    }
  }

  // ATR como medida de riesgo
  if (indicators.atr != null) {
    const atrPct = (indicators.atr / price) * 100;
    if (atrPct < 3) {
      s += 20;
    } else if (atrPct < 5) {
      s += 10;
    } else {
      warns.push('Volatilidad alta (ATR elevado)');
    }
  }

  // Bollinger: espacio para subir
  if (indicators.bollinger) {
    if (indicators.bollinger.percentB > 10 && indicators.bollinger.percentB < 50) {
      s += 15;
      reasons.push('En mitad inferior de Bollinger (espacio para subir)');
    }
  }

  return { score: clamp(s, 0, 100), reasons, warns };
}

// --- Factor: Calidad del setup (0-100) ---
function scoreSetupQuality(
  var5d: number, rangePct: number, indicators: TechnicalIndicators
): { score: number; reasons: string[]; warns: string[] } {
  let s = 50; // Base neutral
  const reasons: string[] = [];
  const warns: string[] = [];

  // Lateralidad = baja calidad
  if (rangePct < 3) {
    s -= 30;
    warns.push('Lateralizando (rango < 3%)');
  } else if (rangePct > 5) {
    s += 15;
  }

  // Consistencia de la suba
  if (var5d > 2) s += 20;
  else if (var5d < -1) {
    s -= 20;
    warns.push('Cayendo en las ultimas 5 ruedas');
  }

  // Senales contradictorias = baja calidad
  let bullishSignals = 0;
  let bearishSignals = 0;
  if (indicators.macd && indicators.macd.macdLine > indicators.macd.signalLine) bullishSignals++;
  else bearishSignals++;
  if (indicators.rsi != null && indicators.rsi > 40) bullishSignals++;
  else bearishSignals++;
  if (indicators.dmi && indicators.dmi.plusDI > indicators.dmi.minusDI) bullishSignals++;
  else bearishSignals++;

  if (bullishSignals >= 3) {
    s += 20;
    reasons.push('Senales consistentes (MACD + RSI + DMI alineados)');
  } else if (bearishSignals >= 2) {
    s -= 15;
    warns.push('Senales contradictorias');
  }

  return { score: clamp(s, 0, 100), reasons, warns };
}

// ═══════════════════════════════════════════════════════
// SCORE FINAL DE OPORTUNIDAD
// ═══════════════════════════════════════════════════════

export function computeOpportunityScore(
  price: number,
  indicators: TechnicalIndicators,
  previousClose: number,
  candles: Candle[]
): OpportunityScore {
  if (candles.length < 20 || price <= 0) {
    return { momentum: 0, trendFormation: 0, entryTiming: 0, volumeConfirmation: 0, riskReward: 0, setupQuality: 0, total: 0, explanation: [], warnings: ['Datos insuficientes'] };
  }

  const closes = candles.map(c => c.close);
  const n = candles.length;

  // Variaciones
  const var5d = n >= 6 ? ((price - closes[n - 6]) / closes[n - 6]) * 100 : 0;
  const var10d = n >= 11 ? ((price - closes[n - 11]) / closes[n - 11]) * 100 : 0;

  // Rango de lateralidad
  const last10 = candles.slice(-10);
  const rangePct = price > 0
    ? ((Math.max(...last10.map(c => c.high)) - Math.min(...last10.map(c => c.low))) / price) * 100
    : 0;

  // SMA20 girando
  const sma20Series = sma(closes, 20);
  const sma20Now = sma20Series[n - 1];
  const sma20Prev5 = n >= 6 ? sma20Series[n - 6] : null;
  const sma20Rising = sma20Now != null && sma20Prev5 != null && sma20Now > sma20Prev5;

  // Dias de suba con volumen
  const last5 = candles.slice(-5);
  const upDaysWithVol = last5.filter((c, i) =>
    i > 0 && c.close > last5[i - 1].close && c.volume > indicators.volume.avg20
  ).length;

  // Calcular cada factor
  const mom = scoreMomentum(indicators);
  const trend = scoreTrendFormation(indicators, price, sma20Rising);
  const timing = scoreEntryTiming(price, indicators, var5d, var10d);
  const vol = scoreVolume(indicators, price, previousClose, upDaysWithVol);
  const rr = scoreRiskReward(price, indicators);
  const quality = scoreSetupQuality(var5d, rangePct, indicators);

  // Score ponderado
  const total = Math.round(
    mom.score * WEIGHTS.momentum +
    trend.score * WEIGHTS.trendFormation +
    timing.score * WEIGHTS.entryTiming +
    vol.score * WEIGHTS.volumeConfirmation +
    rr.score * WEIGHTS.riskReward +
    quality.score * WEIGHTS.setupQuality
  );

  // Juntar explicaciones
  const explanation = [
    ...mom.reasons, ...trend.reasons, ...timing.reasons,
    ...vol.reasons, ...rr.reasons, ...quality.reasons,
  ];
  const warnings = [
    ...mom.warns, ...trend.warns, ...timing.warns,
    ...vol.warns, ...rr.warns, ...quality.warns,
  ];

  return {
    momentum: mom.score,
    trendFormation: trend.score,
    entryTiming: timing.score,
    volumeConfirmation: vol.score,
    riskReward: rr.score,
    setupQuality: quality.score,
    total: clamp(total, 0, 100),
    explanation,
    warnings,
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
