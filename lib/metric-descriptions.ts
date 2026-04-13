export interface MetricDescription {
  name: string;
  shortDesc: string;
  detail: string;
  interpretation: string;
  bullish: string;
  bearish: string;
}

export const METRIC_DESCRIPTIONS: Record<string, MetricDescription> = {
  sma20: {
    name: 'SMA 20',
    shortDesc: 'Media movil simple de 20 ruedas',
    detail:
      'Promedio de los precios de cierre de las ultimas 20 ruedas. Refleja la tendencia de corto plazo. Es el indicador mas rapido para detectar cambios de direccion.',
    interpretation:
      'Si el precio esta por encima de la SMA 20, la tendencia de corto plazo es alcista. Si esta por debajo, es bajista.',
    bullish: 'Precio por encima de SMA 20',
    bearish: 'Precio por debajo de SMA 20',
  },
  sma50: {
    name: 'SMA 50',
    shortDesc: 'Media movil simple de 50 ruedas',
    detail:
      'Promedio de los precios de cierre de las ultimas 50 ruedas. Representa la tendencia de mediano plazo y es una referencia clave para traders.',
    interpretation:
      'Cuando la SMA 20 cruza por encima de la SMA 50 se llama "cruce dorado" (senal alcista). Cuando cruza por debajo, es un "cruce de la muerte" (senal bajista).',
    bullish: 'Precio y SMA 20 por encima de SMA 50',
    bearish: 'Precio y SMA 20 por debajo de SMA 50',
  },
  sma200: {
    name: 'SMA 200',
    shortDesc: 'Media movil simple de 200 ruedas',
    detail:
      'Promedio de los precios de cierre de las ultimas 200 ruedas (~10 meses). Es el indicador de tendencia de largo plazo mas respetado del mercado.',
    interpretation:
      'Funciona como un filtro de fondo: si el precio esta por encima de la SMA 200, el sesgo general es alcista. Los inversores institucionales la usan como referencia principal.',
    bullish: 'Precio por encima de SMA 200 (sesgo alcista de fondo)',
    bearish: 'Precio por debajo de SMA 200 (sesgo bajista de fondo)',
  },
  rsi: {
    name: 'RSI (14)',
    shortDesc: 'Indice de Fuerza Relativa',
    detail:
      'Mide la velocidad y magnitud de los cambios de precio en una escala de 0 a 100. Usa 14 periodos por defecto. Creado por J. Welles Wilder.',
    interpretation:
      'RSI > 70 indica sobrecompra (el activo puede estar caro). RSI < 30 indica sobreventa (el activo puede estar barato). La zona 40-60 es neutral.',
    bullish: 'RSI entre 50 y 70 (momentum alcista saludable)',
    bearish: 'RSI < 30 (sobreventa) o RSI > 70 (sobrecompra, riesgo de correccion)',
  },
  macd: {
    name: 'MACD (12, 26, 9)',
    shortDesc: 'Convergencia/Divergencia de Medias Moviles',
    detail:
      'Calcula la diferencia entre dos EMAs (rapida de 12 y lenta de 26 periodos). La linea de senal es una EMA de 9 periodos del MACD. El histograma muestra la diferencia entre ambos.',
    interpretation:
      'Cuando la linea MACD cruza por encima de la senal, es una senal de compra. Cuando cruza por debajo, es senal de venta. El histograma positivo y creciente confirma momentum alcista.',
    bullish: 'MACD por encima de la linea de senal, histograma positivo',
    bearish: 'MACD por debajo de la linea de senal, histograma negativo',
  },
  adx: {
    name: 'ADX',
    shortDesc: 'Indice Direccional Promedio',
    detail:
      'Mide la fuerza de una tendencia, sin importar la direccion (alcista o bajista). Va de 0 a 100. No indica si la tendencia es alcista o bajista, solo si es fuerte o debil.',
    interpretation:
      'ADX > 25 indica una tendencia fuerte. ADX < 20 indica lateralidad o ausencia de tendencia. ADX creciente = la tendencia se fortalece.',
    bullish: 'ADX > 25 (tendencia definida y operable)',
    bearish: 'ADX < 20 (mercado lateral, senales poco confiables)',
  },
  dmi: {
    name: 'DMI (+DI / -DI)',
    shortDesc: 'Indice de Movimiento Direccional',
    detail:
      'Compuesto por dos lineas: +DI (presion compradora) y -DI (presion vendedora). Se usan junto con el ADX para determinar la direccion y fuerza de la tendencia.',
    interpretation:
      'Cuando +DI > -DI, los compradores dominan. Cuando -DI > +DI, los vendedores dominan. Los cruces entre ambas lineas generan senales de entrada/salida.',
    bullish: '+DI por encima de -DI (presion compradora dominante)',
    bearish: '-DI por encima de +DI (presion vendedora dominante)',
  },
  volume: {
    name: 'Volumen Relativo',
    shortDesc: 'Volumen actual vs promedio de 20 ruedas',
    detail:
      'Compara el volumen operado del dia contra el promedio de las ultimas 20 ruedas. Un volumen relativo > 1 significa que se opera mas de lo normal.',
    interpretation:
      'El volumen valida los movimientos de precio. Una suba con volumen alto es mas confiable que una suba con volumen bajo. Volumen alto en caida confirma presion vendedora.',
    bullish: 'Volumen relativo > 1.2 acompanando suba de precio',
    bearish: 'Volumen alto en caida, o suba sin volumen',
  },
  support: {
    name: 'Soporte',
    shortDesc: 'Nivel de precio donde tiende a frenar la caida',
    detail:
      'Calculado como el minimo de las ultimas 20 ruedas. Es un nivel donde historicamente aparecen compradores y el precio rebota.',
    interpretation:
      'Cuando el precio se acerca al soporte, puede ser una oportunidad de compra si hay otros indicadores favorables. Si rompe el soporte, la caida puede acelerarse.',
    bullish: 'Precio cerca del soporte (zona de compra potencial)',
    bearish: 'Precio rompe soporte (senal de debilidad)',
  },
  resistance: {
    name: 'Resistencia',
    shortDesc: 'Nivel de precio donde tiende a frenar la suba',
    detail:
      'Calculado como el maximo de las ultimas 20 ruedas. Es un nivel donde historicamente aparecen vendedores y el precio se frena.',
    interpretation:
      'Si el precio rompe la resistencia con volumen, es una senal muy alcista (breakout). Si no puede superarla, puede corregir.',
    bullish: 'Precio rompe resistencia con volumen (breakout)',
    bearish: 'Precio rechazado en resistencia',
  },
  bollinger: {
    name: 'Bollinger Bands',
    shortDesc: 'Bandas de volatilidad alrededor de la SMA 20',
    detail:
      'Tres lineas: banda superior (SMA20 + 2 desvios), media (SMA20) y banda inferior (SMA20 - 2 desvios). Miden volatilidad y extremos de precio. El %B indica donde esta el precio respecto a las bandas (0% = banda inferior, 100% = banda superior).',
    interpretation:
      'Precio cerca de la banda superior puede indicar sobreextension. Precio cerca de la inferior puede ser oportunidad. Bandas estrechas (compresion) anticipan un movimiento fuerte. Bandas anchas indican alta volatilidad.',
    bullish: 'Precio rebota desde la banda inferior o rompe la superior con volumen',
    bearish: 'Precio rechazado en banda superior o rompe la inferior',
  },
  atr: {
    name: 'ATR (14)',
    shortDesc: 'Rango Verdadero Promedio — mide volatilidad',
    detail:
      'Calcula el promedio del rango verdadero (mayor entre: alto-bajo, |alto-cierre anterior|, |bajo-cierre anterior|) de los ultimos 14 periodos. No indica direccion, solo cuanto se mueve el precio.',
    interpretation:
      'ATR alto = alta volatilidad (mas riesgo pero mas oportunidad). ATR bajo = baja volatilidad (menos riesgo, movimientos chicos). Util para calcular stop loss: un stop de 1-2 ATR es comun.',
    bullish: 'ATR moderado que permite operar con stop loss controlado',
    bearish: 'ATR muy alto indica mercado erratico y dificil de operar',
  },
  stochastic: {
    name: 'Estocastico (14, 3)',
    shortDesc: 'Oscilador de momentum — compara cierre vs rango',
    detail:
      'Compara el precio de cierre actual con el rango alto-bajo de los ultimos 14 periodos. %K es la linea rapida, %D es la SMA de 3 periodos de %K. Escala de 0 a 100.',
    interpretation:
      '%K > 80 = sobrecompra. %K < 20 = sobreventa. Cruce de %K por encima de %D es senal de compra. Cruce por debajo es senal de venta. Funciona mejor en mercados laterales.',
    bullish: '%K cruza por encima de %D desde zona de sobreventa (<20)',
    bearish: '%K cruza por debajo de %D desde zona de sobrecompra (>80)',
  },
};

export function getMetricDescription(key: string): MetricDescription | null {
  return METRIC_DESCRIPTIONS[key] ?? null;
}
