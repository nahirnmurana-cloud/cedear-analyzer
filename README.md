# CEDEAR Analyzer

App web de analisis tecnico de CEDEARs argentinos. Analiza 200+ CEDEARs, detecta oportunidades de compra temprana con un modelo de 6 factores conceptuales, y genera recomendaciones con explicaciones claras en espanol.

**Produccion:** https://cedear-analyzer.vercel.app

## Como funciona

La app busca **oportunidades de compra temprana**: acciones que estan subiendo de manera sostenida hacia la media movil, con momentum positivo y volumen. El objetivo es entrar ANTES de que el precio llegue a la media, no despues.

Dos scores separados:
- **Oportunidad de compra** (0-100): detecta el timing de entrada. Ordena el Top 5.
- **Salud tecnica** (0-100): evalua el estado general del activo (Alta/Media/Baja).

Cuando la oportunidad es alta y la salud es baja, se marca como **"Reversion temprana"** — el mejor momento para entrar.

## Modelo de oportunidad de compra

Score basado en 6 factores conceptuales, cada uno calculado de 0 a 100 y ponderado:

| Factor | Peso | Que mide |
|---|---|---|
| Momentum | 22% | Cambio de direccion: MACD + RSI + Estocastico. Requiere confluencia de al menos 2 senales. MACD solo penaliza. |
| Entry Timing | 22% | Que tan temprano estas: distancia a SMA50, pendiente de SMA50, extension reciente (>8% en 5d = tarde), variacion mensual (< -5% = caida en curso), distancia a SMA200 (> 25% debajo = destruida). |
| Riesgo/Recompensa | 20% | Vale la pena el trade: soporte cercano, upside >= 4% hasta SMA50, ATR, posicion en Bollinger. |
| Tendencia naciente | 18% | Hay estructura para sostenerse: ADX 15-30, DI+ dominando, SMA20 girando al alza. |
| Volumen | 12% | Confirmacion: dias de suba con volumen alto en los ultimos 5 dias. |
| Calidad del setup | 6% | Filtro de ruido: lateralidad, consistencia de senales. Si calidad < 30, score final se reduce 30%. |

### Labels de oportunidad

| Score | Condicion | Label |
|---|---|---|
| >= 70 | 2 de [Momentum, Timing, R/R] >= 50, ninguno < 30 | Oportunidad fuerte |
| >= 70 | No cumple consistencia | Buena oportunidad |
| 55-69 | — | Buena oportunidad |
| 40-54 | — | Setup interesante |
| 20-39 | — | Oportunidad debil |
| < 20 | — | Sin oportunidad |

### Fases de mercado

| Fase | Condicion | Accion |
|---|---|---|
| Reversion temprana | Opp >= 55 AND Salud < 45 AND Momentum >= 40 | Oportunidad de compra |
| Tendencia confirmada | Salud >= 60 AND Opp < 40 | Mantener / entrada tardia |
| Debilidad | Salud < 45 AND Opp < 30 | Evitar o vender |
| Transicion | Mixto | Observar |

## Features

- **282 CEDEARs** con filtro de liquidez dinamico (volumen promedio 20d > 500). Lista verificada diariamente.
- **Top 5 oportunidades de compra** ordenado por score de oportunidad, no por salud
- **Watchlist con valoracion** — score, recomendacion y resumen por CEDEAR guardado
- **10 indicadores tecnicos** — SMA/EMA 20/50/200, RSI, MACD, DMI/ADX, Bollinger, ATR, Estocastico, Volumen, Soporte/Resistencia
- **Graficos interactivos** — Linea + candlestick + selector 1M/3M/6M/1Y + SMAs
- **Alertas tecnicas** — MACD cruce, RSI extremos, breakout, volumen anormal, Bollinger squeeze
- **Backtesting completo** — KPIs, equity curve, tabla de trades con razones de entrada/salida, diagnostico
- **Comparacion CEDEAR vs subyacente + CCL** implicito
- **Filtros** — Solo Compra, Sobre SMA200, RSI < 35, Volumen alto
- **Descripciones educativas** de cada indicador con interpretacion y senal actual
- **Dark mode**, loading skeletons, error boundaries
- **Autenticacion con Clerk** — Login con Google/email, watchlist sincronizada en la nube. Sin login la app funciona completa (watchlist en localStorage). 10,000 usuarios/mes gratis.

## Stack

| Capa | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| UI | Tailwind CSS 4 + shadcn/ui |
| Auth | Clerk Core 3 (Vercel Marketplace) |
| Graficos precio | lightweight-charts (TradingView) |
| Graficos indicadores | Recharts |
| Data fetching | SWR (auto-refresh 5-15 min) |
| Datos de mercado | yahoo-finance2 v3 (cache 5 min) |
| Deploy | Vercel (Fluid Compute) |

## Arquitectura

```
lib/
  scoring.ts          # Motor de oportunidad (6 factores) + salud tecnica
  indicators.ts       # 10 indicadores tecnicos
  backtesting.ts      # Motor de backtesting con trades y equity curve
  recommendation.ts   # Generador de resumen en espanol
  metric-descriptions.ts  # Descripciones educativas
  yahoo.ts            # Cliente yahoo-finance2 con cache
  cedears.ts          # 282 CEDEARs (verificacion diaria)
  types.ts            # Interfaces TypeScript

app/api/
  cedear/[ticker]/    # Analisis completo
  top/                # Top 5 oportunidades (filtra liquidez, analiza ~150)
  cedears/            # Lista con precios
  quotes/             # Cotizaciones batch
  underlying/[ticker]/ # Subyacente en USD
  watchlist/          # GET/POST/DELETE watchlist (Clerk user metadata)

app/
  sign-in/            # Pagina de login (Clerk)
  sign-up/            # Pagina de registro (Clerk)

middleware.ts          # Clerk auth middleware

components/
  opportunity-score   # Gauge + breakdown de factores + explicaciones
  health-gauge        # Salud tecnica (Alta/Media/Baja)
  market-phase        # Fase de mercado derivada
  backtest-panel      # 5 bloques: KPIs, equity curve, trades, detalle, diagnostico
  alerts              # Alertas tecnicas automaticas
  ccl-comparison      # CEDEAR vs subyacente + CCL
  price-chart         # Linea/candlestick + SMAs + rango temporal
  indicator-chart     # RSI, MACD, Volumen, DMI/ADX, Estocastico, Bollinger
  metric-detail       # Metricas con descripcion siempre visible
  cedear-search       # Autocomplete + keyboard nav
  cedear-card         # Card con oportunidad + salud
  cedear-filters      # Filtros en home
```

## Desarrollo local

```bash
npm install
vercel env pull .env.local  # Baja las keys de Clerk
npm run dev
```

## Deploy

```bash
git push origin main
vercel deploy --prod
```

## Autenticacion

Auth via Clerk (Vercel Marketplace). Env vars auto-provisioned:
- `CLERK_SECRET_KEY` — server-side
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — client-side
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`

La watchlist se guarda en Clerk user metadata (sin base de datos). Sin login, se usa localStorage.

**Importante:** Vercel Marketplace provisiona las keys de Clerk solo en Development. Hay que copiarlas a Production manualmente:
```bash
vercel env add CLERK_SECRET_KEY production --value "sk_..." --yes
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production --value "pk_..." --yes
```
Sin esto, el middleware falla con `MIDDLEWARE_INVOCATION_FAILED`.

## Disclaimer

Esta herramienta es exclusivamente informativa y educativa. No constituye asesoramiento financiero ni recomendacion de inversion. Los indicadores tecnicos no garantizan resultados futuros. El backtesting no contempla comisiones, spread ni slippage. Consulte a un asesor financiero matriculado antes de invertir.
