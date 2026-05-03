# Tableau Data Dictionary

This dictionary documents the final Tableau-facing CSVs after `scripts/05_prepare_tableau_outputs.py` has standardized column names and metadata.

## tableau_match_summary.csv
- **Granularity:** one row per match-team-metric

| column | type | description | recommended_tableau_use |
|---|---|---|---|
| `match_id` | string | Stable match identifier used to relate all final outputs. | Relationship key / detail |
| `team` | string | Team short name used by earlier metric outputs. | Dimension / filter |
| `opponent` | string | Opponent team short name used by earlier metric outputs. | Dimension / filter |
| `period` | string | Match period or half. | Timeline filter / axis |
| `minute_bin` | string | Time bucket used for Tableau timelines. | Timeline filter / axis |
| `metric_name` | string | Machine-readable metric name. | Dimension / filter |
| `metric_value` | number | Numeric value of the metric. | Measure |
| `metric_unit` | string | Explicit unit for interpreting metric_value. | Dimension / filter |
| `zone` | string | Field zone or provider zone, depending on file granularity. | Dimension / filter |
| `channel` | string | Left, central or right channel using oriented y coordinates. | Dimension / filter |
| `interpretation_label` | string | Short football-reading label for Tableau color or annotation. | Tooltip / annotation |
| `insight_text` | string | Human-readable explanation for tooltip or annotation. | Tooltip / annotation |
| `dashboard_section` | string | Recommended dashboard page where the row belongs. | Dashboard organization |
| `recommended_chart_type` | string | Suggested Tableau chart type. | Dashboard organization |
| `priority_level` | string | High/medium/low priority for dashboard build order. | Dashboard organization |

## tableau_team_period_metrics.csv
- **Granularity:** one row per match-team-period-metric

| column | type | description | recommended_tableau_use |
|---|---|---|---|
| `match_id` | string | Stable match identifier used to relate all final outputs. | Relationship key / detail |
| `team` | string | Team short name used by earlier metric outputs. | Dimension / filter |
| `opponent` | string | Opponent team short name used by earlier metric outputs. | Dimension / filter |
| `period` | number | Match period or half. | Timeline filter / axis |
| `minute_bin` | string | Time bucket used for Tableau timelines. | Timeline filter / axis |
| `metric_name` | string | Machine-readable metric name. | Dimension / filter |
| `metric_value` | number | Numeric value of the metric. | Measure |
| `metric_unit` | string | Explicit unit for interpreting metric_value. | Dimension / filter |
| `zone` | string | Field zone or provider zone, depending on file granularity. | Dimension / filter |
| `channel` | string | Left, central or right channel using oriented y coordinates. | Dimension / filter |
| `interpretation_label` | string | Short football-reading label for Tableau color or annotation. | Tooltip / annotation |
| `insight_text` | string | Human-readable explanation for tooltip or annotation. | Tooltip / annotation |
| `dashboard_section` | string | Recommended dashboard page where the row belongs. | Dashboard organization |
| `recommended_chart_type` | string | Suggested Tableau chart type. | Dashboard organization |
| `priority_level` | string | High/medium/low priority for dashboard build order. | Dashboard organization |

## tableau_team_zone_metrics.csv
- **Granularity:** one row per match-team-zone-channel-metric

| column | type | description | recommended_tableau_use |
|---|---|---|---|
| `match_id` | string | Stable match identifier used to relate all final outputs. | Relationship key / detail |
| `team` | string | Team short name used by earlier metric outputs. | Dimension / filter |
| `opponent` | string | Opponent team short name used by earlier metric outputs. | Dimension / filter |
| `period` | string | Match period or half. | Timeline filter / axis |
| `minute_bin` | string | Time bucket used for Tableau timelines. | Timeline filter / axis |
| `metric_name` | string | Machine-readable metric name. | Dimension / filter |
| `metric_value` | number | Numeric value of the metric. | Measure |
| `metric_unit` | string | Explicit unit for interpreting metric_value. | Dimension / filter |
| `zone` | string | Field zone or provider zone, depending on file granularity. | Dimension / filter |
| `channel` | string | Left, central or right channel using oriented y coordinates. | Dimension / filter |
| `interpretation_label` | string | Short football-reading label for Tableau color or annotation. | Tooltip / annotation |
| `insight_text` | string | Human-readable explanation for tooltip or annotation. | Tooltip / annotation |
| `dashboard_section` | string | Recommended dashboard page where the row belongs. | Dashboard organization |
| `recommended_chart_type` | string | Suggested Tableau chart type. | Dashboard organization |
| `priority_level` | string | High/medium/low priority for dashboard build order. | Dashboard organization |

## tableau_player_metrics.csv
- **Granularity:** one row per player-metric

| column | type | description | recommended_tableau_use |
|---|---|---|---|
| `match_id` | string | Stable match identifier used to relate all final outputs. | Relationship key / detail |
| `team` | string | Team short name used by earlier metric outputs. | Dimension / filter |
| `player_id` | number | Player identifier, usually Opta ID. | Relationship key / detail |
| `player_name` | string | Player display name. | Dimension / filter |
| `metric_group` | string | Analytical family for player or team metrics. | Dimension / filter |
| `metric_name` | string | Machine-readable metric name. | Dimension / filter |
| `metric_value` | number | Numeric value of the metric. | Measure |
| `metric_unit` | string | Explicit unit for interpreting metric_value. | Dimension / filter |
| `interpretation_label` | string | Short football-reading label for Tableau color or annotation. | Tooltip / annotation |
| `insight_text` | string | Human-readable explanation for tooltip or annotation. | Tooltip / annotation |
| `dashboard_section` | string | Recommended dashboard page where the row belongs. | Dashboard organization |
| `recommended_chart_type` | string | Suggested Tableau chart type. | Dashboard organization |
| `priority_level` | string | High/medium/low priority for dashboard build order. | Dashboard organization |
| `percentile_within_team` | number | Percentile within team | Dimension / filter |
| `rank_within_team` | number | Rank within team | Dimension / filter |

## tableau_player_profiles.csv
- **Granularity:** one row per player profile

| column | type | description | recommended_tableau_use |
|---|---|---|---|
| `match_id` | string | Stable match identifier used to relate all final outputs. | Relationship key / detail |
| `team` | string | Team short name used by earlier metric outputs. | Dimension / filter |
| `player_id` | number | Player identifier, usually Opta ID. | Relationship key / detail |
| `player_name` | string | Player display name. | Dimension / filter |
| `metric_unit` | string | Explicit unit for interpreting metric_value. | Dimension / filter |
| `interpretation_label` | string | Short football-reading label for Tableau color or annotation. | Tooltip / annotation |
| `insight_text` | string | Human-readable explanation for tooltip or annotation. | Tooltip / annotation |
| `dashboard_section` | string | Recommended dashboard page where the row belongs. | Dashboard organization |
| `recommended_chart_type` | string | Suggested Tableau chart type. | Dashboard organization |
| `priority_level` | string | High/medium/low priority for dashboard build order. | Dashboard organization |
| `primary_profile` | string | Primary profile | Dimension / filter |
| `risks` | string | Risks | Dimension / filter |
| `secondary_profile` | string | Secondary profile | Timeline filter / axis |
| `staff_note` | string | Staff note | Dimension / filter |
| `strengths` | string | Strengths | Dimension / filter |

## tableau_event_map.csv
- **Granularity:** one row per relevant event

| column | type | description | recommended_tableau_use |
|---|---|---|---|
| `match_id` | string | Stable match identifier used to relate all final outputs. | Relationship key / detail |
| `game_id_opta` | number | Provider match identifier from the source data. | Dimension / filter |
| `event_id` | string | Stable event identifier where the row is event-level. | Relationship key / detail |
| `team_id` | number | Team identifier from the event or tracking source. | Relationship key / detail |
| `team_name` | string | Team short name. | Dimension / filter |
| `opponent_team_id` | number | Opponent team identifier when available. | Dimension / filter |
| `opponent_team_name` | string | Opponent team short name. | Dimension / filter |
| `period` | number | Match period or half. | Timeline filter / axis |
| `period_second` | number | Seconds elapsed within the current period. | Timeline filter / axis |
| `match_second` | number | Continuous match clock in seconds. | Timeline filter / axis |
| `match_minute` | number | Match minute derived from the continuous clock. | Timeline filter / axis |
| `minute_bin_5` | number | Five-minute time bucket. | Timeline filter / axis |
| `player_id` | number | Player identifier, usually Opta ID. | Relationship key / detail |
| `player_name` | string | Player display name. | Dimension / filter |
| `metric_unit` | string | Explicit unit for interpreting metric_value. | Dimension / filter |
| `zone` | string | Field zone or provider zone, depending on file granularity. | Dimension / filter |
| `third` | string | Defensive, middle or attacking third using oriented x coordinates. | Dimension / filter |
| `channel` | string | Left, central or right channel using oriented y coordinates. | Dimension / filter |
| `x` | number | X | Pitch coordinate |
| `y` | number | Y | Pitch coordinate |
| `end_x` | number | End x | Pitch coordinate |
| `end_y` | number | End y | Pitch coordinate |
| `x_oriented` | number | Start x coordinate in meters, oriented so attack goes right. | Pitch coordinate |
| `y_oriented` | number | Start y coordinate in meters, oriented so attack goes right. | Pitch coordinate |
| `end_x_oriented` | number | End x coordinate in meters, oriented so attack goes right. | Pitch coordinate |
| `end_y_oriented` | number | End y coordinate in meters, oriented so attack goes right. | Pitch coordinate |
| `event_type` | string | Simplified event family for pitch maps. | Dimension / filter |
| `outcome` | string | Event or shot outcome when available. | Dimension / filter |
| `phase` | string | Provider phase/context simplified for analysis. | Dimension / filter |
| `interpretation_label` | string | Short football-reading label for Tableau color or annotation. | Tooltip / annotation |
| `insight_text` | string | Human-readable explanation for tooltip or annotation. | Tooltip / annotation |
| `dashboard_section` | string | Recommended dashboard page where the row belongs. | Dashboard organization |
| `recommended_chart_type` | string | Suggested Tableau chart type. | Dashboard organization |
| `priority_level` | string | High/medium/low priority for dashboard build order. | Dashboard organization |
| `is_box_entry` | boolean | Is box entry | Dimension / filter |
| `is_final_third_entry` | boolean | Is final third entry | Dimension / filter |
| `is_progressive` | boolean | Is progressive | Dimension / filter |
| `is_set_play` | boolean | Is set play | Dimension / filter |
| `order` | number | Order | Dimension / filter |
| `threat_value` | number | Threat value | Measure |
| `xg` | number | Xg | Measure |

## tableau_shots.csv
- **Granularity:** one row per shot attempt

| column | type | description | recommended_tableau_use |
|---|---|---|---|
| `match_id` | string | Stable match identifier used to relate all final outputs. | Relationship key / detail |
| `game_id_opta` | number | Provider match identifier from the source data. | Dimension / filter |
| `event_id` | string | Stable event identifier where the row is event-level. | Relationship key / detail |
| `team_id` | number | Team identifier from the event or tracking source. | Relationship key / detail |
| `team_name` | string | Team short name. | Dimension / filter |
| `opponent_team_id` | number | Opponent team identifier when available. | Dimension / filter |
| `opponent_team_name` | string | Opponent team short name. | Dimension / filter |
| `period` | number | Match period or half. | Timeline filter / axis |
| `period_second` | number | Seconds elapsed within the current period. | Timeline filter / axis |
| `match_second` | number | Continuous match clock in seconds. | Timeline filter / axis |
| `match_minute` | number | Match minute derived from the continuous clock. | Timeline filter / axis |
| `minute_bin_5` | number | Five-minute time bucket. | Timeline filter / axis |
| `player_id` | number | Player identifier, usually Opta ID. | Relationship key / detail |
| `player_name` | string | Player display name. | Dimension / filter |
| `metric_unit` | string | Explicit unit for interpreting metric_value. | Dimension / filter |
| `zone` | string | Field zone or provider zone, depending on file granularity. | Dimension / filter |
| `third` | string | Defensive, middle or attacking third using oriented x coordinates. | Dimension / filter |
| `channel` | string | Left, central or right channel using oriented y coordinates. | Dimension / filter |
| `x_oriented` | number | Start x coordinate in meters, oriented so attack goes right. | Pitch coordinate |
| `y_oriented` | number | Start y coordinate in meters, oriented so attack goes right. | Pitch coordinate |
| `event_type` | string | Simplified event family for pitch maps. | Dimension / filter |
| `outcome` | string | Event or shot outcome when available. | Dimension / filter |
| `phase` | string | Provider phase/context simplified for analysis. | Dimension / filter |
| `interpretation_label` | string | Short football-reading label for Tableau color or annotation. | Tooltip / annotation |
| `insight_text` | string | Human-readable explanation for tooltip or annotation. | Tooltip / annotation |
| `dashboard_section` | string | Recommended dashboard page where the row belongs. | Dashboard organization |
| `recommended_chart_type` | string | Suggested Tableau chart type. | Dashboard organization |
| `priority_level` | string | High/medium/low priority for dashboard build order. | Dashboard organization |
| `is_from_box` | boolean | Is from box | Dimension / filter |
| `is_goal` | boolean | Is goal | Dimension / filter |
| `is_on_target` | boolean | Is on target | Dimension / filter |
| `set_play_type` | string | Set play type | Dimension / filter |
| `shot_angle` | number | Shot angle | Dimension / filter |
| `shot_distance_m` | number | Shot distance m | Dimension / filter |
| `shot_outcome` | string | Shot outcome | Dimension / filter |
| `shot_technique` | string | Shot technique | Dimension / filter |
| `xg` | number | Xg | Measure |

## tableau_possession_sequences.csv
- **Granularity:** one row per possession sequence

| column | type | description | recommended_tableau_use |
|---|---|---|---|
| `match_id` | string | Stable match identifier used to relate all final outputs. | Relationship key / detail |
| `poss_id` | string | Provider possession identifier; used as a possession proxy, not official possession. | Relationship key / detail |
| `team_name` | string | Team short name. | Dimension / filter |
| `opponent_team_name` | string | Opponent team short name. | Dimension / filter |
| `period` | number | Match period or half. | Timeline filter / axis |
| `minute_bin_5` | number | Five-minute time bucket. | Timeline filter / axis |
| `metric_unit` | string | Explicit unit for interpreting metric_value. | Dimension / filter |
| `end_x_oriented` | number | End x coordinate in meters, oriented so attack goes right. | Pitch coordinate |
| `interpretation_label` | string | Short football-reading label for Tableau color or annotation. | Tooltip / annotation |
| `insight_text` | string | Human-readable explanation for tooltip or annotation. | Tooltip / annotation |
| `dashboard_section` | string | Recommended dashboard page where the row belongs. | Dashboard organization |
| `recommended_chart_type` | string | Suggested Tableau chart type. | Dashboard organization |
| `priority_level` | string | High/medium/low priority for dashboard build order. | Dashboard organization |
| `actions` | number | Actions | Dimension / filter |
| `attack_type` | string | Attack type | Dimension / filter |
| `box_entries` | number | Box entries | Dimension / filter |
| `dominant_phase` | string | Dominant phase | Dimension / filter |
| `duration_seconds` | number | Duration seconds | Measure |
| `end_match_second` | number | End match second | Timeline filter / axis |
| `final_third_entries` | number | Final third entries | Dimension / filter |
| `passes` | number | Passes | Dimension / filter |
| `progressive_actions` | number | Progressive actions | Dimension / filter |
| `shots` | number | Shots | Dimension / filter |
| `start_match_second` | number | Start match second | Timeline filter / axis |
| `start_minute` | number | Start minute | Timeline filter / axis |
| `start_type` | string | Start type | Dimension / filter |
| `start_x_oriented` | number | Start x oriented | Pitch coordinate |
| `threat_value` | number | Threat value | Measure |
| `vertical_gain_m` | number | Vertical gain m | Measure |
| `xg` | number | Xg | Measure |

## tableau_momentum_timeline.csv
- **Granularity:** one row per team-time-bin-metric

| column | type | description | recommended_tableau_use |
|---|---|---|---|
| `match_id` | string | Stable match identifier used to relate all final outputs. | Relationship key / detail |
| `team` | string | Team short name used by earlier metric outputs. | Dimension / filter |
| `opponent` | string | Opponent team short name used by earlier metric outputs. | Dimension / filter |
| `period` | string | Match period or half. | Timeline filter / axis |
| `minute_bin` | number | Time bucket used for Tableau timelines. | Timeline filter / axis |
| `metric_name` | string | Machine-readable metric name. | Dimension / filter |
| `metric_value` | number | Numeric value of the metric. | Measure |
| `metric_unit` | string | Explicit unit for interpreting metric_value. | Dimension / filter |
| `zone` | string | Field zone or provider zone, depending on file granularity. | Dimension / filter |
| `channel` | string | Left, central or right channel using oriented y coordinates. | Dimension / filter |
| `interpretation_label` | string | Short football-reading label for Tableau color or annotation. | Tooltip / annotation |
| `insight_text` | string | Human-readable explanation for tooltip or annotation. | Tooltip / annotation |
| `dashboard_section` | string | Recommended dashboard page where the row belongs. | Dashboard organization |
| `recommended_chart_type` | string | Suggested Tableau chart type. | Dashboard organization |
| `priority_level` | string | High/medium/low priority for dashboard build order. | Dashboard organization |

## tableau_insight_flags.csv
- **Granularity:** one row per detected insight flag

| column | type | description | recommended_tableau_use |
|---|---|---|---|
| `match_id` | string | Stable match identifier used to relate all final outputs. | Relationship key / detail |
| `team` | string | Team short name used by earlier metric outputs. | Dimension / filter |
| `opponent` | string | Opponent team short name used by earlier metric outputs. | Dimension / filter |
| `period` | number | Match period or half. | Timeline filter / axis |
| `minute_bin` | string | Time bucket used for Tableau timelines. | Timeline filter / axis |
| `metric_name` | string | Machine-readable metric name. | Dimension / filter |
| `metric_value` | number | Numeric value of the metric. | Measure |
| `metric_unit` | string | Explicit unit for interpreting metric_value. | Dimension / filter |
| `interpretation_label` | string | Short football-reading label for Tableau color or annotation. | Tooltip / annotation |
| `insight_text` | string | Human-readable explanation for tooltip or annotation. | Tooltip / annotation |
| `dashboard_section` | string | Recommended dashboard page where the row belongs. | Dashboard organization |
| `recommended_chart_type` | string | Suggested Tableau chart type. | Dashboard organization |
| `priority_level` | string | High/medium/low priority for dashboard build order. | Dashboard organization |
| `insight_type` | string | Insight type | Dimension / filter |
| `severity` | string | Severity | Dimension / filter |

## tableau_tracking_team_shape.csv
- **Granularity:** one row per team-time-bin-shape-metric

| column | type | description | recommended_tableau_use |
|---|---|---|---|
| `match_id` | string | Stable match identifier used to relate all final outputs. | Relationship key / detail |
| `team` | string | Team short name used by earlier metric outputs. | Dimension / filter |
| `period` | number | Match period or half. | Timeline filter / axis |
| `minute_bin_5` | number | Five-minute time bucket. | Timeline filter / axis |
| `metric_name` | string | Machine-readable metric name. | Dimension / filter |
| `metric_value` | number | Numeric value of the metric. | Measure |
| `metric_unit` | string | Explicit unit for interpreting metric_value. | Dimension / filter |
| `interpretation_label` | string | Short football-reading label for Tableau color or annotation. | Tooltip / annotation |
| `insight_text` | string | Human-readable explanation for tooltip or annotation. | Tooltip / annotation |
| `dashboard_section` | string | Recommended dashboard page where the row belongs. | Dashboard organization |
| `recommended_chart_type` | string | Suggested Tableau chart type. | Dashboard organization |
| `priority_level` | string | High/medium/low priority for dashboard build order. | Dashboard organization |
| `confidence_level` | string | Confidence level | Dimension / filter |
| `phase_context` | string | Phase context | Dimension / filter |

## tableau_tracking_player_physical.csv
- **Granularity:** one row per player-physical-metric

| column | type | description | recommended_tableau_use |
|---|---|---|---|
| `match_id` | string | Stable match identifier used to relate all final outputs. | Relationship key / detail |
| `team` | string | Team short name used by earlier metric outputs. | Dimension / filter |
| `player_id` | number | Player identifier, usually Opta ID. | Relationship key / detail |
| `player_name` | string | Player display name. | Dimension / filter |
| `metric_name` | string | Machine-readable metric name. | Dimension / filter |
| `metric_value` | number | Numeric value of the metric. | Measure |
| `metric_unit` | string | Explicit unit for interpreting metric_value. | Dimension / filter |
| `interpretation_label` | string | Short football-reading label for Tableau color or annotation. | Tooltip / annotation |
| `insight_text` | string | Human-readable explanation for tooltip or annotation. | Tooltip / annotation |
| `dashboard_section` | string | Recommended dashboard page where the row belongs. | Dashboard organization |
| `recommended_chart_type` | string | Suggested Tableau chart type. | Dashboard organization |
| `priority_level` | string | High/medium/low priority for dashboard build order. | Dashboard organization |
| `confidence_level` | string | Confidence level | Dimension / filter |
