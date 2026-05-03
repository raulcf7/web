# Player Metrics Methodology

## Data Sources
- Player technical metrics come from `outputs/clean_events.csv`.
- Minutes are estimated from `outputs/clean_tracking.csv` using player-frame presence at 25 Hz.
- Player names, teams and positions come from `outputs/player_lookup.csv`.

## Normalisation
- `minutes_played = player_frame_count / 25 / 60`.
- Per-90 and per-30 metrics use tracking-estimated minutes rather than official match minutes.
- Shares are calculated inside each team, not across both teams.
- Percentiles and ranks are within-team so players are compared with teammates in the same match context.

## Profile Definitions
- **Progression hub**: high within-team percentile for progressive passes, progressive carries, vertical distance gained or progression share.
- **Final-third connector**: high final-third entries, passes into final third or key-pass proxy.
- **High-risk creator**: combines creation/threat percentile with risk percentile.
- **Secure circulator**: high involvement with low loss-risk percentile.
- **Defensive ball-winner**: high recoveries, interceptions, tackles or high recoveries.
- **Transition outlet**: high progressive carries, ball wins leading to progression or vertical gain.
- **Box threat**: high shots from box, shot threat or box actions.
- **Low involvement**: 20+ tracking minutes with low involvement share.

## Limitations
- Event data mixes phases, passes, carries, shots, defensive actions and provider-derived events, so event totals should be read as involvement proxies.
- Pressure is not treated as an official metric because a complete pressure-event model is not available.
- Oriented event coordinates are useful for tactical tendencies but carry medium confidence because some provider event locations appear attack-normalised.
- Profiles are descriptive labels for this match only, not stable player archetypes.
- Goalkeepers are not assigned attacking progression/box-threat profiles from circulation volume; their profiles are limited to secure circulation, defensive ball-winning, low involvement or balanced role.

## Tableau Usage
- Use `tableau_player_metrics.csv` for sortable rankings, percentile bars and role-specific metric selectors.
- Use `tableau_player_profiles.csv` for a staff-facing player impact panel with strengths, risks and concise notes.
