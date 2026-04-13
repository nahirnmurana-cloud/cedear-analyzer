# CEDEAR Analyzer

App web de analisis tecnico de CEDEARs argentinos. Analiza 200+ CEDEARs con 10 indicadores tecnicos, genera un score compuesto de 0 a 100, y recomienda Comprar, Mantener o Vender con explicaciones claras en espanol.

**Produccion:** https://cedear-analyzer.vercel.app

## Features

- **202 CEDEARs** — Acciones de USA, Argentina, Brasil, ETFs (SPY, QQQ, GLD, IBIT), mineras, energia, consumo, salud, tech y mas
- **Filtro de liquidez dinamico** — Solo analiza CEDEARs con volumen promedio de 20 ruedas > 500, descartando automaticamente los iliquidos
- **Scoring compuesto 0-100** — Puntaje basado en 6 categorias: Tendencia, Momentum, Fuerza, Volumen, Volatilidad y Soporte/Resistencia
- **Top 5 oportunidades** — Las mejores oportunidades de compra calculadas sobre todo el universo de CEDEARs liquidos
- **Watchlist con valoracion** — Guarda CEDEARs y ve score, recomendacion, precio, variacion y resumen de cada uno
- **10 indicadores tecnicos** — SMA/EMA 20/50/200, RSI, MACD, DMI/ADX, Bollinger Bands, ATR, Estocastico, Volumen relativo, Soporte/Resistencia
- **Graficos interactivos** — Linea y candlestick con selector de rango (1M, 3M, 6M, 1Y) y overlays de medias moviles
- **Alertas tecnicas** — Deteccion automatica de cruces MACD, RSI en extremos, rupturas de soporte/resistencia, volumen anormal, compresion Bollinger, estocastico extremos
- **Backtesting completo** — Simulacion historica con:
  - KPIs: retorno, buy & hold, alpha, win rate, profit factor, max drawdown
  - Grafico equity curve (estrategia vs benchmark) con marcadores de compra/venta
  - Tabla de trades con razones detalladas de entrada y salida
  - Diagnostico automatico interpretando los resultados
- **Comparacion con subyacente + CCL** — Precio del activo en USD, ratio CEDEAR, tipo de cambio implicito
- **Filtros en home** — Solo Compra, Sobre SMA 200, RSI < 35, Volumen alto
- **Descripciones educativas** — Cada indicador tiene explicacion, interpretacion y senal actual siempre visible
- **Dark mode** — Toggle con persistencia en localStorage
- **Loading states y error boundaries** — Skeletons de carga y manejo de errores en todas las paginas

## Stack

| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| UI | Tailwind CSS 4 + shadcn/ui |
| Graficos precio | lightweight-charts (TradingView) |
| Graficos indicadores | Recharts |
| Data fetching | SWR (auto-refresh) |
| Datos de mercado | yahoo-finance2 v3 |
| Deploy | Vercel (Fluid Compute) |

## Arquitectura

```
app/
  page.tsx                        # Home: Top 5 + filtros + busqueda + watchlist
  cedear/[ticker]/page.tsx        # Detalle: CCL + alertas + graficos + backtesting + metricas
  api/
    cedear/[ticker]/route.ts      # Analisis completo de un CEDEAR
    cedears/route.ts              # Lista de todos los CEDEARs con precios
    top/route.ts                  # Top 5 oportunidades (filtra por liquidez, analiza ~150)
    quotes/route.ts               # Cotizaciones batch para watchlist
    underlying/[ticker]/route.ts  # Precio del subyacente en USD (para CCL)

lib/
  indicators.ts                   # Motor de calculo: SMA, EMA, RSI, MACD, DMI/ADX,
                                  # Bollinger, ATR, Estocastico, Soporte/Resistencia
  scoring.ts                      # Score 0-100 ponderado por 6 categorias
  recommendation.ts               # Generador de resumen textual en espanol
  backtesting.ts                  # Motor de backtesting: trades, equity curve, diagnostico
  metric-descriptions.ts          # Descripciones educativas de cada indicador
  yahoo.ts                        # Cliente yahoo-finance2 con cache en memoria (5 min TTL)
  cedears.ts                      # Lista maestra de 202 CEDEARs
  types.ts                        # Interfaces TypeScript

components/
  price-chart.tsx                 # Grafico de precio (linea/candlestick) + SMAs + rango temporal
  indicator-chart.tsx             # RSI, MACD, Volumen, DMI/ADX, Estocastico, Bollinger
                                  # (cada uno con explicacion + interpretacion + senal debajo)
  backtest-panel.tsx              # Backtesting: KPIs, equity curve, tabla trades, diagnostico
  alerts.tsx                      # Deteccion y display de alertas tecnicas
  ccl-comparison.tsx              # Comparacion con subyacente + CCL implicito
  metric-detail.tsx               # Panel de metricas con descripcion siempre visible
  cedear-search.tsx               # Buscador con autocomplete y keyboard navigation
  cedear-card.tsx                 # Card con ticker, precio, score y recomendacion
  cedear-filters.tsx              # Filtros: Solo Compra, Sobre SMA200, RSI < 35, Vol alto
  watchlist.tsx                   # Watchlist con valoracion completa por CEDEAR
  score-gauge.tsx                 # Gauge SVG 0-100 + tabla desglose por categoria
  theme-toggle.tsx                # Dark/light mode toggle
  header.tsx                      # Header sticky con logo y dark mode
  disclaimer.tsx                  # Disclaimer financiero
```

## Scoring

El score tecnico compuesto va de 0 a 100 y se calcula ponderando 6 categorias:

| Categoria | Peso | Que evalua |
|-----------|------|-----------|
| Tendencia | 30 pts | Precio vs SMA 50/200, cruces de medias moviles |
| Momentum | 20 pts | MACD, RSI, Estocastico |
| Fuerza de tendencia | 15 pts | ADX, DMI+/DMI- |
| Volumen | 15 pts | Volumen relativo, confirmacion direccional |
| Volatilidad | 10 pts | Bollinger Bands (%B, bandwidth), ATR |
| Soporte/Resistencia | 10 pts | Cercania a niveles clave, breakouts |

**Recomendacion:**
- 80-100: Compra Fuerte
- 65-79: Comprar
- 45-64: Mantener
- 25-44: Cautela
- 0-24: Vender

## Backtesting

La simulacion historica opera con estas reglas:
- **Compra** cuando el score >= 65
- **Vende** cuando el score < 40
- **Evaluacion** semanal (cada 5 ruedas)
- **Periodo** ~1 ano de datos historicos

Metricas calculadas: retorno de la estrategia, retorno buy & hold, alpha, trades cerrados, win rate, profit factor, max drawdown, retorno promedio por trade.

Cada trade registra las razones de entrada (ej: "MACD alcista", "Precio arriba de SMA 200") y de salida (ej: "Score < 40", "DI- supero a DI+").

## Datos de mercado

- **Fuente:** Yahoo Finance via `yahoo-finance2` v3
- **Tickers:** CEDEARs cotizan en BYMA con sufijo `.BA` (ej: `AAPL.BA`, `MELI.BA`, `SPY.BA`)
- **Sin API key** — yahoo-finance2 maneja la autenticacion automaticamente
- **Cache en memoria** — 5 minutos TTL para evitar rate limiting
- **Filtro de liquidez** — El Top 5 descarta CEDEARs con volumen promedio < 500
- **Auto-refresh** — SWR refresca cada 5 min (detalle/watchlist) o 15 min (top 5)
- **Horario** — Datos en vivo durante ruedas de BYMA (11-17 ART, lunes a viernes). Fuera de horario muestra ultimo cierre.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir http://localhost:3000

## Deploy

La app esta deployada en Vercel. Para re-deployar:

```bash
git push origin main
vercel deploy --prod
```

## Disclaimer

Esta herramienta es exclusivamente informativa y educativa. No constituye asesoramiento financiero ni recomendacion de inversion. Los indicadores tecnicos son herramientas estadisticas que no garantizan resultados futuros. El backtesting no contempla comisiones, spread, slippage ni diferencias de liquidez. Consulte a un asesor financiero matriculado antes de invertir.
