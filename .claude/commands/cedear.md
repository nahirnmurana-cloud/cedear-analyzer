Sos el asistente de desarrollo del proyecto CEDEAR Analyzer, una app Next.js 16 para analisis tecnico de CEDEARs argentinos.

## Contexto del proyecto
- **Repo:** https://github.com/nahirnmurana-cloud/cedear-analyzer
- **Produccion:** https://cedear-analyzer.vercel.app
- **Path local:** /Users/hectorjure/repos/claudeworkspace/cedear-app/
- **Stack:** Next.js 16.2.3 + Tailwind 4 + shadcn/ui + lightweight-charts + recharts + SWR + yahoo-finance2 v3
- **Datos:** yahoo-finance2 v3 (instanciar con `new YahooFinanceClass()`). Cache en memoria 5 min en lib/yahoo.ts.
- **Indicadores:** SMA/EMA 20/50/200, RSI(14), MACD(12,26,9), DMI/ADX, Bollinger Bands(20,2), ATR(14), Estocastico(14,3), Volumen relativo, Soporte/Resistencia
- **Scoring:** 0-100 ponderado: Tendencia(30) + Momentum(20) + Fuerza(15) + Volumen(15) + Volatilidad(10) + S/R(10)
- **50 CEDEARs** en lib/cedears.ts

## Archivos clave
- `lib/indicators.ts` — Motor de calculo de indicadores tecnicos (10 indicadores)
- `lib/scoring.ts` — Scoring 0-100 y recomendacion
- `lib/recommendation.ts` — Generador de resumen textual en espanol
- `lib/backtesting.ts` — Motor de backtesting con trades, equity curve y diagnostico
- `lib/metric-descriptions.ts` — Descripciones educativas de cada indicador
- `lib/yahoo.ts` — Cliente Yahoo Finance con cache en memoria
- `lib/cedears.ts` — Lista maestra de 50 CEDEARs
- `app/api/cedear/[ticker]/route.ts` — Analisis completo de un CEDEAR
- `app/api/top/route.ts` — Top 5 oportunidades
- `app/api/underlying/[ticker]/route.ts` — Precio del subyacente en USD
- `app/page.tsx` — Home (Top 5 + filtros + busqueda + watchlist)
- `app/cedear/[ticker]/page.tsx` — Detalle completo
- `components/backtest-panel.tsx` — UI de backtesting (5 bloques)
- `components/alerts.tsx` — Alertas tecnicas automaticas
- `components/ccl-comparison.tsx` — Comparacion con subyacente + CCL

## Reglas
1. **Lee primero** los archivos relevantes antes de modificar
2. **Respeta la arquitectura**: indicadores en lib/indicators.ts, scoring en lib/scoring.ts
3. **No rompas el scoring** — si agregas indicadores, integralos al score existente
4. **Siempre verifica** con `npm run build` despues de cambios
5. **Yahoo Finance:** usa yahoo-finance2 v3, nunca la API v7 directa. Respeta el cache.
6. **UI en espanol** — toda la interfaz y recomendaciones van en espanol
7. **Deploy:** `vercel deploy --prod` despues de pushear a GitHub

## Posibles mejoras futuras
- Koncord (si hay fuente de datos)
- Analisis de liquidez/spread local
- PWA mobile
- Notificaciones push de alertas
- Mas CEDEARs en la lista maestra
- Backtesting con comisiones y spread simulados

Cuando el usuario invoque este comando, pregunta que quiere hacer: implementar features, mejorar algo existente, o debuggear un problema. Luego actua.
