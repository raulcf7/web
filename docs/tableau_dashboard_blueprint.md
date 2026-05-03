# Blueprint del Dashboard en Tableau

Esta guía define la arquitectura visual y narrativa del dashboard post-partido en Tableau. El objetivo no es enseñar todas las métricas disponibles, sino construir una lectura clara para cuerpo técnico: qué ocurrió, dónde se generó ventaja, qué peligro fue real y qué jugadores impactaron más.

Usa `match_id` como clave principal entre datasets. Para mapas de campo, usa siempre coordenadas orientadas (`x_oriented`, `y_oriented`, `end_x_oriented`, `end_y_oriented`) para que ambos equipos ataquen visualmente hacia la derecha.

## Página 1. Resumen del Partido

### Objetivo Analítico
Responder en menos de 30 segundos: qué pasó en el partido, cuál fue la historia principal y qué debería mirar primero el staff.

### Preguntas que Responde
- ¿Qué equipo tuvo más control territorial?
- ¿Ese control produjo peligro real o fue dominio estéril?
- ¿Cuáles fueron los 3 insights más importantes del partido?
- ¿En qué momentos cambió el momentum?

### Datasets Usados
- `tableau_match_summary.csv`
- `tableau_momentum_timeline.csv`
- `tableau_insight_flags.csv`
- `tableau_shots.csv`

### Gráficos Recomendados
- Cabecera de contexto/scoreboard con equipos, rival y métricas principales.
- 4-6 KPIs principales:
  - `field_tilt`
  - `possession_proxy`
  - `shots`
  - `xg` o `threat`
  - `box_entries`
  - `dangerous_losses`
- Timeline de momentum:
  - eje X: `minute_bin` o `minute_bin_5`
  - color: `team`
  - medida: `metric_value`
  - métricas recomendadas: `threat`, `box_entries`, `attacking_third_actions`.
- Panel de top 3 insights:
  - fuente: `tableau_insight_flags.csv`
  - ordenar por `severity` o `priority_level`.
- Texto interpretativo breve usando `insight_text`.

### Campos Requeridos
- `match_id`
- `team`
- `opponent`
- `metric_name`
- `metric_value`
- `metric_unit`
- `minute_bin`
- `interpretation_label`
- `insight_text`
- `priority_level`

### Filtros
- Equipo.
- Periodo.
- Métrica del timeline.
- Nivel de prioridad, por defecto `high` y `medium`.

### Interacciones
- Seleccionar un equipo filtra KPIs, timeline e insights.
- Seleccionar un pico del momentum filtra vistas de tiros/eventos por intervalo temporal.
- Seleccionar un insight debería guiar a la página correspondiente mediante navegación del dashboard.

### Tooltip Recomendado
Mostrar:
- equipo y rival;
- métrica;
- valor y unidad;
- etiqueta interpretativa;
- texto de insight;
- intervalo temporal cuando aplique.

### Mensaje Clave
El usuario debe salir de esta página entendiendo quién controló el partido, si ese control tuvo peligro y cuál es la recomendación táctica principal.

### Riesgo de Mala Interpretación
`possession_proxy` no es posesión oficial. Es una estimación basada en volumen relativo de acciones. Etiquetarlo claramente como proxy.

### Prioridad de Implementación
Alta. Debe construirse primero porque define la narrativa global del dashboard.

## Página 2. Territorio y Progresión

### Objetivo Analítico
Mostrar quién controló el campo, por qué zonas progresó y si esa progresión fue productiva.

### Preguntas que Responde
- ¿Qué equipo jugó más cerca de la portería rival?
- ¿Por qué carriles progresó mejor cada equipo?
- ¿La progresión llegó al último tercio o se frenó antes?
- ¿Cambió el patrón entre primera y segunda parte?

### Datasets Usados
- `tableau_match_summary.csv`
- `tableau_team_period_metrics.csv`
- `tableau_team_zone_metrics.csv`
- `tableau_event_map.csv`
- `tableau_possession_sequences.csv`

### Gráficos Recomendados
- Comparativa de field tilt:
  - fuente: `tableau_match_summary.csv` o `tableau_team_period_metrics.csv`
  - filtro: `metric_name = field_tilt`.
- Barras de entradas al último tercio:
  - fuente: `tableau_team_period_metrics.csv`
  - filtro: `metric_name = final_third_entries`.
- Progresión por carril:
  - fuente: `tableau_team_zone_metrics.csv`
  - dimensión: `channel`
  - color: equipo
  - métricas: `progressive_passes`, `vertical_distance_gained`, `final_third_entries`.
- Heatmap de zonas del campo:
  - fuente: `tableau_team_zone_metrics.csv`
  - dimensiones: `zone` y `channel`
  - medida: `metric_value`
  - métricas recomendadas: `total_actions`, `progressive_passes`, `danger_entries`.
- Comparativa por periodos:
  - barras agrupadas por `period` y equipo.
- Mapa de acciones progresivas:
  - fuente: `tableau_event_map.csv`
  - filtros: `is_progressive = true` o `is_final_third_entry = true`.

### Campos Requeridos
- `team`
- `opponent`
- `period`
- `zone`
- `channel`
- `metric_name`
- `metric_value`
- `x_oriented`
- `y_oriented`
- `end_x_oriented`
- `end_y_oriented`
- `is_progressive`
- `is_final_third_entry`

### Filtros
- Equipo.
- Periodo.
- Métrica.
- Carril.
- Tipo de evento.

### Interacciones
- Seleccionar un carril filtra heatmap y mapa de eventos.
- Seleccionar un periodo actualiza field tilt, progresión y localización de acciones.
- Hover sobre una zona muestra `insight_text` y valor de la métrica.

### Tooltip Recomendado
Mostrar:
- equipo;
- zona/carril;
- métrica y valor;
- periodo;
- etiqueta interpretativa;
- en eventos: jugador, tipo de acción, fase, coordenadas de inicio/fin e insight.

### Mensaje Clave
El dominio territorial solo es valioso si permite avanzar hacia zonas que generen ventaja: último tercio, área y acciones de peligro.

### Riesgo de Mala Interpretación
El heatmap refleja densidad de eventos, no tiempo real de posesión ni ocupación espacial de jugadores. Para ocupación, usar tracking.

### Prioridad de Implementación
Alta. Esta página explica la capa territorial detrás del resumen ejecutivo.

## Página 3. Creación de Peligro

### Objetivo Analítico
Diferenciar volumen ofensivo de peligro real y explicar cómo se crearon las ocasiones.

### Preguntas que Responde
- ¿Qué equipo generó mejores tiros?
- ¿El peligro llegó por ataques elaborados, transiciones o balón parado?
- ¿Las entradas al área se tradujeron en tiros?
- ¿Qué zonas y momentos concentraron más amenaza?

### Datasets Usados
- `tableau_shots.csv`
- `tableau_event_map.csv`
- `tableau_team_period_metrics.csv`
- `tableau_momentum_timeline.csv`
- `tableau_possession_sequences.csv`

### Gráficos Recomendados
- Mapa de tiros:
  - X/Y: `x_oriented`, `y_oriented`
  - tamaño: `xg`
  - color: `shot_outcome` o equipo
  - forma: `is_goal` / `is_on_target`.
- Entradas al área y acciones peligrosas:
  - fuente: `tableau_event_map.csv`
  - filtros: `is_box_entry = true` o `threat_value > 0`.
- Timeline de amenaza:
  - fuente: `tableau_momentum_timeline.csv`
  - filtro: `metric_name = threat`.
- Tiros por fase:
  - fuente: `tableau_shots.csv`
  - dimensión: `phase` o `set_play_type`.
- Ratios de eficiencia:
  - fuente: `tableau_match_summary.csv`
  - métricas: `threat_per_possession`, `threat_per_attacking_action`, `shots_from_box`, `box_entries`.
- Acciones previas al tiro:
  - usar `tableau_event_map.csv` filtrando mismo equipo y `minute_bin_5` del tiro seleccionado.

### Campos Requeridos
- `team_name`
- `opponent_team_name`
- `player_name`
- `period`
- `match_minute`
- `minute_bin_5`
- `x_oriented`
- `y_oriented`
- `xg`
- `shot_outcome`
- `is_goal`
- `is_on_target`
- `is_from_box`
- `phase`
- `set_play_type`
- `threat_value`

### Filtros
- Equipo.
- Periodo.
- Resultado del tiro.
- Fase.
- Balón parado / juego abierto.
- Umbral de xG.

### Interacciones
- Seleccionar un tiro resalta eventos del mismo intervalo temporal.
- Seleccionar una fase filtra mapa de tiros, timeline de amenaza y secuencias de posesión.
- Seleccionar una posesión de alto peligro filtra tiros y entradas al área asociadas.

### Tooltip Recomendado
Mostrar:
- tirador;
- equipo;
- minuto y periodo;
- xG;
- resultado;
- distancia del tiro;
- fase o balón parado;
- etiqueta interpretativa e insight.

### Mensaje Clave
La creación debe leerse por calidad y contexto: tiros, entradas al área, amenaza y eficiencia cuentan una historia más útil que el volumen ofensivo aislado.

### Riesgo de Mala Interpretación
`threat_value` es un proxy simplificado, no xT oficial. Debe apoyar la lectura, no sustituir el análisis de tiros y contexto.

### Prioridad de Implementación
Alta. Es la página clave para separar dominio estéril de peligro real.

## Página 4. Comportamiento Defensivo y Transiciones

### Objetivo Analítico
Mostrar dónde se recuperó, dónde se perdió y qué consecuencias tuvieron esas acciones.

### Preguntas que Responde
- ¿Dónde recuperó el balón cada equipo?
- ¿Dónde se concentraron las pérdidas peligrosas?
- ¿Las recuperaciones altas acabaron en progresión, área o tiro?
- ¿Qué zonas generaron exposición tras pérdida?
- ¿Existe suficiente robustez para un proxy de PPDA?

### Datasets Usados
- `tableau_event_map.csv`
- `tableau_team_period_metrics.csv`
- `tableau_team_zone_metrics.csv`
- `tableau_possession_sequences.csv`
- `tableau_insight_flags.csv`

### Gráficos Recomendados
- Mapa de recuperaciones:
  - fuente: `tableau_event_map.csv`
  - filtro: `event_type = recovery`.
- Mapa de pérdidas peligrosas:
  - fuente: `tableau_event_map.csv`
  - filtro: `event_type = loss`.
- Recuperaciones altas:
  - recuperación con `third = attacking_third`.
- Outcomes de transición:
  - fuente: `tableau_team_period_metrics.csv`
  - usar métricas de recuperaciones seguidas de tiro, entrada al área o último tercio si están presentes.
- Acciones defensivas por zona:
  - fuente: `tableau_team_zone_metrics.csv`
  - métricas: recuperaciones, intercepciones, tackles, pérdidas peligrosas.
- PPDA proxy:
  - incluir solo si existe una métrica explícita y documentada; si no, usar densidad de acciones defensivas.

### Campos Requeridos
- `team_name` o `team`
- `opponent_team_name` o `opponent`
- `period`
- `minute_bin_5`
- `event_type`
- `third`
- `zone`
- `channel`
- `x_oriented`
- `y_oriented`
- `metric_name`
- `metric_value`
- `interpretation_label`
- `insight_text`

### Filtros
- Equipo.
- Periodo.
- Tipo de evento.
- Zona/carril.
- Outcome de transición.
- Prioridad de insight.

### Interacciones
- Seleccionar un cluster de pérdidas filtra secuencias de posesión del mismo equipo y tramo temporal.
- Seleccionar un periodo actualiza mapas y barras de transición.
- Seleccionar un insight filtra el mapa al equipo y evento correspondiente.

### Tooltip Recomendado
Mostrar:
- tipo de evento;
- equipo y rival;
- jugador si está disponible;
- zona/carril;
- minuto;
- fase;
- insight.

### Mensaje Clave
El valor defensivo no está solo en recuperar alto, sino en lo que ocurre después: progresión, entrada al área, tiro o exposición.

### Riesgo de Mala Interpretación
No llamar “presión” a todo evento defensivo. Si no hay modelo robusto de presión, usar lenguaje de recuperación, pérdida y transición.

### Prioridad de Implementación
Media-alta. Construir después de Chance Creation para conectar pérdidas/recuperaciones con consecuencias ofensivas.

## Página 5. Impacto de Jugadores

### Objetivo Analítico
Identificar jugadores influyentes y explicar su tipo de contribución: progresión, creación, defensa, eficiencia o riesgo.

### Preguntas que Responde
- ¿Quién impulsó la progresión?
- ¿Quién conectó posesión con creación?
- ¿Quién fue eficiente y quién solo acumuló volumen?
- ¿Qué jugadores asumieron más riesgo con pérdidas peligrosas?
- ¿Qué perfil describe mejor a cada jugador?

### Datasets Usados
- `tableau_player_metrics.csv`
- `tableau_player_profiles.csv`
- `tableau_tracking_player_physical.csv`
- `player_lookup.csv` si se necesita filtro por posición.

### Gráficos Recomendados
- Selector de ranking de jugador:
  - fuente: `tableau_player_metrics.csv`
  - filtros: `metric_group`, `metric_name`
  - orden: `metric_value` o `rank_within_team`.
- Etiquetas de perfil:
  - fuente: `tableau_player_profiles.csv`
  - campos: `primary_profile`, `secondary_profile`, `strengths`, `risks`.
- Barras de contribución:
  - comparar jugador seleccionado contra media del equipo usando `percentile_within_team`.
- Scatter riesgo vs recompensa:
  - eje X: `dangerous_losses` o `loss_risk_per_action`
  - eje Y: `threat_contribution`, `progressive_passes` o `box_actions`.
- Tarjeta de detalle de jugador:
  - jugador, equipo, perfil, fortalezas, riesgos y `staff_note`.
- Bloque físico:
  - fuente: `tableau_tracking_player_physical.csv`
  - métricas: minutos, distancia, alta intensidad, sprint distance y velocidad máxima.

### Campos Requeridos
- `team`
- `player_id`
- `player_name`
- `metric_group`
- `metric_name`
- `metric_value`
- `metric_unit`
- `percentile_within_team`
- `rank_within_team`
- `interpretation_label`
- `primary_profile`
- `secondary_profile`
- `strengths`
- `risks`
- `staff_note`

### Filtros
- Equipo.
- Jugador.
- Grupo de métrica.
- Métrica.
- Posición si se une con `player_lookup.csv`.
- Minutos mínimos si `minutes_played` está disponible.

### Interacciones
- Seleccionar un jugador actualiza ranking, tarjeta de perfil y outputs físicos.
- Seleccionar un grupo de métricas cambia ranking y comparativa.
- Seleccionar un perfil de riesgo filtra mapas de pérdidas/recuperaciones cuando haya `player_id`.

### Tooltip Recomendado
Mostrar:
- jugador y equipo;
- grupo de métrica;
- métrica y valor;
- unidad;
- percentil dentro del equipo;
- ranking dentro del equipo;
- etiqueta interpretativa;
- nota de staff.

### Mensaje Clave
El impacto del jugador debe leerse por rol: volumen, eficiencia, progresión, creación y riesgo no significan lo mismo para cada posición.

### Riesgo de Mala Interpretación
Evitar comparar perfiles distintos con una sola métrica bruta. Un central, un extremo y un delantero necesitan contexto de rol.

### Prioridad de Implementación
Media. Es muy valiosa, pero debe apoyarse primero en la narrativa colectiva del partido.

## Página 6 Opcional. Tracking y Estructura del Equipo

### Objetivo Analítico
Usar tracking para explicar estructura, compactación, anchura/profundidad y carga física.

### Cuándo Incluirla
Incluirla porque existen outputs de tracking (`tableau_tracking_team_shape.csv` y `tableau_tracking_player_physical.csv`). Debe etiquetarse como análisis derivado de tracking y con nivel de confianza visible.

### Preguntas que Responde
- ¿Cómo variaron anchura, profundidad y compactación?
- ¿En qué momentos el equipo estuvo más estirado o compacto?
- ¿Qué jugadores tuvieron mayor carga física?
- ¿La estructura cambia alrededor de pérdidas, recuperaciones o fases ofensivas?
- ¿Las posiciones medias apoyan la historia del partido?

### Datasets Usados
- `tableau_tracking_team_shape.csv`
- `tableau_tracking_player_physical.csv`
- `tableau_tracking_spatial_occupation.csv`, si se incluye en el workbook
- `tableau_tracking_event_context.csv`, si se incluye en el workbook
- `tableau_event_map.csv` para conectar estructura con eventos.

### Gráficos Recomendados
- Timeline de anchura/profundidad:
  - fuente: `tableau_tracking_team_shape.csv`
  - métricas: `team_width`, `team_depth`.
- Timeline de compactación:
  - métrica: `compactness`.
- Movimiento de centroide:
  - si existen métricas de centroide X/Y, usar línea temporal o KPI.
- Ranking físico:
  - fuente: `tableau_tracking_player_physical.csv`
  - métricas: distancia, alta intensidad, sprint distance, velocidad máxima.
- Posiciones medias:
  - usar spatial occupation o datos de posición si están disponibles.
- Estructura por fase:
  - filtrar por `phase_context` cuando exista.

### Campos Requeridos
- `team`
- `player_id`
- `player_name`
- `period`
- `minute_bin_5`
- `phase_context`
- `metric_name`
- `metric_value`
- `metric_unit`
- `confidence_level`
- `interpretation_label`

### Filtros
- Equipo.
- Periodo.
- Métrica.
- Contexto de fase.
- Jugador.
- Nivel de confianza.

### Interacciones
- Seleccionar un tramo temporal filtra mapas de eventos del mismo intervalo.
- Seleccionar una métrica de shape actualiza timeline y texto interpretativo.
- Seleccionar un jugador actualiza ranking físico y tarjeta de detalle.

### Tooltip Recomendado
Mostrar:
- equipo o jugador;
- métrica;
- valor y unidad;
- periodo y tramo temporal;
- nivel de confianza;
- etiqueta interpretativa.

### Mensaje Clave
El tracking aporta contexto estructural: explica spacing y carga física, pero debe conectarse con eventos para generar una lectura táctica útil.

### Riesgo de Mala Interpretación
No inferir intención táctica solo desde shape. Anchura, profundidad y compactación describen estructura observada, no necesariamente consigna del entrenador.

### Prioridad de Implementación
Opcional media. Construir solo después de tener sólidas las cinco páginas principales.

## Orden Sugerido de Construcción en Tableau

1. Conectar los CSV principales:
   - `tableau_match_summary.csv`
   - `tableau_team_period_metrics.csv`
   - `tableau_team_zone_metrics.csv`
   - `tableau_event_map.csv`
   - `tableau_shots.csv`
   - `tableau_momentum_timeline.csv`
   - `tableau_insight_flags.csv`
   - `tableau_player_metrics.csv`
   - `tableau_player_profiles.csv`

2. Crear relaciones por `match_id`.
   - Mantener archivos de eventos separados de archivos métricos.
   - Evitar joins físicos que dupliquen eventos, salvo que una vista concreta lo necesite.

3. Crear filtros globales.
   - Equipo.
   - Periodo.
   - Métrica.
   - Sección del dashboard.
   - Nivel de prioridad.

4. Construir primero Página 1.
   - Cabecera de partido.
   - 4-6 KPI cards.
   - Timeline de momentum.
   - Top 3 insights.
   - Texto narrativo corto.

5. Construir Página 2.
   - Field tilt.
   - Entradas al último tercio.
   - Progresión por carril.
   - Heatmap zona/carril.
   - Mapa de acciones progresivas.

6. Construir Página 3.
   - Mapa de tiros.
   - Entradas al área y acciones peligrosas.
   - Tiros por fase.
   - Ratios de eficiencia.

7. Construir Página 4.
   - Mapa de recuperaciones.
   - Mapa de pérdidas peligrosas.
   - Outcomes de transición.
   - Acciones defensivas por zona.
   - Etiquetas de cautela para métricas proxy.

8. Construir Página 5.
   - Selector de grupo de métricas.
   - Ranking de jugadores.
   - Perfil y nota de staff.
   - Scatter riesgo vs recompensa.

9. Añadir Página 6 solo cuando el dashboard base funcione.
   - Mostrar siempre `confidence_level`.
   - Usar tracking para explicar, no para sobrecargar la narrativa.

10. Pulido final.
   - Renombrar métricas técnicas con aliases legibles para staff.
   - Mantener máximo 6 objetos principales por página.
   - Usar `insight_text` en tooltips y paneles narrativos.
   - Comprobar que cada página responde una pregunta futbolística concreta.
   - Validar que la historia completa se entiende en menos de 3 minutos.
