import { TechnicalIndicators, ScoreBreakdown, Recommendation } from './types';

export function generateSummary(
  ticker: string,
  price: number,
  indicators: TechnicalIndicators,
  score: ScoreBreakdown,
  recommendation: Recommendation
): string {
  const reasons: string[] = [];
  const warnings: string[] = [];

  // Tendencia
  if (indicators.sma200 != null) {
    if (price > indicators.sma200) {
      reasons.push('cotiza por encima de la media de 200 ruedas (tendencia alcista de fondo)');
    } else {
      warnings.push('cotiza por debajo de la media de 200 ruedas');
    }
  }

  if (indicators.sma20 != null && indicators.sma50 != null) {
    if (indicators.sma20 > indicators.sma50) {
      reasons.push('la media de 20 esta por encima de la de 50 (cruce alcista)');
    } else {
      warnings.push('la media de 20 esta por debajo de la de 50');
    }
  }

  // MACD
  if (indicators.macd) {
    if (indicators.macd.macdLine > indicators.macd.signalLine) {
      reasons.push('el MACD muestra senal alcista');
    } else {
      warnings.push('el MACD muestra senal bajista');
    }
    if (indicators.macd.histogram > 0) {
      reasons.push('el histograma MACD es positivo');
    }
  }

  // RSI
  if (indicators.rsi != null) {
    if (indicators.rsi >= 50 && indicators.rsi <= 70) {
      reasons.push(`el RSI esta en zona saludable (${indicators.rsi.toFixed(1)})`);
    } else if (indicators.rsi > 70) {
      warnings.push(`el RSI indica sobrecompra (${indicators.rsi.toFixed(1)})`);
    } else if (indicators.rsi < 30) {
      warnings.push(`el RSI indica sobreventa (${indicators.rsi.toFixed(1)})`);
    } else if (indicators.rsi >= 40 && indicators.rsi < 50) {
      warnings.push(`el RSI esta en zona neutral-baja (${indicators.rsi.toFixed(1)})`);
    }
  }

  // ADX / DMI
  if (indicators.dmi) {
    if (indicators.dmi.adx > 25) {
      reasons.push(`el ADX muestra fuerza de tendencia (${indicators.dmi.adx.toFixed(1)})`);
    } else {
      warnings.push(`el ADX indica tendencia debil (${indicators.dmi.adx.toFixed(1)})`);
    }
    if (indicators.dmi.plusDI > indicators.dmi.minusDI) {
      reasons.push('el DMI+ domina sobre el DMI- (presion compradora)');
    } else {
      warnings.push('el DMI- domina sobre el DMI+ (presion vendedora)');
    }
  }

  // Volumen
  if (indicators.volume.relative > 1.2) {
    reasons.push('el volumen acompana el movimiento');
  } else if (indicators.volume.relative < 0.6) {
    warnings.push('el volumen es bajo respecto al promedio');
  }

  // Soporte/Resistencia
  const distToSupport = price > 0 ? (price - indicators.support) / price : 0;
  if (distToSupport < 0.03) {
    reasons.push('el precio esta cerca del soporte (zona de compra potencial)');
  }
  if (price > indicators.resistance) {
    reasons.push('rompio la resistencia reciente');
  }

  // Construir resumen
  let summary = '';
  const tickerClean = ticker.replace('.BA', '');

  switch (recommendation) {
    case 'Compra Fuerte':
      summary = `Compra Fuerte para ${tickerClean}. `;
      summary += `El analisis tecnico muestra una oportunidad muy favorable: ${reasons.slice(0, 4).join(', ')}. `;
      break;
    case 'Comprar':
      summary = `Comprar ${tickerClean}. `;
      summary += `Las senales tecnicas son positivas: ${reasons.slice(0, 3).join(', ')}. `;
      break;
    case 'Mantener':
      summary = `Mantener ${tickerClean}. `;
      summary += `Las senales son mixtas. `;
      if (reasons.length > 0) summary += `A favor: ${reasons.slice(0, 2).join(', ')}. `;
      if (warnings.length > 0) summary += `En contra: ${warnings.slice(0, 2).join(', ')}. `;
      break;
    case 'Cautela':
      summary = `Cautela con ${tickerClean}. `;
      summary += `Se observan senales de debilidad: ${warnings.slice(0, 3).join(', ')}. `;
      if (reasons.length > 0) summary += `Aunque ${reasons[0]}. `;
      break;
    case 'Vender':
      summary = `Vender ${tickerClean}. `;
      summary += `Las senales tecnicas son negativas: ${warnings.slice(0, 3).join(', ')}. `;
      break;
  }

  summary += `Score tecnico: ${score.total}/100.`;

  return summary;
}
