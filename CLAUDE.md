# CEDEAR Analyzer

App web de analisis tecnico de CEDEARs argentinos.

## Comandos
- `npm run dev` — Dev server (default port 3000)
- `npm run build` — Build de produccion
- `/cedear` — Skill principal para trabajar en el proyecto
- `/cedear-status` — Ver estado actual del proyecto

## Arquitectura
- **lib/indicators.ts** — Motor de calculo: SMA, EMA, RSI, MACD, DMI/ADX, volumen, S/R
- **lib/scoring.ts** — Score tecnico 0-100 ponderado
- **lib/recommendation.ts** — Generador de resumen en espanol
- **lib/yahoo.ts** — Cliente Yahoo Finance (yahoo-finance2 v3) con cache en memoria
- **lib/cedears.ts** — Lista maestra de 50 CEDEARs (.BA tickers)

## Reglas importantes
- Yahoo Finance: usar `yahoo-finance2` v3 (no raw HTTP). La API v7 quotes esta muerta.
- Siempre cache en memoria para evitar rate limiting (429).
- UI en espanol. Disclaimer financiero obligatorio.
- Scoring: Tendencia(30) + Momentum(20) + Fuerza(15) + Volumen(15) + Volatilidad(10) + S/R(10) = 100.
