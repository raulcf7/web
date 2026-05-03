# Metric Definitions - Team Match Metrics

## Control and Territory
- **Total actions**: count of non-blank team events. Useful as a possession proxy, but not a true possession percentage because eventing is not a complete touch log. Recommended Tableau view: KPI or share bar.
- **Possession proxy / action share**: team share of total actions within a match, period or time bin. Interprets relative control, not official possession.
- **Field tilt**: team share of attacking-third actions. Indicates territorial control near the opponent goal. Recommended view: period bars plus momentum line.
- **Final-third entries**: actions moving from outside to inside the attacking third using oriented start/end coordinates. Shows penetration, not just territory.
- **Box entries**: actions or end locations inside the approximated penalty area. Stronger danger signal than final-third volume.
- **Average action height**: mean `x_oriented`. Higher values indicate actions closer to the opponent goal.

## Progression
- **Progressive passes**: completed passes gaining at least 10 meters toward goal. Shows effective ball progression.
- **Progressive carries**: run/carry-like events gaining at least 10 meters toward goal. Limited by provider run/event labels.
- **Vertical distance gained**: sum of positive `end_x_oriented - x_oriented`. Best as a volume measure by team/period/channel.
- **Final-third passes**: passes ending in the attacking third. Useful for construction quality.
- **Directness index**: average provider `raw_directness` where available. Use to separate direct attacks from longer construction.
- **Average sequence length**: team actions per possession ID. Interprets direct vs elaborate tendencies; sparse possession IDs can affect it.

## Chance Creation
- **Shots / shots on target / shots from box**: derived from shooter and shot outcome fields. Best shown on shot map and KPI cards.
- **Key passes**: passes with `raw_xg_created > 0` or `raw_led_to_shot=true`; conservative due sparse linkage.
- **Danger entries**: box entries plus high-value final-third entries. Useful bridge between territory and chance creation.
- **Simplified threat**: shot xG when available, otherwise positive movement between zone weights. This is not official xT.
- **Threat per possession / attacking action**: efficiency measures that compare output to opportunity volume.

## Defence and Transitions
- **Recoveries/interceptions/tackles**: transparent approximations using `start_type`, `turnover_type`, `outcome`, and tackle IDs.
- **High recoveries**: recoveries in the attacking third after orientation. Shows aggressive regain profile.
- **Dangerous losses**: turnovers or ball losses in central/non-advanced zones. Designed for coaching risk review.
- **Transition follow-ups**: recoveries/losses followed by final-third entries, box entries or shots within 10-15 seconds. Use as directional insight, not causal proof.

## Recommended Tableau Views
- Match overview: KPI cards for field tilt, threat, shots, box entries and insight flags.
- Period view: grouped bars by period for territory, progression and danger.
- Zone view: pitch heatmap by `zone` and `channel`.
- Momentum view: 5-minute line chart for threat and attacking-third actions.
- Insight flags: text table or annotation panel filtered by severity.
