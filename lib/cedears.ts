import { CedearInfo } from './types';

export const CEDEAR_LIST: CedearInfo[] = [
  // Tecnologia
  { ticker: 'AAPL.BA', name: 'Apple Inc.', localTicker: 'AAPL', sector: 'Tecnologia', ratio: 10 },
  { ticker: 'MSFT.BA', name: 'Microsoft Corp.', localTicker: 'MSFT', sector: 'Tecnologia', ratio: 5 },
  { ticker: 'GOOGL.BA', name: 'Alphabet Inc.', localTicker: 'GOOGL', sector: 'Tecnologia', ratio: 8 },
  { ticker: 'AMZN.BA', name: 'Amazon.com Inc.', localTicker: 'AMZN', sector: 'Tecnologia', ratio: 12 },
  { ticker: 'META.BA', name: 'Meta Platforms', localTicker: 'META', sector: 'Tecnologia', ratio: 4 },
  { ticker: 'NVDA.BA', name: 'NVIDIA Corp.', localTicker: 'NVDA', sector: 'Semiconductores', ratio: 5 },
  { ticker: 'TSLA.BA', name: 'Tesla Inc.', localTicker: 'TSLA', sector: 'Automotriz', ratio: 5 },
  { ticker: 'AMD.BA', name: 'AMD Inc.', localTicker: 'AMD', sector: 'Semiconductores', ratio: 3 },
  { ticker: 'INTC.BA', name: 'Intel Corp.', localTicker: 'INTC', sector: 'Semiconductores', ratio: 1 },
  { ticker: 'NFLX.BA', name: 'Netflix Inc.', localTicker: 'NFLX', sector: 'Entretenimiento', ratio: 4 },
  { ticker: 'PYPL.BA', name: 'PayPal Holdings', localTicker: 'PYPL', sector: 'Fintech', ratio: 2 },
  { ticker: 'CRM.BA', name: 'Salesforce Inc.', localTicker: 'CRM', sector: 'Tecnologia', ratio: 3 },
  { ticker: 'UBER.BA', name: 'Uber Technologies', localTicker: 'UBER', sector: 'Tecnologia', ratio: 2 },
  { ticker: 'SNAP.BA', name: 'Snap Inc.', localTicker: 'SNAP', sector: 'Tecnologia', ratio: 1 },
  { ticker: 'SPOT.BA', name: 'Spotify Technology', localTicker: 'SPOT', sector: 'Entretenimiento', ratio: 2 },
  // E-Commerce
  { ticker: 'MELI.BA', name: 'MercadoLibre Inc.', localTicker: 'MELI', sector: 'E-Commerce', ratio: 1 },
  { ticker: 'BABA.BA', name: 'Alibaba Group', localTicker: 'BABA', sector: 'E-Commerce', ratio: 2 },
  // Finanzas
  { ticker: 'JPM.BA', name: 'JPMorgan Chase', localTicker: 'JPM', sector: 'Finanzas', ratio: 2 },
  { ticker: 'GS.BA', name: 'Goldman Sachs', localTicker: 'GS', sector: 'Finanzas', ratio: 2 },
  { ticker: 'V.BA', name: 'Visa Inc.', localTicker: 'V', sector: 'Finanzas', ratio: 3 },
  { ticker: 'MA.BA', name: 'Mastercard Inc.', localTicker: 'MA', sector: 'Finanzas', ratio: 3 },
  { ticker: 'BAC.BA', name: 'Bank of America', localTicker: 'BAC', sector: 'Finanzas', ratio: 1 },
  // Argentina
  { ticker: 'GGAL.BA', name: 'Grupo Financiero Galicia', localTicker: 'GGAL', sector: 'Finanzas ARG', ratio: 10 },
  { ticker: 'BBAR.BA', name: 'Banco BBVA Argentina', localTicker: 'BBAR', sector: 'Finanzas ARG', ratio: 3 },
  { ticker: 'YPF.BA', name: 'YPF S.A.', localTicker: 'YPF', sector: 'Energia ARG', ratio: 1 },
  { ticker: 'PAM.BA', name: 'Pampa Energia', localTicker: 'PAM', sector: 'Energia ARG', ratio: 5 },
  { ticker: 'TGS.BA', name: 'Transp. Gas del Sur', localTicker: 'TGS', sector: 'Energia ARG', ratio: 5 },
  // Energia
  { ticker: 'XOM.BA', name: 'Exxon Mobil', localTicker: 'XOM', sector: 'Energia', ratio: 2 },
  { ticker: 'CVX.BA', name: 'Chevron Corp.', localTicker: 'CVX', sector: 'Energia', ratio: 2 },
  // Consumo
  { ticker: 'KO.BA', name: 'Coca-Cola Co.', localTicker: 'KO', sector: 'Consumo', ratio: 1 },
  { ticker: 'PEP.BA', name: 'PepsiCo Inc.', localTicker: 'PEP', sector: 'Consumo', ratio: 2 },
  { ticker: 'WMT.BA', name: 'Walmart Inc.', localTicker: 'WMT', sector: 'Consumo', ratio: 2 },
  { ticker: 'MCD.BA', name: "McDonald's Corp.", localTicker: 'MCD', sector: 'Consumo', ratio: 3 },
  { ticker: 'NKE.BA', name: 'Nike Inc.', localTicker: 'NKE', sector: 'Consumo', ratio: 1 },
  { ticker: 'SBUX.BA', name: 'Starbucks Corp.', localTicker: 'SBUX', sector: 'Consumo', ratio: 1 },
  // Salud
  { ticker: 'JNJ.BA', name: 'Johnson & Johnson', localTicker: 'JNJ', sector: 'Salud', ratio: 2 },
  { ticker: 'PFE.BA', name: 'Pfizer Inc.', localTicker: 'PFE', sector: 'Salud', ratio: 1 },
  { ticker: 'ABBV.BA', name: 'AbbVie Inc.', localTicker: 'ABBV', sector: 'Salud', ratio: 2 },
  // Materiales y Mineria
  { ticker: 'VALE.BA', name: 'Vale S.A.', localTicker: 'VALE', sector: 'Mineria', ratio: 1 },
  { ticker: 'GOLD.BA', name: 'Barrick Gold', localTicker: 'GOLD', sector: 'Mineria', ratio: 1 },
  // Entretenimiento
  { ticker: 'DIS.BA', name: 'Walt Disney Co.', localTicker: 'DIS', sector: 'Entretenimiento', ratio: 2 },
  // Industrial
  { ticker: 'BA.BA', name: 'Boeing Co.', localTicker: 'BA', sector: 'Industrial', ratio: 2 },
  { ticker: 'CAT.BA', name: 'Caterpillar Inc.', localTicker: 'CAT', sector: 'Industrial', ratio: 3 },
  { ticker: 'DE.BA', name: 'Deere & Company', localTicker: 'DE', sector: 'Industrial', ratio: 3 },
  // Telecom
  { ticker: 'T.BA', name: 'AT&T Inc.', localTicker: 'T', sector: 'Telecom', ratio: 1 },
  // ETFs populares como CEDEAR
  { ticker: 'SPY.BA', name: 'SPDR S&P 500 ETF', localTicker: 'SPY', sector: 'ETF', ratio: 4 },
  { ticker: 'QQQ.BA', name: 'Invesco QQQ Trust', localTicker: 'QQQ', sector: 'ETF', ratio: 4 },
  { ticker: 'EEM.BA', name: 'iShares MSCI EM ETF', localTicker: 'EEM', sector: 'ETF', ratio: 1 },
  { ticker: 'XLF.BA', name: 'Financial Select ETF', localTicker: 'XLF', sector: 'ETF', ratio: 1 },
  { ticker: 'ARKK.BA', name: 'ARK Innovation ETF', localTicker: 'ARKK', sector: 'ETF', ratio: 1 },
];

export function findCedear(ticker: string): CedearInfo | undefined {
  const normalized = ticker.toUpperCase();
  return CEDEAR_LIST.find(
    (c) => c.ticker === normalized || c.localTicker === normalized
  );
}
