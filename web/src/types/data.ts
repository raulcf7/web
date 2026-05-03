export type CsvValue = string | number | boolean | null;
export type PriorityLevel = "high" | "medium" | "low" | string | null;
export type ConfidenceLevel = "high" | "medium" | "low" | string | null;

export interface MetricRowBase {
  match_id: string | null;
  team: string | null;
  opponent: string | null;
  period: number | null;
  minute_bin: number | null;
  metric_name: string | null;
  metric_value: number | null;
  metric_unit: string | null;
  zone: string | null;
  channel: string | null;
  interpretation_label: string | null;
  insight_text: string | null;
  dashboard_section: string | null;
  recommended_chart_type: string | null;
  priority_level: PriorityLevel;
}

export type MatchSummaryRow = MetricRowBase;
export type TeamPeriodMetricRow = MetricRowBase;
export type TeamZoneMetricRow = MetricRowBase;
export type MomentumTimelineRow = MetricRowBase;

export interface InsightFlagRow extends Omit<MetricRowBase, "zone" | "channel"> {
  insight_type: string | null;
  severity: string | null;
}

export interface EventMapRow {
  match_id: string | null;
  game_id_opta: number | null;
  event_id: string | null;
  team_id: number | null;
  team_name: string | null;
  opponent_team_id: number | null;
  opponent_team_name: string | null;
  period: number | null;
  period_second: number | null;
  match_second: number | null;
  match_minute: number | null;
  minute_bin_5: number | null;
  player_id: number | null;
  player_name: string | null;
  metric_unit: string | null;
  zone: string | null;
  third: string | null;
  channel: string | null;
  x: number | null;
  y: number | null;
  end_x: number | null;
  end_y: number | null;
  x_oriented: number | null;
  y_oriented: number | null;
  end_x_oriented: number | null;
  end_y_oriented: number | null;
  event_type: string | null;
  outcome: string | null;
  phase: string | null;
  interpretation_label: string | null;
  insight_text: string | null;
  dashboard_section: string | null;
  recommended_chart_type: string | null;
  priority_level: PriorityLevel;
  is_box_entry: boolean | null;
  is_final_third_entry: boolean | null;
  is_progressive: boolean | null;
  is_set_play: boolean | null;
  order: number | null;
  threat_value: number | null;
  xg: number | null;
}

export interface ShotRow {
  match_id: string | null;
  game_id_opta: number | null;
  event_id: string | null;
  team_id: number | null;
  team_name: string | null;
  opponent_team_id: number | null;
  opponent_team_name: string | null;
  period: number | null;
  period_second: number | null;
  match_second: number | null;
  match_minute: number | null;
  minute_bin_5: number | null;
  player_id: number | null;
  player_name: string | null;
  metric_unit: string | null;
  zone: string | null;
  third: string | null;
  channel: string | null;
  x_oriented: number | null;
  y_oriented: number | null;
  event_type: string | null;
  outcome: string | null;
  phase: string | null;
  interpretation_label: string | null;
  insight_text: string | null;
  dashboard_section: string | null;
  recommended_chart_type: string | null;
  priority_level: PriorityLevel;
  is_from_box: boolean | null;
  is_goal: boolean | null;
  is_on_target: boolean | null;
  set_play_type: string | null;
  shot_angle: number | null;
  shot_distance_m: number | null;
  shot_outcome: string | null;
  shot_technique: string | null;
  xg: number | null;
}

export interface PlayerMetricRow {
  match_id: string | null;
  team: string | null;
  player_id: number | null;
  player_name: string | null;
  metric_group: string | null;
  metric_name: string | null;
  metric_value: number | null;
  metric_unit: string | null;
  interpretation_label: string | null;
  insight_text: string | null;
  dashboard_section: string | null;
  recommended_chart_type: string | null;
  priority_level: PriorityLevel;
  percentile_within_team: number | null;
  rank_within_team: number | null;
}

export interface PlayerProfileRow {
  match_id: string | null;
  team: string | null;
  player_id: number | null;
  player_name: string | null;
  metric_unit: string | null;
  interpretation_label: string | null;
  insight_text: string | null;
  dashboard_section: string | null;
  recommended_chart_type: string | null;
  priority_level: PriorityLevel;
  primary_profile: string | null;
  risks: string | null;
  secondary_profile: string | null;
  staff_note: string | null;
  strengths: string | null;
}

export interface PossessionSequenceRow {
  match_id: string | null;
  poss_id: string | null;
  team_name: string | null;
  opponent_team_name: string | null;
  period: number | null;
  minute_bin_5: number | null;
  metric_unit: string | null;
  end_x_oriented: number | null;
  interpretation_label: string | null;
  insight_text: string | null;
  dashboard_section: string | null;
  recommended_chart_type: string | null;
  priority_level: PriorityLevel;
  actions: number | null;
  attack_type: string | null;
  box_entries: number | null;
  dominant_phase: string | null;
  duration_seconds: number | null;
  end_match_second: number | null;
  final_third_entries: number | null;
  passes: number | null;
  progressive_actions: number | null;
  shots: number | null;
  start_match_second: number | null;
  start_minute: number | null;
  start_type: string | null;
  start_x_oriented: number | null;
  threat_value: number | null;
  vertical_gain_m: number | null;
  xg: number | null;
}

export interface TrackingTeamShapeRow {
  match_id: string | null;
  team: string | null;
  period: number | null;
  minute_bin_5: number | null;
  metric_name: string | null;
  metric_value: number | null;
  metric_unit: string | null;
  interpretation_label: string | null;
  insight_text: string | null;
  dashboard_section: string | null;
  recommended_chart_type: string | null;
  priority_level: PriorityLevel;
  confidence_level: ConfidenceLevel;
  phase_context: string | null;
}

export interface TrackingPlayerPhysicalRow {
  match_id: string | null;
  team: string | null;
  player_id: number | null;
  player_name: string | null;
  metric_name: string | null;
  metric_value: number | null;
  metric_unit: string | null;
  interpretation_label: string | null;
  insight_text: string | null;
  dashboard_section: string | null;
  recommended_chart_type: string | null;
  priority_level: PriorityLevel;
  confidence_level: ConfidenceLevel;
}

export interface TrackingSpatialOccupationRow {
  match_id: string | null;
  team: string | null;
  player_id: number | null;
  player_name: string | null;
  period: number | null;
  zone: string | null;
  channel: string | null;
  metric_name: string | null;
  player_frame_count: number | null;
  occupation_share: number | null;
  team_density_share: number | null;
  avg_x_oriented: number | null;
  avg_y_oriented: number | null;
  confidence_level: ConfidenceLevel;
}

export interface TrackingEventContextRow {
  match_id: string | null;
  event_type: string | null;
  event_team: string | null;
  event_player: string | null;
  event_time: number | null;
  context_window: string | null;
  team_shape_metric: string | null;
  metric_value: number | null;
  interpretation_label: string | null;
  confidence_level: ConfidenceLevel;
}

export interface PlayerLookupRow {
  match_id: string | null;
  game_id_opta: number | null;
  team_side: string | null;
  team_id: number | null;
  team_name: string | null;
  player_id_opta: number | null;
  player_id_ssi: string | null;
  player_name: string | null;
  shirt_number: number | null;
  position: string | null;
  opta_uuid: string | null;
}

export interface GameRow {
  match_id: string | null;
  game_id_opta: number | null;
  description: string | null;
  match_date: string | null;
  home_team_id: number | null;
  home_team_name: string | null;
  home_team_ssi_id: string | null;
  away_team_id: number | null;
  away_team_name: string | null;
  away_team_ssi_id: string | null;
  home_players_json: string | null;
  away_players_json: string | null;
  pitch_length_assumption_m: number | null;
  pitch_width_assumption_m: number | null;
}

export interface DashboardData {
  matchSummary: MatchSummaryRow[];
  teamPeriodMetrics: TeamPeriodMetricRow[];
  teamZoneMetrics: TeamZoneMetricRow[];
  momentumTimeline: MomentumTimelineRow[];
  insightFlags: InsightFlagRow[];
  eventMap: EventMapRow[];
  shots: ShotRow[];
  playerMetrics: PlayerMetricRow[];
  playerProfiles: PlayerProfileRow[];
  possessionSequences: PossessionSequenceRow[];
  trackingTeamShape: TrackingTeamShapeRow[];
  trackingPlayerPhysical: TrackingPlayerPhysicalRow[];
  trackingSpatialOccupation: TrackingSpatialOccupationRow[];
  trackingEventContext: TrackingEventContextRow[];
  playerLookup: PlayerLookupRow[];
  games: GameRow[];
}

export type DatasetName = keyof DashboardData;

export interface CsvWarning {
  dataset: string;
  message: string;
  columns?: string[];
}
