# CEDEAR Analyzer

App web de analisis tecnico de CEDEARs argentinos. Evalua 10 indicadores tecnicos, genera un score compuesto de 0 a 100, y recomienda Comprar, Mantener o Vender con explicaciones claras en espanol.

**Produccion:** https://cedear-analyzer.vercel.app

## Features

- **Scoring compuesto 0-100** — Puntaje basado en 6 categorias: Tendencia, Momentum, Fuerza, Volumen, Volatilidad y Soporte/Resistencia
- **Top 5 oportunidades** — Las mejores oportunidades de compra del momento, calculadas automaticamente
- **Watchlist** — Guarda CEDEARs y ve su valoracion completa (score, recomendacion, resumen)
- **10 indicadores tecnicos** — SMA/EMA 20/50/200, RSI, MACD, DMI/ADX, Bollinger Bands, ATR, Estocastico, Volumen, Soporte/Resistencia
- **Graficos interactivos** — Linea y candlestick con selector de rango (1M, 3M, 6M, 1Y) y overlays de medias moviles
- **Alertas tecnicas** — Deteccion automatica de cruces MACD, RSI en extremos, rupturas de resistencia/soporte, volumen anormal, compresion Bollinger
- **Backtesting** — Simulacion historica con equity curve, tabla de trades detallada con razones de entrada/salida, KPIs (win rate, profit factor, max drawdown, alpha) y diagnostico automatico
- **Comparacion con subyacente + CCL** — Precio del activo en USD, ratio CEDEAR y tipo de cambio implicito
- **Filtros** — Solo Compra, Sobre SMA 200, RSI < 35, Volumen alto
- **Descripciones educativas** — Cada indicador tiene explicacion, interpretacion y senal actual visible
- **Dark mode** — Toggle con persistencia en localStorage
- **50 CEDEARs** — Acciones de USA, Argentina, ETFs y mas

## Stack

| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| UI | Tailwind CSS 4 + shadcn/ui |
| Graficos precio | lightweight-charts (TradingView) |
| Graficos indicadores | Recharts |
| Data fetching | SWR (auto-refresh) |
| Datos de mercado | yahoo-finance2 v3 |
| Deploy | Vercel |

## Arquitectura

```
app/
  page.tsx                      # Home: Top 5 + filtros + busqueda + watchlist
  cedear/[ticker]/page.tsx      # Detalle: graficos + score + alertas + backtesting + CCL
  api/
    cedear/[ticker]/route.ts    # Analisis completo de un CEDEAR
    cedears/route.ts            # Lista de todos los CEDEARs con precios
    top/route.ts                # Top 5 oportunidades (scoring de 20 CEDEARs)
    quotes/route.ts             # Cotizaciones batch para watchlist
    underlying/[ticker]/route.ts # Precio del subyacente en USD

lib/
  indicators.ts                 # Motor de calculo: SMA, EMA, RSI, MACD, DMI/ADX,
                                # Bollinger, ATR, Estocastico, Soporte/Resistencia
  scoring.ts                    # Score 0-100 ponderado
  recommendation.ts             # Generador de resumen textual en espanol
  backtesting.ts                # Motor de backtesting con trades y equity curve
  metric-descriptions.ts        # Descripciones educativas de cada indicador
  yahoo.ts                      # Cliente yahoo-finance2 con cache en memoria (5 min)
  cedears.ts                    # Lista maestra de 50 CEDEARs
  types.ts                      # Interfaces TypeScript

components/
  price-chart.tsx               # Grafico de precio (linea/candlestick) + SMAs
  indicator-chart.tsx           # RSI, MACD, Volumen, DMI/ADX, Estocastico, Bollinger
  backtest-panel.tsx            # Backtesting: KPIs, equity curve, tabla de trades, diagnostico
  alerts.tsx                    # Alertas tecnicas automaticas
  ccl-comparison.tsx            # Comparacion con subyacente + CCL implicito
  metric-detail.tsx             # Descripciones de metricas siempre visibles
  cedear-search.tsx             # Buscador con autocomplete y keyboard nav
  cedear-card.tsx               # Card de CEDEAR con score y recomendacion
  watchlist.tsx                 # Watchlist con valoracion completa
  ...
```

## Scoring

El score tecnico compuesto va de 0 a 100 y se calcula ponderando 6 categorias:

| Categoria | Peso | Que evalua |
|-----------|------|-----------|
| Tendencia | 30 pts | Precio vs SMA 50/200, cruces de medias |
| Momentum | 20 pts | MACD, RSI, Estocastico |
| Fuerza de tendencia | 15 pts | ADX, DMI+/DMI- |
| Volumen | 15 pts | Volumen relativo, confirmacion direccional |
| Volatilidad | 10 pts | Bollinger Bands, ATR |
| Soporte/Resistencia | 10 pts | Cercania a niveles clave |

**Recomendacion:**
- 80-100: Compra Fuerte
- 65-79: Comprar
- 45-64: Mantener
- 25-44: Cautela
- 0-24: Vender

## Datos de mercado

Los datos provienen de Yahoo Finance via el paquete `yahoo-finance2`. Los CEDEARs cotizan en BYMA con tickers `.BA` (ej: `AAPL.BA`, `MELI.BA`).

- **Sin API key** — yahoo-finance2 maneja la autenticacion automaticamente
- **Cache en memoria** — 5 minutos TTL para evitar rate limiting
- **Auto-refresh** — SWR refresca cada 5 min (detalle) o 15 min (top 5)
- **Horario** — Datos en vivo durante ruedas de BYMA (11-17 ART, lunes a viernes)

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir http://localhost:3000

## Deploy

La app esta deployada en Vercel. Para re-deployar:

```bash
vercel deploy --prod
```

## Disclaimer

Esta herramienta es exclusivamente informativa y educativa. No constituye asesoramiento financiero ni recomendacion de inversion. Los indicadores tecnicos son herramientas estadisticas que no garantizan resultados futuros. Consulte a un asesor financiero matriculado antes de invertir.
