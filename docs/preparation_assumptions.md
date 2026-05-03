# Preparation Assumptions - Phase 2

## Transformations Performed
- Created clean outputs in `outputs/`: `clean_events.csv`, `clean_tracking.csv`, `clean_games.csv`, plus auxiliary `player_lookup.csv`.
- Converted provider column names to `snake_case` in clean outputs while preserving raw eventing fields with a `raw_` prefix.
- Built standard time fields: `period`, `period_second`, `match_second`, `match_minute`, `minute_bin_5`, and `minute_bin_10`.
- Parsed coordinate arrays from eventing and tracking string fields.
- Flattened tracking into player-frame format, producing 3,186,920 player-frame rows from 144,860 tracking frames.
- Preserved all 7,221 eventing rows and marked 818 blank analytical rows with `is_blank_event=true`.

## Coordinate and Zone Assumptions
- The pitch coordinate system is centered in meters, based on the Phase 1 audit ranges near x=-56/+56 and y=-40/+38.
- Operational pitch dimensions are set to 112m x 80m.
- Oriented coordinates make the analysed team attack toward positive x.
- FCM is treated as attacking toward negative x in period 1 and positive x in period 2; FCK is treated as the opposite.
- `attacking_third` / `final_third` is defined as `x_oriented > 18.67`; `defensive_third` as `x_oriented < -18.67`.
- The box is approximated as `x_oriented >= 39.5` and `abs(y_oriented) <= 20.16`.
- Channels use `y_oriented`: left `< -13.33`, central between `-13.33` and `13.33`, right `> 13.33`.

## Limitations
- Some eventing locations, especially shot locations, appear already attack-normalized by the provider. Oriented event coordinates therefore carry `orientation_confidence=medium`.
- Tracking orientation is higher confidence because it uses raw team-side pitch positions and the observed halftime side switch.
- Event rows combine multiple provider concepts: passes, receptions, phases, shots, runs, tackles and set pieces. Sparse columns are expected and are not treated as data loss.
- Blank eventing rows are retained for row-level traceability but should normally be filtered out for analysis.
- Player minutes are not directly available; they can be derived later from tracking player-frame presence.
- Python 3.11 is expected by `.python-version`; if `python` is unavailable in PATH, run this script after configuring the interpreter.

## Fields Not Fully Available
- No official expected-threat (`xT`) field is available.
- No complete official pressure-event model is available.
- PPDA and pressure-after-loss should be implemented later only as transparent approximations.
