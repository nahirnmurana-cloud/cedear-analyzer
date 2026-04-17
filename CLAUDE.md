# CEDEAR Analyzer

App web de analisis tecnico de CEDEARs argentinos en produccion.

**Produccion:** https://cedear-analyzer.vercel.app
**Repo:** https://github.com/nahirnmurana-cloud/cedear-analyzer
**Vercel:** nahirnmurana-6276s-projects | **GitHub:** nahirnmurana-cloud

## Comandos
- `npm run dev` — Dev server
- `npm run build` — Build de produccion
- `git push origin main && vercel deploy --prod` — Deploy
- `vercel env pull .env.local` — Bajar env vars de Clerk
- `/cedear` — Skill principal para trabajar en el proyecto
- `/cedear-status` — Diagnostico rapido del estado del proyecto
- `/check-cedears` — Verificar si BYMA agrego CEDEARs nuevos

## Stack
Next.js 16.2.3 + Tailwind 4 + shadcn/ui + lightweight-charts + recharts + SWR + yahoo-finance2 v3 + Clerk Core 3

## Arquitectura

### Datos y scoring
- **lib/scoring.ts** — Modelo de oportunidad de compra (6 factores conceptuales, 0-100 cada uno, ponderados) + salud tecnica
- **lib/indicators.ts** — 10 indicadores: SMA/EMA 20/50/200, RSI, MACD, DMI/ADX, Bollinger, ATR, Estocastico, Volumen, S/R
- **lib/backtesting.ts** — Motor de backtesting: trades con razones, equity curve, diagnostico
- **lib/yahoo.ts** — Cliente yahoo-finance2 v3 con cache en memoria (5 min TTL)
- **lib/cedears.ts** — Lista maestra de 282 CEDEARs
- **lib/recommendation.ts** — Generador de resumen textual en espanol
- **lib/metric-descriptions.ts** — Descripciones educativas de cada indicador

### API routes
- `/api/cedear/[ticker]` — Analisis completo (indicadores + scoring + oportunidad)
- `/api/top` — Top 5 oportunidades (filtra liquidez, analiza ~150 de 282)
- `/api/cedears` — Lista con precios
- `/api/quotes` — Cotizaciones batch
- `/api/underlying/[ticker]` — Subyacente en USD (para CCL)
- `/api/watchlist` — GET/POST/DELETE watchlist (Clerk user metadata)

### Auth (Clerk)
- `middleware.ts` — clerkMiddleware(), no bloquea rutas publicas
- `app/sign-in/` y `app/sign-up/` — Paginas de login
- `hooks/use-watchlist.ts` — API si logueado, localStorage si no

## Modelo de oportunidad de compra

Detecta subas incipientes: precio subiendo hacia la media con momentum y volumen.

| Factor | Peso | Que mide |
|---|---|---|
| Momentum | 22% | MACD+RSI+Estocastico con confluencia |
| Entry Timing | 22% | Distancia a SMA50, pendiente, extension, var mensual |
| Riesgo/Recompensa | 20% | Soporte, upside >= 4% a SMA50, ATR |
| Tendencia naciente | 18% | ADX, DI, SMA20 girando |
| Volumen | 12% | Dias de suba con volumen |
| Calidad setup | 6% | Lateralidad, consistencia. Cap: < 30 = score × 0.7 |

## Reglas
- yahoo-finance2 v3, cache obligatorio. NUNCA API v7 directa.
- Clerk: auth() y clerkClient() son ASYNC (Core 3). Importar de `@clerk/nextjs/server`.
- Clerk env vars: Marketplace provisiona solo en Dev. Copiar a Prod con `vercel env add`.
- UI en espanol. Disclaimer financiero obligatorio.
- Verificar con `npm run build` despues de cambios.
