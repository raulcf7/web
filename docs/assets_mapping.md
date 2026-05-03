# Assets Mapping

## Carpetas detectadas
- App public assets: `web/public/assets/`
- Liga: `web/public/assets/league/den-1.png`
- Equipos:
  - `web/public/assets/teams/FC_Midtjylland_8113.png`
  - `web/public/assets/teams/FC_København_8391.png`
- Jugadores:
  - `web/public/assets/players/FC_Midtjylland_8113/`
  - `web/public/assets/players/FC_København_8391/`
- Fallback creado:
  - `web/public/assets/players/fallback-player.svg`

## Estrategia de matching
- `getTeamCrest(teamCodeOrName)` acepta códigos cortos (`FCM`, `FCK`), nombres largos y algunos IDs de equipo.
- `getTeamColor(teamCodeOrName)` devuelve el rojo FCM, azul FCK o un color neutral.
- `getPlayerImage(playerId, playerName)` aplica esta prioridad:
  - ID exacto contra `playerImageById`.
  - Nombre normalizado contra `playerImageByNormalizedName`.
  - Fallback genérico si no hay match fiable.
- La normalización elimina tildes, puntos, apóstrofes y diferencias como `ø`/`o`, de modo que nombres abreviados como `D. Osorio` puedan resolver a archivos como `Dario_Osorio_1329007.png`.

## Assets faltantes o no alineados
- Los headshots existen, pero sus IDs de archivo no coinciden con `player_lookup.csv`.
- Ejemplo: `D. Osorio` en el CSV usa `player_id_opta=533646`, mientras el PNG disponible es `Dario_Osorio_1329007.png`.
- Por eso el matching real para el roster del partido depende principalmente del nombre normalizado.
- Algunos jugadores del roster no tienen una imagen identificable por nombre en la carpeta actual y usarán fallback:
  - `L. Lerager`
  - `V. Froholdt`
  - `N. Trott`
  - `G. Gocholeishvili`
  - `K. Diks`
  - `A. Chiakha`
  - `G. Onugkha`
  - `Oliver Sorensen`
  - `J. Kuchta`
  - `E. Martinez`
  - `J. Andersson`

## Decisiones tomadas
- Se creó `src/lib/assets/playerImageMap.ts` como fuente explícita del mapping para evitar rutas inventadas que produzcan imágenes rotas.
- Se mantienen helpers compatibles en `src/lib/assets/assets.ts`, incluyendo `getPlayerHeadshot`, pero la API preferida es `getPlayerImage`.
- Los nuevos componentes oficiales viven en `src/components/ui/`:
  - `TeamCrest`
  - `PlayerAvatar`
  - `LeagueIcon`
  - `TeamIdentity`
- Los componentes antiguos en `src/components/match/TeamCrest.tsx` y `src/components/players/PlayerAvatar.tsx` reexportan los nuevos componentes UI para compatibilidad.
- Se añadió una sección temporal `AssetShowcase` en la home para validar visualmente liga, escudos y 12 jugadores antes de construir las páginas finales.
