import { TechnicalIndicators, ScoreBreakdown, OpportunityScore, Recommendation } from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ═══════════════════════════════════════════════════════
// SCORE DE SALUD TECNICA (modelo original)
// Evalua si un activo esta "sano" tecnicamente
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
  if (rel > 1.2) volume += 8;
  else if (rel > 0.8) volume += 4;
  const priceUp = price > previousClose;
  if ((priceUp && rel > 1.0) || (!priceUp && rel < 0.8)) volume += 7;
  else volume += 3;
  volume = clamp(volume, 0, 15);

  let volatility = 0;
  if (indicators.bollinger) {
    if (indicators.bollinger.percentB > 20 && indicators.bollinger.percentB < 80) volatility += 4;
    else volatility += 2;
    if (indicators.bollinger.bandwidth > 3 && indicators.bollinger.bandwidth < 20) volatility += 3;
    else volatility += 1;
  } else if (price > 0) {
    const priceRange = (indicators.resistance - indicators.support) / price;
    volatility = priceRange > 0.03 && priceRange < 0.15 ? 7 : 3;
  }
  if (indicators.atr != null && price > 0) {
    const atrPct = (indicators.atr / price) * 100;
    if (atrPct < 3) volatility += 3;
    else if (atrPct < 5) volatility += 1;
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
// Detecta recuperaciones tempranas: precio abajo de la media,
// rompiendo resistencia de corto plazo, momentum girando.
// El objetivo es comprar ANTES de que llegue a la media.
// ═══════════════════════════════════════════════════════

export function computeOpportunityScore(
  price: number,
  indicators: TechnicalIndicators,
  previousClose: number
): OpportunityScore {

  // --- POSICION DE RECUPERACION (max 25) ---
  // Premia: precio DEBAJO de SMA50 pero mostrando signos de recuperacion
  let recoveryPosition = 0;

  if (indicators.sma50 != null && price > 0) {
    const pctBelowSma50 = ((indicators.sma50 - price) / indicators.sma50) * 100;

    // Precio debajo de SMA50 (zona de descuento)
    if (pctBelowSma50 > 0 && pctBelowSma50 < 15) {
      // Sweet spot: 2-10% debajo de la media = buen descuento con recuperacion probable
      if (pctBelowSma50 >= 2 && pctBelowSma50 <= 10) recoveryPosition += 10;
      // Apenas debajo: puede romperla pronto
      else if (pctBelowSma50 < 2) recoveryPosition += 6;
      // Muy lejos: mas riesgo
      else recoveryPosition += 3;
    }
  }

  // Precio arriba de SMA20 = recuperacion de corto plazo confirmada
  if (indicators.sma20 != null && price > indicators.sma20) {
    recoveryPosition += 8;
  }

  // Precio arriba de SMA200 pero debajo de SMA50 = correccion dentro de tendencia alcista de fondo
  if (indicators.sma200 != null && indicators.sma50 != null) {
    if (price > indicators.sma200 && price < indicators.sma50) {
      recoveryPosition += 7; // Mejor escenario: pullback en tendencia alcista
    }
  }

  recoveryPosition = clamp(recoveryPosition, 0, 25);

  // --- GIRO DE MOMENTUM (max 20) ---
  // Premia: MACD cruzando al alza, RSI saliendo de zona baja, estocastico girando
  let momentumShift = 0;

  if (indicators.macd) {
    // MACD cruzando signal al alza (compra tecnica clasica)
    if (indicators.macd.macdLine > indicators.macd.signalLine) {
      momentumShift += 6;
    }
    // Histograma positivo y creciente desde negativo = momentum girando
    if (indicators.macd.histogram > 0) {
      momentumShift += 3;
    }
    // MACD todavia negativo pero subiendo = la recuperacion recien empieza (mejor oportunidad)
    if (indicators.macd.macdLine < 0 && indicators.macd.macdLine > indicators.macd.signalLine) {
      momentumShift += 3; // Bonus: cruce alcista desde territorio negativo
    }
  }

  if (indicators.rsi != null) {
    // RSI entre 35-55: saliendo de zona baja, no esta sobrecomprado
    if (indicators.rsi >= 35 && indicators.rsi <= 55) {
      momentumShift += 6;
    }
    // RSI < 35: sobreventa, oportunidad si otros indicadores acompanan
    else if (indicators.rsi >= 25 && indicators.rsi < 35) {
      momentumShift += 4;
    }
    // RSI > 55: ya esta caro para una "oportunidad"
  }

  if (indicators.stochastic) {
    // %K cruzando %D al alza desde zona baja (<50): senal de compra temprana
    if (indicators.stochastic.k > indicators.stochastic.d && indicators.stochastic.k < 50) {
      momentumShift += 2;
    }
  }

  momentumShift = clamp(momentumShift, 0, 20);

  // --- SENALES DE BREAKOUT (max 20) ---
  // Premia: ruptura de resistencia de corto plazo con volumen
  let breakoutSignals = 0;

  // Precio rompiendo resistencia de 20 ruedas
  if (price > indicators.resistance && price > previousClose) {
    breakoutSignals += 10;
  }
  // Precio subiendo hoy (confirmacion de direccion)
  else if (price > previousClose) {
    breakoutSignals += 3;
  }

  // Volumen alto en dia de suba = breakout confirmado
  if (price > previousClose && indicators.volume.relative > 1.2) {
    breakoutSignals += 5;
  }

  // Bollinger: precio saliendo de banda inferior = rebote desde extremo
  if (indicators.bollinger) {
    if (indicators.bollinger.percentB > 10 && indicators.bollinger.percentB < 40) {
      breakoutSignals += 5; // Saliendo de zona baja, espacio para subir
    }
  }

  breakoutSignals = clamp(breakoutSignals, 0, 20);

  // --- FORMACION DE TENDENCIA (max 15) ---
  // Premia: nueva tendencia formandose (no una tendencia ya establecida)
  let trendFormation = 0;

  if (indicators.dmi) {
    // ADX subiendo desde niveles bajos = nueva tendencia formandose
    if (indicators.dmi.adx >= 15 && indicators.dmi.adx <= 30) {
      trendFormation += 6; // Tendencia naciente, operable
    }
    // DI+ cruzando DI- = compradores tomando control
    if (indicators.dmi.plusDI > indicators.dmi.minusDI) {
      trendFormation += 5;
    }
    // DI+ subiendo y DI- bajando = presion compradora creciente
    if (indicators.dmi.plusDI > indicators.dmi.minusDI &&
        indicators.dmi.adx > 15) {
      trendFormation += 4;
    }
  }

  trendFormation = clamp(trendFormation, 0, 15);

  // --- CONFIRMACION POR VOLUMEN (max 10) ---
  let volumeConfirmation = 0;

  // Volumen superior al promedio en dia de suba
  if (price > previousClose) {
    if (indicators.volume.relative > 1.5) volumeConfirmation += 6;
    else if (indicators.volume.relative > 1.0) volumeConfirmation += 3;
  }

  // Volumen en general alto = interes del mercado
  if (indicators.volume.relative > 1.2) {
    volumeConfirmation += 4;
  }

  volumeConfirmation = clamp(volumeConfirmation, 0, 10);

  // --- RIESGO/RECOMPENSA (max 10) ---
  let riskReward = 0;

  if (price > 0) {
    // Cerca del soporte = poco downside
    const distToSupport = (price - indicators.support) / price;
    if (distToSupport < 0.03) riskReward += 5;
    else if (distToSupport < 0.06) riskReward += 3;

    // Espacio para subir hasta SMA50
    if (indicators.sma50 != null && indicators.sma50 > price) {
      const upsidePct = ((indicators.sma50 - price) / price) * 100;
      if (upsidePct > 3 && upsidePct < 15) riskReward += 5; // Upside atractivo y realista
      else if (upsidePct >= 1) riskReward += 2;
    }
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
  if (score >= 75) return 'Oportunidad muy fuerte';
  if (score >= 60) return 'Buena oportunidad';
  if (score >= 45) return 'Oportunidad moderada';
  if (score >= 25) return 'Oportunidad debil';
  return 'Sin oportunidad';
}
