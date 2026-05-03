# Tracking Feasibility

- Tracking player-frame rows scanned: 3,186,920
- Unique frames detected: 144,860
- Available: player coordinates, frames, match seconds, player IDs, team IDs, ball coordinates, speed, period and player presence.
- Sampling: 25 Hz inferred from 0.04s frame step.
- Speed reporting: raw tracking speed is stored in m/s, but Tableau-facing speed metrics are converted to km/h. High-speed and sprint distance thresholds remain 5.5 m/s (19.8 km/h) and 7.0 m/s (25.2 km/h), because distances are integrated from the provider's raw speed units.

| metric | possible_yes_no | reason | required_missing_fields | alternative_simpler_metric |
|---|---|---|---|---|
| player coordinates | yes | x/y/z and oriented x/y are present per player-frame |  | Use raw and oriented coordinates |
| frames and timestamp | yes | frame_idx and match_second are present; 25 Hz is defensible |  | Use match_second for event joins |
| team shape width/depth/centroid/compactness | yes | All players, teams and live flags are available |  | Aggregate live outfield frames |
| distance covered/high-speed/sprint distance | yes | Speed and 25 Hz sampling are available; Tableau-facing speed metrics are converted to km/h |  | Integrate raw m/s speed over live frames; report speed metrics in km/h |
| distance between lines | partial | Roster positions allow line approximation but substitutes are often labelled SUB | validated tactical line labels | Role-based line heights with medium confidence |
| defensive line height | partial | Back-line roles can be inferred for listed defenders only | exact role per frame | Average defender-role x height |
| acceleration/deceleration | no | Derivative of speed would need smoothing and validation | validated smoothing/model definitions | Report max speed in km/h and intensity distance |
| official pressure | no | No complete pressure-event model in tracking | pressure model | Use compactness/block height around defensive events |
| validated overloads/superiorities | no | Would require possession/role model and opponent relation definitions | superiority model | Use density by zone/channel |
| event-context shape | partial | Nearest-frame match_second join is available but not an explicit sync contract | exact event-frame synchronization | Shape around shots/losses/recoveries with confidence labels |
