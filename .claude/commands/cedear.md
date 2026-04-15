Sos el asistente de desarrollo del proyecto CEDEAR Analyzer.

## Proyecto
- **Repo:** https://github.com/nahirnmurana-cloud/cedear-analyzer
- **Produccion:** https://cedear-analyzer.vercel.app
- **Local:** /Users/hectorjure/repos/claudeworkspace/cedear-app/
- **Stack:** Next.js 16.2.3 + Tailwind 4 + shadcn/ui + lightweight-charts + recharts + SWR + yahoo-finance2 v3

## Modelo de scoring

### Oportunidad de compra (6 factores, cada uno 0-100, ponderados)
- **Momentum 22%** — MACD+RSI+Estocastico. Confluencia de 2+ senales da bonus. MACD solo penaliza.
- **Entry Timing 22%** — Distancia a SMA50, pendiente SMA50, extension (>8% 5d penaliza), var mensual (< -5% penaliza), dist a SMA200 (> 25% debajo penaliza).
- **Riesgo/Recompensa 20%** — Soporte cercano, upside >= 4% a SMA50, ATR, Bollinger.
- **Tendencia naciente 18%** — ADX 15-30, DI+ > DI-, SMA20 girando al alza.
- **Volumen 12%** — Dias de suba con volumen en ultimos 5 dias.
- **Calidad setup 6%** — Lateralidad, consistencia. Cap suave: si < 30, score × 0.7.

### Regla de consistencia
"Oportunidad fuerte" = score >= 70 AND 2 de [Momentum, Timing, R/R] >= 50 AND ninguno < 30.

### Labels
>= 70 (con consistencia): Oportunidad fuerte | >= 70 (sin): Buena oportunidad | 55-69: Buena oportunidad | 40-54: Setup interesante | 20-39: Oportunidad debil | < 20: Sin oportunidad

### Salud tecnica (score separado)
>= 60: Alta | 40-59: Media | < 40: Baja

### Fases de mercado
- Reversion temprana: Opp >= 55 AND Salud < 45 AND Momentum >= 40
- Tendencia confirmada: Salud >= 60 AND Opp < 40
- Debilidad: Salud < 45 AND Opp < 30
- Transicion: mixto

## Archivos clave
- `lib/scoring.ts` — Motor de scoring con factores conceptuales
- `lib/indicators.ts` — 10 indicadores tecnicos
- `lib/backtesting.ts` — Motor de backtesting con trades y equity curve
- `lib/yahoo.ts` — Cliente yahoo-finance2 con cache 5 min
- `lib/cedears.ts` — 202 CEDEARs
- `app/api/top/route.ts` — Top 5 oportunidades (filtra liquidez, analiza ~150)
- `components/opportunity-score.tsx` — UI de oportunidad con factores
- `components/market-phase.tsx` — Fase de mercado derivada

## Auth
- Clerk Core 3 via Vercel Marketplace (auto-provisioned keys)
- `middleware.ts` — clerkMiddleware() sin bloquear rutas publicas
- `app/api/watchlist/route.ts` — GET/POST/DELETE con auth() + clerkClient()
- Watchlist en Clerk user unsafeMetadata (sin DB)
- `hooks/use-watchlist.ts` — API si logueado, localStorage si no
- Header: UserButton si logueado, SignInButton mode="modal" si no
- 10k usuarios/mes gratis (Clerk free tier)

## Reglas
1. Lee archivos antes de modificar
2. Respeta la arquitectura de factores en scoring
3. `npm run build` despues de cambios
4. yahoo-finance2 v3, cache obligatorio
5. UI en espanol
6. Deploy: `git push && vercel deploy --prod`
7. Clerk: auth() y clerkClient() son async (Core 3). Importar de `@clerk/nextjs/server`.
8. Clerk env vars: Marketplace provisiona solo en Dev. Copiar CLERK_SECRET_KEY y NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY a Production con `vercel env add`. Sin esto da MIDDLEWARE_INVOCATION_FAILED.

## Mejoras futuras
- Oportunidades de venta (tendencia bajista despues de romper media)
- Extension adaptativa con ATR por activo
- Revisar cap calidad para reversiones con datos reales
- Testear 10-15 CEDEARs manualmente para calibrar
- Koncord, PWA, notificaciones push

## Mantenimiento
- `/check-cedears` — Verifica si BYMA agrego CEDEARs nuevos y los agrega a la lista
- Schedule diario L-V 9:17 AM (antes de apertura BYMA). Dura 7 dias por sesion.
- Lista actual: 282 CEDEARs en lib/cedears.ts
