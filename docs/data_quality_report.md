# Data Quality Report - Phase 1 Audit

## Match Context
- Match: FCM vs FCK
- Date: 14/09/2024
- Home team: FCM (homeOptaId=1000)
- Away team: FCK (awayOptaId=569)
- Opta match id: `2442592`
- Second Spectrum match id: `8cfdb681-32cf-4ebf-81f1-5c0839ec82d5`

## Dataset Summary
- `games.csv`: 1 row, 20 listed home players, 19 listed away players.
- `eventing.csv`: 7221 rows, 270 columns, 818 rows with no analytical data outside `order`.
- `tracking.csv`: 144,860 frames, 10 columns, no nulls in top-level tracking fields.

## Key Joins
- High confidence: `eventing.gameId` -> `games.Opta Id` (`2442592`).
- High confidence: `tracking.game_id` -> `games.Second Spectrum Id` (`8cfdb681-32cf-4ebf-81f1-5c0839ec82d5`).
- High confidence: eventing player fields use Opta IDs; tracking includes both SSI `playerId` and `optaId`; games includes both.
- Team mapping: FCM = Opta team 1000; FCK = Opta team 569.

## Temporal Structure
Eventing periods: `1` (3411), `2` (2992)

Tracking period profile:
- Period 1: 69,056 frames, frames 0 to 69055, gameClock 0 to 2762.2, live frames 38,525.
- Period 2: 75,804 frames, frames 69056 to 144859, gameClock 0 to 3032.12, live frames 33,927.

The tracking feed advances at approximately 25 frames per second because consecutive `gameClock` values differ by 0.04 seconds.

## Event Fields
- Team fields: `teamId`, `attTeamId`, `defTeamId`.
- Possession/phase fields: `possId`, `stateId`, `phaseId`, `phaseType`, `state`.
- Player fields: `playerId`, `firstPlayerId`, `lastPlayerId`, `passerId`, `receiverId`, `shooterId`.
- Pass fields: `passLoc`, `targetLoc`, `completed`, `blocked`, `direction`, `bodyPart`, `passProbability`.
- Shot fields: `shotLoc`, `shotOutcome`, `shotTechnique`, `xG`, `isScored`, `isOnGoal`, `shooterId`.
- Transition/turnover fields: `isTurnover`, `fromTurnover`, `turnoverType`, `startType`, `recoveredBy`, `recoveredLive`.

Important event classifications:
- `outcome`: `reception` (532), `incomplete_pass` (305), `completed_pass` (233), `forward` (207), `interception` (189), `defender_dribbled` (187), `backward` (155), `square` (155), `out` (107), `turnover` (97), `shot` (82), `clear` (68)
- `phaseType`: `progression` (99), `maintenance` (81), `interrupt` (63), `counter_attack` (60), `buildup` (55), `crossing` (39), `attacking` (38), `regain` (25)
- `startType`: `interception` (67), `throw_in` (40), `tackle` (30), `free_kick` (27), `corner_kick` (20), `goal_kick` (19), `recovery` (12), `kick_off` (5), `shot_recovered` (4), `penalty` (1)
- `shotOutcome`: `off_target` (16), `save` (4), `block` (4), `goal` (3)
- `runType`: `high_speed_running` (1285), `sprinting` (277), `attacking` (186), `possession` (97)

## Spatial Audit
The coordinate system is not 0-1 or 0-100. Parsed tracking locations are in a centered metric pitch coordinate system:
- Home player x/y range: x=-56.36 to 56.01, y=-39.7 to 37.75.
- Away player x/y range: x=-55.87 to 54.91, y=-36.66 to 36.38.
- Ball x/y/z range: x=-55.21 to 55.59, y=-35.83 to 36.59, z=0 to 23.83.

Eventing coordinate fields:
- `startLoc`: n=2535, x=-53.12 to 59.43, y=-35.16 to 34.77, z=0 to 0
- `endLoc`: n=3314, x=-53.12 to 59.43, y=-34.88 to 34.98, z=0 to 0
- `passLoc`: n=802, x=-50.29 to 54.24, y=-35.16 to 34.27, z=0 to 0
- `targetLoc`: n=802, x=-50.01 to 53.79, y=-34.27 to 35.28, z=0 to 0
- `receptionLoc`: n=741, x=-50.01 to 51.34, y=-33.86 to 34.09, z=0 to 0
- `runStartLoc`: n=283, x=-46.37 to 51.41, y=-33.51 to 33.5, z=0 to 0
- `runEndLoc`: n=283, x=-36.69 to 52.78, y=-33.56 to 32.93, z=0 to 0
- `shotLoc`: n=30, x=19.98 to 47.25, y=-18.2 to 13.35, z=0 to 0
- `prevLoc`: n=30, x=-36.89 to 47.93, y=-29.83 to 30.13, z=0 to 0
- `gkLoc`: n=30, x=47.51 to 51.96, y=-4.18 to 5.12, z=0 to 0
- `tackleLoc`: n=53, x=-30.97 to 48.33, y=-31.58 to 31.9, z=0 to 0
- `touchTacklerLoc`: n=53, x=-36.58 to 46.71, y=-29.41 to 29.51, z=0 to 0
- `location`: n=25, x=-43.22 to 46.93, y=-30.95 to 27.87, z=null to null
- `aerialLoc`: n=43, x=-51.08 to 44.27, y=-32.75 to 28.93, z=null to null
- `nextContactLoc`: n=17, x=-51.19 to 56.39, y=5.54 to 22.34, z=0.23 to 2.92

Direction of attack is inferable but must be handled carefully:
- Tracking is raw pitch orientation and teams switch sides between periods.
- First-half kickoff/goalkeeper positioning indicates FCK starts attacking toward positive x and FCM toward negative x; this switches after halftime.
- Shot-related eventing locations are strongly positive-x oriented near the attacking goal, so some eventing shot fields appear attack-normalized. This must be validated before field tilt or lane comparisons.

## Data Quality Issues
- `eventing.csv` contains 818 blank analytical rows; retain in raw audit but exclude from clean event tables with a documented rule.
- Many eventing columns are intentionally sparse because the table mixes event, phase, run, pass, shot, tackle and set-piece concepts.
- `tracking.csv` stores players and ball as nested string literals; Tableau-ready outputs will require flattening.
- Python is expected by `.python-version` and VS Code settings, but no `python` executable was available in this shell session.

## Metric Feasibility Summary
- Strong candidates: shots/xG, field tilt, final-third entries, box entries, progressive passes, possession sequences, direct vs elaborate attacks, transition/counterattack phases, player progression and creation profiles.
- Use with caution: PPDA, pressure after loss, line distances, compactness and density metrics. Tracking supports them technically, but definitions must be transparent and avoid overclaiming.
- Not supported as official metrics: official xT and official pressure model outputs.
