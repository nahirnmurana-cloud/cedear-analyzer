export interface CedearInfo {
  ticker: string;
  name: string;
  localTicker: string;
  sector: string;
  ratio: number;
}

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  ema20: number | null;
  ema50: number | null;
  ema200: number | null;
  rsi: number | null;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  } | null;
  dmi: {
    plusDI: number;
    minusDI: number;
    adx: number;
  } | null;
  volume: {
    current: number;
    avg20: number;
    relative: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
    percentB: number;
  } | null;
  atr: number | null;
  stochastic: {
    k: number;
    d: number;
  } | null;
  support: number;
  resistance: number;
  support50: number;
  resistance50: number;
}

export interface IndicatorSeries {
  dates: string[];
  close: number[];
  sma20: (number | null)[];
  sma50: (number | null)[];
  sma200: (number | null)[];
  rsi: (number | null)[];
  macdLine: (number | null)[];
  macdSignal: (number | null)[];
  macdHistogram: (number | null)[];
  plusDI: (number | null)[];
  minusDI: (number | null)[];
  adx: (number | null)[];
  volume: number[];
  bollingerUpper: (number | null)[];
  bollingerLower: (number | null)[];
  atr: (number | null)[];
  stochasticK: (number | null)[];
  stochasticD: (number | null)[];
}

export interface ScoreBreakdown {
  trend: number;
  momentum: number;
  trendStrength: number;
  volume: number;
  volatility: number;
  supportResistance: number;
  total: number;
}

// Score de oportunidad: factores conceptuales (cada uno 0-100, luego ponderados)
export interface OpportunityScore {
  momentum: number;            // Cambio de direccion del momentum
  trendFormation: number;      // Inicio de tendencia alcista
  entryTiming: number;         // Que tan temprano estas (early vs late)
  volumeConfirmation: number;  // Volumen acompanando la suba
  riskReward: number;          // Relacion riesgo/recompensa
  setupQuality: number;        // Calidad general del setup (evitar falsos positivos)
  total: number;               // Score ponderado final 0-100
  explanation: string[];       // Razones principales
  warnings: string[];          // Advertencias
}

export type Recommendation =
  | 'Compra Fuerte'
  | 'Comprar'
  | 'Mantener'
  | 'Cautela'
  | 'Vender';

export interface CedearAnalysis {
  info: CedearInfo;
  currentPrice: number;
  previousClose: number;
  change: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  candles: Candle[];
  indicators: TechnicalIndicators;
  indicatorSeries: IndicatorSeries;
  score: ScoreBreakdown;
  opportunityScore: OpportunityScore;
  recommendation: Recommendation;
  summary: string;
  lastUpdated: string;
}

export interface CedearQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  volume: number;
}
