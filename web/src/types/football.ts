export type TeamCode = "FCM" | "FCK";

export type PriorityLevel = "high" | "medium" | "low" | string;

export interface TableauBaseRow {
  match_id: string;
  team: string;
  opponent?: string;
  period?: string | number;
  minute_bin?: string | number;
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  zone?: string;
  channel?: string;
  interpretation_label?: string;
  insight_text?: string;
  dashboard_section?: string;
  recommended_chart_type?: string;
  priority_level?: PriorityLevel;
}

export type MatchSummaryRow = TableauBaseRow;

export type MomentumTimelineRow = TableauBaseRow;

export interface PlayerMetricRow {
  match_id: string;
  team: string;
  player_id: number;
  player_name: string;
  metric_group: string;
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  interpretation_label?: string;
  insight_text?: string;
  dashboard_section?: string;
  recommended_chart_type?: string;
  priority_level?: PriorityLevel;
  percentile_within_team?: number;
  rank_within_team?: number;
}

export interface PlayerProfileRow {
  match_id: string;
  team: string;
  player_id: number;
  player_name: string;
  metric_unit?: string;
  interpretation_label?: string;
  insight_text?: string;
  dashboard_section?: string;
  recommended_chart_type?: string;
  priority_level?: PriorityLevel;
  primary_profile?: string;
  risks?: string;
  secondary_profile?: string;
  staff_note?: string;
  strengths?: string;
}

export interface ShotRow {
  match_id: string;
  game_id_opta: number;
  event_id: string;
  team_id: number;
  team_name: string;
  opponent_team_id: number;
  opponent_team_name: string;
  period: number;
  period_second: number;
  match_second: number;
  match_minute: number;
  minute_bin_5: number;
  player_id: number;
  player_name: string;
  metric_unit?: string;
  zone?: string;
  third?: string;
  channel?: string;
  x_oriented: number;
  y_oriented: number;
  event_type: string;
  outcome?: string;
  phase?: string;
  interpretation_label?: string;
  insight_text?: string;
  dashboard_section?: string;
  recommended_chart_type?: string;
  priority_level?: PriorityLevel;
  is_from_box?: boolean;
  is_goal?: boolean;
  is_on_target?: boolean;
  set_play_type?: string;
  shot_angle?: number;
  shot_distance_m?: number;
  shot_outcome?: string;
  shot_technique?: string;
  xg?: number;
}

export interface TrackingPhysicalRow {
  match_id: string;
  team: string;
  player_id: number;
  player_name: string;
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  interpretation_label?: string;
  insight_text?: string;
  dashboard_section?: string;
  recommended_chart_type?: string;
  priority_level?: PriorityLevel;
  confidence_level?: string;
}

export interface GameRow {
  match_id: string;
  game_id_opta: number;
  description: string;
  match_date: string;
  home_team_id: number;
  home_team_name: string;
  home_team_ssi_id: string;
  away_team_id: number;
  away_team_name: string;
  away_team_ssi_id: string;
  home_players_json: string;
  away_players_json: string;
  pitch_length_assumption_m: number;
  pitch_width_assumption_m: number;
}

export interface PlayerLookupRow {
  match_id: string;
  game_id_opta: number;
  team_side: "home" | "away" | string;
  team_id: number;
  team_name: string;
  player_id_opta: number;
  player_id_ssi: string;
  player_name: string;
  shirt_number: number;
  position: string;
  opta_uuid: string;
}
