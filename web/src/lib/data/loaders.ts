import { loadCsvRows } from "@/lib/data/csv";
import type {
  EventMapRow,
  GameRow,
  InsightFlagRow,
  MatchSummaryRow,
  MomentumTimelineRow,
  PlayerLookupRow,
  PlayerMetricRow,
  PlayerProfileRow,
  PossessionSequenceRow,
  ShotRow,
  TeamPeriodMetricRow,
  TeamZoneMetricRow,
  TrackingEventContextRow,
  TrackingPlayerPhysicalRow,
  TrackingSpatialOccupationRow,
  TrackingTeamShapeRow,
} from "@/types/data";

const metricNumberFields = ["period", "minute_bin", "metric_value"] as const;
const metricRequiredFields = ["match_id", "team", "metric_name", "metric_value"] as const;

export function loadMatchSummary() {
  return loadCsvRows<MatchSummaryRow>({
    dataset: "matchSummary",
    path: "/data/tableau_match_summary.csv",
    numberFields: metricNumberFields,
    requiredFields: metricRequiredFields,
  });
}

export function loadTeamPeriodMetrics() {
  return loadCsvRows<TeamPeriodMetricRow>({
    dataset: "teamPeriodMetrics",
    path: "/data/tableau_team_period_metrics.csv",
    numberFields: metricNumberFields,
    requiredFields: metricRequiredFields,
  });
}

export function loadTeamZoneMetrics() {
  return loadCsvRows<TeamZoneMetricRow>({
    dataset: "teamZoneMetrics",
    path: "/data/tableau_team_zone_metrics.csv",
    numberFields: metricNumberFields,
    requiredFields: [...metricRequiredFields, "zone", "channel"],
  });
}

export function loadMomentumTimeline() {
  return loadCsvRows<MomentumTimelineRow>({
    dataset: "momentumTimeline",
    path: "/data/tableau_momentum_timeline.csv",
    numberFields: metricNumberFields,
    requiredFields: [...metricRequiredFields, "minute_bin"],
  });
}

export function loadInsightFlags() {
  return loadCsvRows<InsightFlagRow>({
    dataset: "insightFlags",
    path: "/data/tableau_insight_flags.csv",
    numberFields: metricNumberFields,
    requiredFields: [...metricRequiredFields, "insight_text", "priority_level", "severity"],
  });
}

export function loadEventMap() {
  return loadCsvRows<EventMapRow>({
    dataset: "eventMap",
    path: "/data/tableau_event_map.csv",
    numberFields: [
      "game_id_opta",
      "team_id",
      "opponent_team_id",
      "period",
      "period_second",
      "match_second",
      "match_minute",
      "minute_bin_5",
      "player_id",
      "x",
      "y",
      "end_x",
      "end_y",
      "x_oriented",
      "y_oriented",
      "end_x_oriented",
      "end_y_oriented",
      "order",
      "threat_value",
      "xg",
    ],
    booleanFields: ["is_box_entry", "is_final_third_entry", "is_progressive", "is_set_play"],
    requiredFields: ["match_id", "event_id", "team_name", "event_type", "x_oriented", "y_oriented"],
  });
}

export function loadShots() {
  return loadCsvRows<ShotRow>({
    dataset: "shots",
    path: "/data/tableau_shots.csv",
    numberFields: [
      "game_id_opta",
      "team_id",
      "opponent_team_id",
      "period",
      "period_second",
      "match_second",
      "match_minute",
      "minute_bin_5",
      "player_id",
      "x_oriented",
      "y_oriented",
      "shot_angle",
      "shot_distance_m",
      "xg",
    ],
    booleanFields: ["is_from_box", "is_goal", "is_on_target"],
    requiredFields: ["match_id", "event_id", "team_name", "player_name", "x_oriented", "y_oriented", "xg"],
  });
}

export function loadPlayerMetrics() {
  return loadCsvRows<PlayerMetricRow>({
    dataset: "playerMetrics",
    path: "/data/tableau_player_metrics.csv",
    numberFields: ["player_id", "metric_value", "percentile_within_team", "rank_within_team"],
    requiredFields: ["match_id", "team", "player_id", "player_name", "metric_group", "metric_name", "metric_value"],
  });
}

export function loadPlayerProfiles() {
  return loadCsvRows<PlayerProfileRow>({
    dataset: "playerProfiles",
    path: "/data/tableau_player_profiles.csv",
    numberFields: ["player_id"],
    requiredFields: ["match_id", "team", "player_id", "player_name", "primary_profile", "staff_note"],
  });
}

export function loadPossessionSequences() {
  return loadCsvRows<PossessionSequenceRow>({
    dataset: "possessionSequences",
    path: "/data/tableau_possession_sequences.csv",
    numberFields: [
      "period",
      "minute_bin_5",
      "end_x_oriented",
      "actions",
      "box_entries",
      "duration_seconds",
      "end_match_second",
      "final_third_entries",
      "passes",
      "progressive_actions",
      "shots",
      "start_match_second",
      "start_minute",
      "start_x_oriented",
      "threat_value",
      "vertical_gain_m",
      "xg",
    ],
    requiredFields: ["match_id", "poss_id", "team_name", "start_match_second", "end_match_second"],
  });
}

export function loadTrackingTeamShape() {
  return loadCsvRows<TrackingTeamShapeRow>({
    dataset: "trackingTeamShape",
    path: "/data/tableau_tracking_team_shape.csv",
    numberFields: ["period", "minute_bin_5", "metric_value"],
    requiredFields: ["match_id", "team", "metric_name", "metric_value", "confidence_level"],
  });
}

export function loadTrackingPlayerPhysical() {
  return loadCsvRows<TrackingPlayerPhysicalRow>({
    dataset: "trackingPlayerPhysical",
    path: "/data/tableau_tracking_player_physical.csv",
    numberFields: ["player_id", "metric_value"],
    requiredFields: ["match_id", "team", "player_id", "player_name", "metric_name", "metric_value", "confidence_level"],
  });
}

export function loadTrackingSpatialOccupation() {
  return loadCsvRows<TrackingSpatialOccupationRow>({
    dataset: "trackingSpatialOccupation",
    path: "/data/tableau_tracking_spatial_occupation.csv",
    numberFields: [
      "player_id",
      "period",
      "player_frame_count",
      "occupation_share",
      "team_density_share",
      "avg_x_oriented",
      "avg_y_oriented",
    ],
    requiredFields: ["match_id", "team", "player_name", "zone", "channel", "confidence_level"],
  });
}

export function loadTrackingEventContext() {
  return loadCsvRows<TrackingEventContextRow>({
    dataset: "trackingEventContext",
    path: "/data/tableau_tracking_event_context.csv",
    numberFields: ["event_time", "metric_value"],
    requiredFields: ["match_id", "event_type", "event_team", "team_shape_metric", "metric_value", "confidence_level"],
  });
}

export function loadPlayerLookup() {
  return loadCsvRows<PlayerLookupRow>({
    dataset: "playerLookup",
    path: "/data/player_lookup.csv",
    numberFields: ["game_id_opta", "team_id", "player_id_opta", "shirt_number"],
    requiredFields: ["match_id", "team_name", "player_id_opta", "player_name", "position"],
  });
}

export function loadGames() {
  return loadCsvRows<GameRow>({
    dataset: "games",
    path: "/data/clean_games.csv",
    numberFields: ["game_id_opta", "home_team_id", "away_team_id", "pitch_length_assumption_m", "pitch_width_assumption_m"],
    requiredFields: ["match_id", "description", "match_date", "home_team_name", "away_team_name"],
  });
}

export async function loadAllDashboardData() {
  const [
    matchSummary,
    teamPeriodMetrics,
    teamZoneMetrics,
    momentumTimeline,
    insightFlags,
    eventMap,
    shots,
    playerMetrics,
    playerProfiles,
    possessionSequences,
    trackingTeamShape,
    trackingPlayerPhysical,
    trackingSpatialOccupation,
    trackingEventContext,
    playerLookup,
    games,
  ] = await Promise.all([
    loadMatchSummary(),
    loadTeamPeriodMetrics(),
    loadTeamZoneMetrics(),
    loadMomentumTimeline(),
    loadInsightFlags(),
    loadEventMap(),
    loadShots(),
    loadPlayerMetrics(),
    loadPlayerProfiles(),
    loadPossessionSequences(),
    loadTrackingTeamShape(),
    loadTrackingPlayerPhysical(),
    loadTrackingSpatialOccupation(),
    loadTrackingEventContext(),
    loadPlayerLookup(),
    loadGames(),
  ]);

  return {
    matchSummary,
    teamPeriodMetrics,
    teamZoneMetrics,
    momentumTimeline,
    insightFlags,
    eventMap,
    shots,
    playerMetrics,
    playerProfiles,
    possessionSequences,
    trackingTeamShape,
    trackingPlayerPhysical,
    trackingSpatialOccupation,
    trackingEventContext,
    playerLookup,
    games,
  };
}
