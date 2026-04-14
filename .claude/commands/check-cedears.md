Verificar si hay CEDEARs nuevos que no estan en lib/cedears.ts.

## Pasos

1. Buscar en la web noticias recientes de BYMA sobre nuevos CEDEARs habilitados:
   - https://www.byma.com.ar/newsroom/ (buscar "nuevos cedears")
   - https://www.rankia.com.ar/blog/cedear/ (buscar actualizaciones de lista)

2. Leer la lista actual en /Users/hectorjure/repos/claudeworkspace/cedear-app/lib/cedears.ts

3. Si hay CEDEARs nuevos que no estan en la lista:
   - Agregarlos al archivo con ticker, nombre, localTicker, sector y ratio
   - Usar formato: { ticker: 'XXXX.BA', name: '...', localTicker: 'XXXX', sector: '...', ratio: N }
   - Verificar que el ticker funciona en Yahoo Finance con sufijo .BA

4. Si no hay nuevos, reportar "Lista al dia, N CEDEARs"

5. Si hubo cambios:
   - npm run build (verificar que compila)
   - git add lib/cedears.ts
   - git commit -m "feat: agregar N nuevos CEDEARs (XXXX, YYYY)"
   - git push origin main
   - vercel deploy --prod

Reportar cuantos CEDEARs hay en total y si se agrego alguno.
