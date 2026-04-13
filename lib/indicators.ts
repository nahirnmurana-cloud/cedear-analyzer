import { Candle, TechnicalIndicators, IndicatorSeries } from './types';

// --- Simple Moving Average ---
export function sma(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += values[j];
      }
      result.push(sum / period);
    }
  }
  return result;
}

// --- Exponential Moving Average ---
export function ema(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      // Seed with SMA
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += values[j];
      }
      result.push(sum / period);
    } else {
      const prev = result[i - 1]!;
      result.push((values[i] - prev) * multiplier + prev);
    }
  }
  return result;
}

// --- RSI (Wilder's smoothing) ---
export function rsi(values: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];

  if (values.length < period + 1) {
    return values.map(() => null);
  }

  // Calculate gains and losses
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }

  // First average
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  result.push(null); // index 0 has no change
  for (let i = 0; i < period - 1; i++) {
    result.push(null);
  }

  // First RSI value
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + rs));

  // Subsequent values using Wilder smoothing
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rsVal = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + rsVal));
  }

  return result;
}

// --- MACD ---
export function macd(
  values: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): {
  macdLine: (number | null)[];
  signalLine: (number | null)[];
  histogram: (number | null)[];
} {
  const fastEma = ema(values, fastPeriod);
  const slowEma = ema(values, slowPeriod);

  const macdLine: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (fastEma[i] != null && slowEma[i] != null) {
      macdLine.push(fastEma[i]! - slowEma[i]!);
    } else {
      macdLine.push(null);
    }
  }

  // Signal line = EMA of MACD line (only non-null values)
  const macdValues: number[] = [];
  const macdIndices: number[] = [];
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] != null) {
      macdValues.push(macdLine[i]!);
      macdIndices.push(i);
    }
  }

  const signalEma = ema(macdValues, signalPeriod);

  const signalLine: (number | null)[] = new Array(values.length).fill(null);
  const histogram: (number | null)[] = new Array(values.length).fill(null);

  for (let j = 0; j < macdValues.length; j++) {
    const idx = macdIndices[j];
    if (signalEma[j] != null) {
      signalLine[idx] = signalEma[j];
      histogram[idx] = macdValues[j] - signalEma[j]!;
    }
  }

  return { macdLine, signalLine, histogram };
}

// --- True Range ---
function trueRange(candles: Candle[]): number[] {
  const tr: number[] = [candles[0].high - candles[0].low];
  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hc = Math.abs(candles[i].high - candles[i - 1].close);
    const lc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hc, lc));
  }
  return tr;
}

// --- Wilder's Smoothing ---
function wilderSmooth(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  if (values.length < period) {
    return values.map(() => null);
  }

  let sum = 0;
  for (let i = 0; i < period; i++) {
    result.push(null);
    sum += values[i];
  }
  result[period - 1] = sum / period;

  for (let i = period; i < values.length; i++) {
    const prev = result[i - 1]!;
    result.push((prev * (period - 1) + values[i]) / period);
  }

  return result;
}

// --- DMI and ADX ---
export function dmiAdx(
  candles: Candle[],
  period: number = 14
): {
  plusDI: (number | null)[];
  minusDI: (number | null)[];
  adx: (number | null)[];
} {
  if (candles.length < period + 1) {
    const empty = candles.map(() => null);
    return { plusDI: empty, minusDI: empty, adx: empty };
  }

  // Calculate +DM, -DM
  const plusDM: number[] = [0];
  const minusDM: number[] = [0];
  for (let i = 1; i < candles.length; i++) {
    const upMove = candles[i].high - candles[i - 1].high;
    const downMove = candles[i - 1].low - candles[i].low;

    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }

  const tr = trueRange(candles);
  const smoothedTR = wilderSmooth(tr, period);
  const smoothedPlusDM = wilderSmooth(plusDM, period);
  const smoothedMinusDM = wilderSmooth(minusDM, period);

  const plusDI: (number | null)[] = [];
  const minusDI: (number | null)[] = [];
  const dx: number[] = [];
  const dxIndices: number[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (
      smoothedTR[i] != null &&
      smoothedPlusDM[i] != null &&
      smoothedMinusDM[i] != null &&
      smoothedTR[i]! > 0
    ) {
      const pdi = (100 * smoothedPlusDM[i]!) / smoothedTR[i]!;
      const mdi = (100 * smoothedMinusDM[i]!) / smoothedTR[i]!;
      plusDI.push(pdi);
      minusDI.push(mdi);
      const diSum = pdi + mdi;
      if (diSum > 0) {
        dx.push((100 * Math.abs(pdi - mdi)) / diSum);
        dxIndices.push(i);
      }
    } else {
      plusDI.push(null);
      minusDI.push(null);
    }
  }

  // ADX = Wilder smooth of DX
  const adxSmoothed = wilderSmooth(dx, period);
  const adx: (number | null)[] = new Array(candles.length).fill(null);
  for (let j = 0; j < dx.length; j++) {
    if (adxSmoothed[j] != null) {
      adx[dxIndices[j]] = adxSmoothed[j];
    }
  }

  return { plusDI, minusDI, adx };
}

// --- Bollinger Bands ---
export function bollingerBands(
  values: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
} {
  const middle = sma(values, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < values.length; i++) {
    if (i < period - 1 || middle[i] == null) {
      upper.push(null);
      lower.push(null);
    } else {
      let sumSq = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sumSq += (values[j] - middle[i]!) ** 2;
      }
      const stdDev = Math.sqrt(sumSq / period);
      upper.push(middle[i]! + stdDevMultiplier * stdDev);
      lower.push(middle[i]! - stdDevMultiplier * stdDev);
    }
  }

  return { upper, middle, lower };
}

// --- ATR (Average True Range) ---
export function atr(candles: Candle[], period: number = 14): (number | null)[] {
  const tr = trueRange(candles);
  return wilderSmooth(tr, period);
}

// --- Stochastic Oscillator ---
export function stochastic(
  candles: Candle[],
  kPeriod: number = 14,
  dPeriod: number = 3
): {
  k: (number | null)[];
  d: (number | null)[];
} {
  const kValues: (number | null)[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (i < kPeriod - 1) {
      kValues.push(null);
    } else {
      let highestHigh = -Infinity;
      let lowestLow = Infinity;
      for (let j = i - kPeriod + 1; j <= i; j++) {
        if (candles[j].high > highestHigh) highestHigh = candles[j].high;
        if (candles[j].low < lowestLow) lowestLow = candles[j].low;
      }
      const range = highestHigh - lowestLow;
      kValues.push(
        range > 0
          ? ((candles[i].close - lowestLow) / range) * 100
          : 50
      );
    }
  }

  // %D = SMA of %K
  const kNonNull: number[] = [];
  const kIndices: number[] = [];
  for (let i = 0; i < kValues.length; i++) {
    if (kValues[i] != null) {
      kNonNull.push(kValues[i]!);
      kIndices.push(i);
    }
  }
  const dSma = sma(kNonNull, dPeriod);
  const dValues: (number | null)[] = new Array(candles.length).fill(null);
  for (let j = 0; j < kNonNull.length; j++) {
    if (dSma[j] != null) {
      dValues[kIndices[j]] = dSma[j];
    }
  }

  return { k: kValues, d: dValues };
}

// --- Support and Resistance ---
function supportResistance(
  candles: Candle[],
  period: number
): { support: number; resistance: number } {
  const recent = candles.slice(-period);
  const lows = recent.map((c) => c.low);
  const highs = recent.map((c) => c.high);
  return {
    support: Math.min(...lows),
    resistance: Math.max(...highs),
  };
}

// --- Compute all indicators ---
export function computeIndicators(candles: Candle[]): {
  latest: TechnicalIndicators;
  series: IndicatorSeries;
} {
  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);

  // Moving averages
  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const sma200 = sma(closes, 200);
  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const ema200 = ema(closes, 200);

  // RSI
  const rsiValues = rsi(closes, 14);

  // MACD
  const macdResult = macd(closes, 12, 26, 9);

  // DMI / ADX
  const dmiResult = dmiAdx(candles, 14);

  // Bollinger Bands
  const bbResult = bollingerBands(closes, 20, 2);

  // ATR
  const atrValues = atr(candles, 14);

  // Stochastic
  const stochResult = stochastic(candles, 14, 3);

  // Volume
  const volAvg20 = sma(volumes, 20);
  const lastIdx = candles.length - 1;
  const currentVol = volumes[lastIdx];
  const avgVol20 = volAvg20[lastIdx] ?? currentVol;

  // Support / Resistance
  const sr20 = supportResistance(candles, 20);
  const sr50 = supportResistance(candles, Math.min(50, candles.length));

  const last = (arr: (number | null)[]) => arr[lastIdx] ?? null;

  const macdLatest =
    macdResult.macdLine[lastIdx] != null &&
    macdResult.signalLine[lastIdx] != null
      ? {
          macdLine: macdResult.macdLine[lastIdx]!,
          signalLine: macdResult.signalLine[lastIdx]!,
          histogram: macdResult.histogram[lastIdx] ?? 0,
        }
      : null;

  const dmiLatest =
    dmiResult.plusDI[lastIdx] != null && dmiResult.adx[lastIdx] != null
      ? {
          plusDI: dmiResult.plusDI[lastIdx]! as number,
          minusDI: dmiResult.minusDI[lastIdx]! as number,
          adx: dmiResult.adx[lastIdx]! as number,
        }
      : null;

  const latest: TechnicalIndicators = {
    sma20: last(sma20),
    sma50: last(sma50),
    sma200: last(sma200),
    ema20: last(ema20),
    ema50: last(ema50),
    ema200: last(ema200),
    rsi: last(rsiValues),
    macd: macdLatest,
    dmi: dmiLatest,
    volume: {
      current: currentVol,
      avg20: avgVol20,
      relative: avgVol20 > 0 ? currentVol / avgVol20 : 1,
    },
    bollinger:
      bbResult.upper[lastIdx] != null
        ? {
            upper: bbResult.upper[lastIdx]!,
            middle: bbResult.middle[lastIdx]!,
            lower: bbResult.lower[lastIdx]!,
            bandwidth:
              bbResult.middle[lastIdx]! > 0
                ? ((bbResult.upper[lastIdx]! - bbResult.lower[lastIdx]!) /
                    bbResult.middle[lastIdx]!) *
                  100
                : 0,
            percentB:
              bbResult.upper[lastIdx]! - bbResult.lower[lastIdx]! > 0
                ? ((closes[lastIdx] - bbResult.lower[lastIdx]!) /
                    (bbResult.upper[lastIdx]! - bbResult.lower[lastIdx]!)) *
                  100
                : 50,
          }
        : null,
    atr: atrValues[lastIdx] ?? null,
    stochastic:
      stochResult.k[lastIdx] != null
        ? {
            k: stochResult.k[lastIdx]!,
            d: stochResult.d[lastIdx] ?? stochResult.k[lastIdx]!,
          }
        : null,
    support: sr20.support,
    resistance: sr20.resistance,
    support50: sr50.support,
    resistance50: sr50.resistance,
  };

  const series: IndicatorSeries = {
    dates: candles.map((c) => c.date),
    close: closes,
    sma20,
    sma50,
    sma200,
    rsi: rsiValues,
    macdLine: macdResult.macdLine,
    macdSignal: macdResult.signalLine,
    macdHistogram: macdResult.histogram,
    plusDI: dmiResult.plusDI,
    minusDI: dmiResult.minusDI,
    adx: dmiResult.adx,
    volume: volumes,
    bollingerUpper: bbResult.upper,
    bollingerLower: bbResult.lower,
    atr: atrValues,
    stochasticK: stochResult.k,
    stochasticD: stochResult.d,
  };

  return { latest, series };
}
