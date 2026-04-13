'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { IndicatorSeries } from '@/lib/types';

function formatDate(d: string) {
  return d.slice(5);
}

function ChartHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-2">
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function ChartExplanation({
  detail,
  interpretation,
  signal,
  signalType,
}: {
  detail: string;
  interpretation: string;
  signal: string | null;
  signalType: 'bullish' | 'bearish' | 'neutral';
}) {
  const signalColors = {
    bullish:
      'bg-green-500/8 border-green-500/20 text-green-700 dark:text-green-400',
    bearish:
      'bg-red-500/8 border-red-500/20 text-red-700 dark:text-red-400',
    neutral:
      'bg-muted/50 border-muted text-muted-foreground',
  };
  const signalLabel = {
    bullish: 'Senal alcista',
    bearish: 'Senal bajista',
    neutral: 'Senal neutral',
  };

  return (
    <div className="mt-3 space-y-2 text-xs">
      <p className="text-muted-foreground leading-relaxed">{detail}</p>
      <div className="bg-muted/30 rounded-md px-2.5 py-2">
        <span className="font-medium text-foreground/80">Interpretacion: </span>
        <span className="text-muted-foreground">{interpretation}</span>
      </div>
      {signal && (
        <div
          className={`rounded-md px-2.5 py-1.5 border ${signalColors[signalType]}`}
        >
          <span className="font-medium">{signalLabel[signalType]}: </span>
          {signal}
        </div>
      )}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
};

// ─── RSI ─────────────────────────────────────────────

export function RsiChart({ series }: { series: IndicatorSeries }) {
  const data = series.dates.map((d, i) => ({
    date: formatDate(d),
    rsi: series.rsi[i],
  }));

  const lastRsi = series.rsi.filter((v) => v != null).pop();

  let signalText: string | null = null;
  let signalType: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (lastRsi != null) {
    if (lastRsi > 70) {
      signalText = `RSI en ${lastRsi.toFixed(1)} — sobrecompra, el activo puede estar caro y hay riesgo de correccion`;
      signalType = 'bearish';
    } else if (lastRsi < 30) {
      signalText = `RSI en ${lastRsi.toFixed(1)} — sobreventa, el activo puede estar barato (oportunidad si otros indicadores acompanan)`;
      signalType = 'bullish';
    } else if (lastRsi >= 50 && lastRsi <= 70) {
      signalText = `RSI en ${lastRsi.toFixed(1)} — zona de momentum alcista saludable`;
      signalType = 'bullish';
    } else if (lastRsi >= 40) {
      signalText = `RSI en ${lastRsi.toFixed(1)} — zona neutral, sin fuerza definida`;
      signalType = 'neutral';
    } else {
      signalText = `RSI en ${lastRsi.toFixed(1)} — zona neutral-baja, debilidad`;
      signalType = 'bearish';
    }
  }

  return (
    <div>
      <ChartHeader
        title={`RSI (14) ${lastRsi != null ? `— ${lastRsi.toFixed(1)}` : ''}`}
        subtitle="Indice de Fuerza Relativa"
      />
      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={35} />
          <Tooltip contentStyle={tooltipStyle} />
          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '70', position: 'right', fontSize: 9 }} />
          <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" label={{ value: '30', position: 'right', fontSize: 9 }} />
          <ReferenceLine y={50} stroke="#9ca3af" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="rsi" stroke="#8b5cf6" dot={false} strokeWidth={1.5} name="RSI" />
        </ComposedChart>
      </ResponsiveContainer>
      <ChartExplanation
        detail="Mide la velocidad y magnitud de los cambios de precio en una escala de 0 a 100. Usa 14 periodos por defecto. Creado por J. Welles Wilder."
        interpretation="RSI > 70 indica sobrecompra (el activo puede estar caro). RSI < 30 indica sobreventa (el activo puede estar barato). La zona 40-60 es neutral."
        signal={signalText}
        signalType={signalType}
      />
    </div>
  );
}

// ─── MACD ────────────────────────────────────────────

export function MacdChart({ series }: { series: IndicatorSeries }) {
  const data = series.dates.map((d, i) => ({
    date: formatDate(d),
    macd: series.macdLine[i],
    signal: series.macdSignal[i],
    histogram: series.macdHistogram[i],
  }));

  const lastMacd = series.macdLine.filter((v) => v != null).pop();
  const lastSignal = series.macdSignal.filter((v) => v != null).pop();
  const lastHist = series.macdHistogram.filter((v) => v != null).pop();
  const isBullish = lastMacd != null && lastSignal != null && lastMacd > lastSignal;

  let signalText: string | null = null;
  let signalType: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (lastMacd != null && lastSignal != null) {
    if (isBullish && lastHist != null && lastHist > 0) {
      signalText = `MACD por encima de la senal con histograma positivo — momentum alcista activo`;
      signalType = 'bullish';
    } else if (isBullish) {
      signalText = `MACD cruzo por encima de la senal — senal de compra reciente`;
      signalType = 'bullish';
    } else if (lastHist != null && lastHist < 0) {
      signalText = `MACD por debajo de la senal con histograma negativo — momentum bajista`;
      signalType = 'bearish';
    } else {
      signalText = `MACD por debajo de la senal — presion vendedora`;
      signalType = 'bearish';
    }
  }

  return (
    <div>
      <ChartHeader
        title="MACD (12, 26, 9)"
        subtitle="Convergencia/Divergencia de Medias Moviles"
      />
      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} width={50} />
          <Tooltip contentStyle={tooltipStyle} />
          <ReferenceLine y={0} stroke="#9ca3af" />
          <Bar dataKey="histogram" fill="#3b82f6" opacity={0.25} name="Histograma" />
          <Line type="monotone" dataKey="macd" stroke="#3b82f6" dot={false} strokeWidth={1.5} name="MACD" />
          <Line type="monotone" dataKey="signal" stroke="#f97316" dot={false} strokeWidth={1.5} name="Senal" />
        </ComposedChart>
      </ResponsiveContainer>
      <ChartExplanation
        detail="Calcula la diferencia entre dos EMAs (rapida de 12 y lenta de 26 periodos). La linea de senal es una EMA de 9 del MACD. El histograma muestra la diferencia entre ambos."
        interpretation="Cuando la linea MACD cruza por encima de la senal, es senal de compra. Cuando cruza por debajo, es senal de venta. El histograma positivo y creciente confirma momentum alcista."
        signal={signalText}
        signalType={signalType}
      />
    </div>
  );
}

// ─── VOLUMEN ─────────────────────────────────────────

export function VolumeChart({ series }: { series: IndicatorSeries }) {
  const data = series.dates.map((d, i) => ({
    date: formatDate(d),
    volume: series.volume[i],
  }));

  const lastVol = series.volume[series.volume.length - 1];
  const recentAvg =
    series.volume.length >= 20
      ? series.volume.slice(-20).reduce((a, b) => a + b, 0) / 20
      : lastVol;
  const relVol = recentAvg > 0 ? lastVol / recentAvg : 1;

  let signalText: string | null = null;
  let signalType: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (relVol > 1.5) {
    signalText = `Volumen relativo ${relVol.toFixed(2)}x — actividad muy por encima del promedio, valida el movimiento actual`;
    signalType = 'bullish';
  } else if (relVol > 1.0) {
    signalText = `Volumen relativo ${relVol.toFixed(2)}x — actividad ligeramente superior al promedio`;
    signalType = 'bullish';
  } else if (relVol < 0.5) {
    signalText = `Volumen relativo ${relVol.toFixed(2)}x — actividad muy baja, el movimiento de precio puede no ser confiable`;
    signalType = 'bearish';
  } else {
    signalText = `Volumen relativo ${relVol.toFixed(2)}x — actividad normal`;
    signalType = 'neutral';
  }

  return (
    <div>
      <ChartHeader
        title="Volumen"
        subtitle="Cantidad operada por rueda"
      />
      <ResponsiveContainer width="100%" height={130}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis
            tick={{ fontSize: 10 }}
            width={50}
            tickFormatter={(v) =>
              v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`
            }
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [Number(value).toLocaleString('es-AR'), 'Volumen']} />
          <Bar dataKey="volume" fill="#6366f1" opacity={0.5} name="Volumen" />
        </ComposedChart>
      </ResponsiveContainer>
      <ChartExplanation
        detail="Compara el volumen operado del dia contra el promedio de las ultimas 20 ruedas. El volumen valida los movimientos de precio: una suba con volumen alto es mas confiable que sin el."
        interpretation="Volumen alto en suba confirma interes comprador. Volumen alto en caida confirma presion vendedora. Suba sin volumen puede ser falsa senal."
        signal={signalText}
        signalType={signalType}
      />
    </div>
  );
}

// ─── DMI / ADX ───────────────────────────────────────

export function DmiChart({ series }: { series: IndicatorSeries }) {
  const data = series.dates.map((d, i) => ({
    date: formatDate(d),
    plusDI: series.plusDI[i],
    minusDI: series.minusDI[i],
    adx: series.adx[i],
  }));

  const lastAdx = series.adx.filter((v) => v != null).pop();
  const lastPlusDI = series.plusDI.filter((v) => v != null).pop();
  const lastMinusDI = series.minusDI.filter((v) => v != null).pop();

  let signalText: string | null = null;
  let signalType: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (lastAdx != null && lastPlusDI != null && lastMinusDI != null) {
    const strong = lastAdx > 25;
    const buyersDominate = lastPlusDI > lastMinusDI;

    if (strong && buyersDominate) {
      signalText = `ADX ${lastAdx.toFixed(1)} con DI+ (${lastPlusDI.toFixed(1)}) dominando — tendencia alcista fuerte`;
      signalType = 'bullish';
    } else if (strong && !buyersDominate) {
      signalText = `ADX ${lastAdx.toFixed(1)} con DI- (${lastMinusDI.toFixed(1)}) dominando — tendencia bajista fuerte`;
      signalType = 'bearish';
    } else if (!strong && buyersDominate) {
      signalText = `ADX ${lastAdx.toFixed(1)} debil pero DI+ domina — leve sesgo alcista, tendencia sin fuerza`;
      signalType = 'neutral';
    } else {
      signalText = `ADX ${lastAdx.toFixed(1)} debil con DI- dominando — lateralidad con leve presion vendedora`;
      signalType = 'bearish';
    }
  }

  return (
    <div>
      <ChartHeader
        title={`DMI / ADX ${lastAdx != null ? `— ${lastAdx.toFixed(1)}` : ''}`}
        subtitle="Indice de Movimiento Direccional"
      />
      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} width={35} />
          <Tooltip contentStyle={tooltipStyle} />
          <ReferenceLine y={25} stroke="#9ca3af" strokeDasharray="3 3" label={{ value: '25', position: 'right', fontSize: 9 }} />
          <Line type="monotone" dataKey="plusDI" stroke="#22c55e" dot={false} strokeWidth={1.5} name="DI+" />
          <Line type="monotone" dataKey="minusDI" stroke="#ef4444" dot={false} strokeWidth={1.5} name="DI-" />
          <Line type="monotone" dataKey="adx" stroke="#f59e0b" dot={false} strokeWidth={2} name="ADX" />
        </ComposedChart>
      </ResponsiveContainer>
      <ChartExplanation
        detail="Compuesto por DI+ (presion compradora), DI- (presion vendedora) y ADX (fuerza de tendencia). ADX no indica direccion, solo intensidad."
        interpretation="ADX > 25 = tendencia fuerte y operable. ADX < 20 = mercado lateral, senales poco confiables. DI+ > DI- = compradores dominan. DI- > DI+ = vendedores dominan."
        signal={signalText}
        signalType={signalType}
      />
    </div>
  );
}

// ─── STOCHASTIC ──────────────────────────────────────

export function StochasticChart({ series }: { series: IndicatorSeries }) {
  const data = series.dates.map((d, i) => ({
    date: formatDate(d),
    k: series.stochasticK[i],
    d: series.stochasticD[i],
  }));

  const lastK = series.stochasticK.filter((v) => v != null).pop();
  const lastD = series.stochasticD.filter((v) => v != null).pop();

  let signalText: string | null = null;
  let signalType: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (lastK != null && lastD != null) {
    if (lastK > 80 && lastK < lastD) {
      signalText = `%K ${lastK.toFixed(1)} cruzando %D a la baja desde sobrecompra — posible senal de venta`;
      signalType = 'bearish';
    } else if (lastK < 20 && lastK > lastD) {
      signalText = `%K ${lastK.toFixed(1)} cruzando %D al alza desde sobreventa — posible senal de compra`;
      signalType = 'bullish';
    } else if (lastK > 80) {
      signalText = `%K ${lastK.toFixed(1)} en zona de sobrecompra`;
      signalType = 'bearish';
    } else if (lastK < 20) {
      signalText = `%K ${lastK.toFixed(1)} en zona de sobreventa`;
      signalType = 'bullish';
    } else if (lastK > lastD) {
      signalText = `%K ${lastK.toFixed(1)} por encima de %D — momentum positivo`;
      signalType = 'bullish';
    } else {
      signalText = `%K ${lastK.toFixed(1)} por debajo de %D — momentum negativo`;
      signalType = 'bearish';
    }
  }

  return (
    <div>
      <ChartHeader
        title={`Estocastico (14, 3) ${lastK != null ? `— %K ${lastK.toFixed(1)}` : ''}`}
        subtitle="Oscilador de momentum"
      />
      <ResponsiveContainer width="100%" height={150}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} width={35} />
          <Tooltip contentStyle={tooltipStyle} />
          <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '80', position: 'right', fontSize: 9 }} />
          <ReferenceLine y={20} stroke="#22c55e" strokeDasharray="3 3" label={{ value: '20', position: 'right', fontSize: 9 }} />
          <Line type="monotone" dataKey="k" stroke="#3b82f6" dot={false} strokeWidth={1.5} name="%K" />
          <Line type="monotone" dataKey="d" stroke="#f97316" dot={false} strokeWidth={1} name="%D" />
        </ComposedChart>
      </ResponsiveContainer>
      <ChartExplanation
        detail="Compara el cierre actual con el rango alto-bajo de los ultimos 14 periodos. %K es la linea rapida, %D es la media de %K. Escala de 0 a 100."
        interpretation="%K > 80 = sobrecompra. %K < 20 = sobreventa. Cruce de %K por encima de %D es senal de compra. Funciona mejor en mercados laterales."
        signal={signalText}
        signalType={signalType}
      />
    </div>
  );
}

// ─── BOLLINGER BANDS ─────────────────────────────────

export function BollingerChart({ series }: { series: IndicatorSeries }) {
  const data = series.dates.map((d, i) => ({
    date: formatDate(d),
    close: series.close[i],
    upper: series.bollingerUpper[i],
    lower: series.bollingerLower[i],
  }));

  const lastUpper = series.bollingerUpper.filter((v) => v != null).pop();
  const lastLower = series.bollingerLower.filter((v) => v != null).pop();
  const lastClose = series.close[series.close.length - 1];

  let signalText: string | null = null;
  let signalType: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (lastUpper != null && lastLower != null) {
    const range = lastUpper - lastLower;
    const pctB = range > 0 ? ((lastClose - lastLower) / range) * 100 : 50;
    if (pctB > 95) {
      signalText = `Precio tocando banda superior (%B ${pctB.toFixed(0)}%) — posible sobreextension`;
      signalType = 'bearish';
    } else if (pctB < 5) {
      signalText = `Precio tocando banda inferior (%B ${pctB.toFixed(0)}%) — posible zona de compra`;
      signalType = 'bullish';
    } else if (pctB > 50 && pctB < 80) {
      signalText = `Precio en mitad superior de las bandas (%B ${pctB.toFixed(0)}%) — tendencia alcista`;
      signalType = 'bullish';
    } else {
      signalText = `Precio en mitad inferior de las bandas (%B ${pctB.toFixed(0)}%)`;
      signalType = 'neutral';
    }
  }

  return (
    <div>
      <ChartHeader
        title="Bollinger Bands (20, 2)"
        subtitle="Bandas de volatilidad"
      />
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.1)" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} width={55} domain={['auto', 'auto']} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="upper" stroke="#9ca3af" dot={false} strokeWidth={1} strokeDasharray="4 2" name="Banda Sup." />
          <Line type="monotone" dataKey="lower" stroke="#9ca3af" dot={false} strokeWidth={1} strokeDasharray="4 2" name="Banda Inf." />
          <Line type="monotone" dataKey="close" stroke="#3b82f6" dot={false} strokeWidth={1.5} name="Precio" />
        </ComposedChart>
      </ResponsiveContainer>
      <ChartExplanation
        detail="Tres lineas: banda superior (SMA20 + 2 desvios), media y banda inferior. El ancho de las bandas refleja la volatilidad del activo."
        interpretation="Precio cerca de la banda superior puede indicar sobreextension. Bandas estrechas anticipan un movimiento fuerte (compresion). Bandas anchas = alta volatilidad."
        signal={signalText}
        signalType={signalType}
      />
    </div>
  );
}
