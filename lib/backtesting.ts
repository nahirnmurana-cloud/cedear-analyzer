import { Candle, TechnicalIndicators } from './types';
import { computeIndicators } from './indicators';
import { computeScore, getRecommendation } from './scoring';

// --- Trade model ---

export interface Trade {
  id: number;
  entryDate: string;
  entryPrice: number;
  entryScore: number;
  entryReasons: string[];
  exitDate: string | null;
  exitPrice: number | null;
  exitScore: number | null;
  exitReasons: string[];
  status: 'closed' | 'open';
  returnPct: number;
  holdingDays: number;
}

export interface EquityPoint {
  date: string;
  strategy: number;
  buyAndHold: number;
}

export interface BacktestResult {
  // KPIs
  strategyReturn: number;
  buyAndHoldReturn: number;
  alpha: number;
  closedTrades: number;
  winners: number;
  losers: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  avgReturnPerTrade: number;
  // Data
  trades: Trade[];
  equityCurve: EquityPoint[];
  periodStart: string;
  periodEnd: string;
  // Diagnostic
  diagnostic: string;
}

// --- Helpers ---

function getEntryReasons(
  indicators: TechnicalIndicators,
  price: number
): string[] {
  const reasons: string[] = [];
  if (indicators.sma50 != null && price > indicators.sma50)
    reasons.push('Precio arriba de SMA 50');
  if (indicators.sma200 != null && price > indicators.sma200)
    reasons.push('Precio arriba de SMA 200');
  if (indicators.macd && indicators.macd.macdLine > indicators.macd.signalLine)
    reasons.push('MACD alcista');
  if (indicators.rsi != null)
    reasons.push(`RSI en ${indicators.rsi.toFixed(0)}`);
  if (indicators.dmi && indicators.dmi.adx > 25)
    reasons.push(`ADX en ${indicators.dmi.adx.toFixed(0)} (tendencia fuerte)`);
  if (indicators.dmi && indicators.dmi.plusDI > indicators.dmi.minusDI)
    reasons.push('DI+ domina sobre DI-');
  if (indicators.volume.relative > 1.2)
    reasons.push(`Volumen ${indicators.volume.relative.toFixed(1)}x promedio`);
  if (indicators.stochastic && indicators.stochastic.k > indicators.stochastic.d)
    reasons.push('Estocastico alcista');
  return reasons;
}

function getExitReasons(
  indicators: TechnicalIndicators,
  price: number
): string[] {
  const reasons: string[] = [];
  if (indicators.sma50 != null && price < indicators.sma50)
    reasons.push('Precio debajo de SMA 50');
  if (indicators.macd && indicators.macd.macdLine < indicators.macd.signalLine)
    reasons.push('MACD bajista');
  if (indicators.rsi != null && indicators.rsi < 45)
    reasons.push(`RSI cayo a ${indicators.rsi.toFixed(0)}`);
  if (indicators.dmi && indicators.dmi.minusDI > indicators.dmi.plusDI)
    reasons.push('DI- supero a DI+');
  if (indicators.dmi && indicators.dmi.adx < 20)
    reasons.push('ADX debil (sin tendencia)');
  if (indicators.support > 0 && price < indicators.support)
    reasons.push('Perdida de soporte');
  if (indicators.stochastic && indicators.stochastic.k < indicators.stochastic.d)
    reasons.push('Estocastico bajista');
  return reasons;
}

function daysBetween(d1: string, d2: string): number {
  return Math.round(
    (new Date(d2).getTime() - new Date(d1).getTime()) / 86400000
  );
}

function generateDiagnostic(result: Omit<BacktestResult, 'diagnostic'>): string {
  const parts: string[] = [];

  // Performance vs benchmark
  if (result.alpha > 0) {
    parts.push(
      `La estrategia obtuvo un retorno de ${result.strategyReturn >= 0 ? '+' : ''}${result.strategyReturn.toFixed(2)}% frente a ${result.buyAndHoldReturn >= 0 ? '+' : ''}${result.buyAndHoldReturn.toFixed(2)}% de buy & hold, superandolo por ${result.alpha.toFixed(2)} puntos porcentuales.`
    );
  } else if (result.alpha < 0) {
    parts.push(
      `La estrategia retorno ${result.strategyReturn >= 0 ? '+' : ''}${result.strategyReturn.toFixed(2)}% mientras que buy & hold rindio ${result.buyAndHoldReturn >= 0 ? '+' : ''}${result.buyAndHoldReturn.toFixed(2)}%. El benchmark supero a la estrategia por ${Math.abs(result.alpha).toFixed(2)} puntos porcentuales.`
    );
  } else {
    parts.push(
      `La estrategia igualo el rendimiento del buy & hold con ${result.strategyReturn >= 0 ? '+' : ''}${result.strategyReturn.toFixed(2)}%.`
    );
  }

  // Sample size
  if (result.closedTrades < 3) {
    parts.push(
      `Sin embargo, el resultado se basa en solo ${result.closedTrades} trade${result.closedTrades !== 1 ? 's' : ''} cerrado${result.closedTrades !== 1 ? 's' : ''}, por lo que la muestra todavia es reducida para sacar conclusiones firmes.`
    );
  } else if (result.closedTrades < 10) {
    parts.push(
      `Se realizaron ${result.closedTrades} trades cerrados, una muestra moderada que permite observar tendencias pero no es estadisticamente robusta.`
    );
  } else {
    parts.push(
      `Con ${result.closedTrades} trades cerrados, la muestra es razonable para evaluar el comportamiento de la estrategia.`
    );
  }

  // Win rate
  if (result.closedTrades > 0) {
    parts.push(
      `El win rate fue ${result.winRate}% (${result.winners} ganador${result.winners !== 1 ? 'es' : ''}, ${result.losers} perdedor${result.losers !== 1 ? 'es' : ''}).`
    );
  }

  // Drawdown
  if (result.maxDrawdown < -15) {
    parts.push(
      `El max drawdown de ${result.maxDrawdown.toFixed(1)}% indica que la estrategia tuvo momentos de caida significativa — importante para evaluar la tolerancia al riesgo.`
    );
  } else if (result.maxDrawdown < -5) {
    parts.push(
      `El max drawdown fue moderado (${result.maxDrawdown.toFixed(1)}%).`
    );
  }

  // Open position
  const openTrade = result.trades.find((t) => t.status === 'open');
  if (openTrade) {
    parts.push(
      `Actualmente hay una posicion abierta desde ${openTrade.entryDate} con un retorno parcial de ${openTrade.returnPct >= 0 ? '+' : ''}${openTrade.returnPct.toFixed(2)}%.`
    );
  }

  // Caveat
  parts.push(
    'Esta simulacion no contempla comisiones, spread, slippage ni diferencias de liquidez del CEDEAR.'
  );

  return parts.join(' ');
}

// --- Main backtest ---

export function runBacktest(candles: Candle[]): BacktestResult | null {
  if (candles.length < 210) return null;

  const startIdx = 200;
  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];
  let tradeId = 0;

  let inPosition = false;
  let entryPrice = 0;
  let entryDate = '';
  let entryScore = 0;
  let entryReasons: string[] = [];

  let capital = 100;
  const buyAndHoldStart = candles[startIdx].close;
  let peakCapital = capital;
  let maxDrawdown = 0;

  // Evaluate every 5 trading days
  for (let i = startIdx; i < candles.length; i += 5) {
    const slice = candles.slice(0, i + 1);
    const { latest: indicators } = computeIndicators(slice);
    const price = candles[i].close;
    const prevClose = i > 0 ? candles[i - 1].close : price;
    const score = computeScore(price, indicators, prevClose);

    // Update equity
    const strategyValue = inPosition
      ? capital * (price / entryPrice)
      : capital;
    const bhValue = (100 * price) / buyAndHoldStart;

    equityCurve.push({
      date: candles[i].date,
      strategy: Math.round(strategyValue * 100) / 100,
      buyAndHold: Math.round(bhValue * 100) / 100,
    });

    // Track drawdown
    if (strategyValue > peakCapital) peakCapital = strategyValue;
    const dd =
      peakCapital > 0
        ? ((strategyValue - peakCapital) / peakCapital) * 100
        : 0;
    if (dd < maxDrawdown) maxDrawdown = dd;

    // Entry
    if (!inPosition && score.total >= 65) {
      inPosition = true;
      entryPrice = price;
      entryDate = candles[i].date;
      entryScore = score.total;
      entryReasons = getEntryReasons(indicators, price);
    }
    // Exit
    else if (inPosition && score.total < 40) {
      tradeId++;
      const returnPct = ((price - entryPrice) / entryPrice) * 100;
      capital = capital * (price / entryPrice);

      trades.push({
        id: tradeId,
        entryDate,
        entryPrice,
        entryScore,
        entryReasons,
        exitDate: candles[i].date,
        exitPrice: price,
        exitScore: score.total,
        exitReasons: getExitReasons(indicators, price),
        status: 'closed',
        returnPct: Math.round(returnPct * 100) / 100,
        holdingDays: daysBetween(entryDate, candles[i].date),
      });

      inPosition = false;
      peakCapital = capital;
    }
  }

  // Open position
  if (inPosition) {
    tradeId++;
    const lastPrice = candles[candles.length - 1].close;
    const returnPct = ((lastPrice - entryPrice) / entryPrice) * 100;
    trades.push({
      id: tradeId,
      entryDate,
      entryPrice,
      entryScore,
      entryReasons,
      exitDate: null,
      exitPrice: null,
      exitScore: null,
      exitReasons: [],
      status: 'open',
      returnPct: Math.round(returnPct * 100) / 100,
      holdingDays: daysBetween(entryDate, candles[candles.length - 1].date),
    });
  }

  // Calculate KPIs
  const closedTrades = trades.filter((t) => t.status === 'closed');
  const winners = closedTrades.filter((t) => t.returnPct > 0);
  const losers = closedTrades.filter((t) => t.returnPct <= 0);

  const totalGains = winners.reduce((s, t) => s + t.returnPct, 0);
  const totalLosses = Math.abs(losers.reduce((s, t) => s + t.returnPct, 0));

  const finalCapital = inPosition
    ? capital * (candles[candles.length - 1].close / entryPrice)
    : capital;
  const strategyReturn =
    Math.round(((finalCapital - 100) / 100) * 10000) / 100;
  const buyAndHoldReturn =
    Math.round(
      ((candles[candles.length - 1].close - buyAndHoldStart) /
        buyAndHoldStart) *
        10000
    ) / 100;

  const partial: Omit<BacktestResult, 'diagnostic'> = {
    strategyReturn,
    buyAndHoldReturn,
    alpha: Math.round((strategyReturn - buyAndHoldReturn) * 100) / 100,
    closedTrades: closedTrades.length,
    winners: winners.length,
    losers: losers.length,
    winRate:
      closedTrades.length > 0
        ? Math.round((winners.length / closedTrades.length) * 100)
        : 0,
    profitFactor: totalLosses > 0 ? Math.round((totalGains / totalLosses) * 100) / 100 : totalGains > 0 ? 999 : 0,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    avgReturnPerTrade:
      closedTrades.length > 0
        ? Math.round(
            (closedTrades.reduce((s, t) => s + t.returnPct, 0) /
              closedTrades.length) *
              100
          ) / 100
        : 0,
    trades,
    equityCurve,
    periodStart: candles[startIdx].date,
    periodEnd: candles[candles.length - 1].date,
  };

  return {
    ...partial,
    diagnostic: generateDiagnostic(partial),
  };
}
