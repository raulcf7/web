import { getTeamColor } from "@/lib/assets/assets";
import { toPitchPoint as toCanvasPitchPoint } from "@/lib/pitch/orientation";
import type { EventMapRow, InsightFlagRow, MatchSummaryRow, TeamZoneMetricRow } from "@/types/data";

export type DefensiveEventFilter = "all" | "recovery" | "regain" | "loss";

export const defensiveMetrics = [
  { label: "Recoveries", value: "recoveries" },
  { label: "Interceptions", value: "interceptions" },
  { label: "Tackles", value: "tackles" },
  { label: "Dangerous Losses", value: "dangerous_losses" },
] as const;

export const defensiveZones = ["defensive_third", "middle_third", "attacking_third"] as const;
export const defensiveChannels = ["left_channel", "central_channel", "right_channel"] as const;

export function teamMatches(team: string | null | undefined, selectedTeam: string) {
  return selectedTeam === "all" || team === selectedTeam;
}

export function periodMatches(period: number | null | undefined, selectedPeriod: string) {
  return selectedPeriod === "all" || period === Number(selectedPeriod);
}

export function filterDefensiveEvents(
  rows: EventMapRow[],
  filters: {
    selectedTeam: string;
    selectedPeriod: string;
    selectedEvent: DefensiveEventFilter;
    selectedZone: string;
  },
) {
  return rows
    .filter((row) => ["recovery", "regain", "loss"].includes(row.event_type ?? ""))
    .filter((row) => teamMatches(row.team_name, filters.selectedTeam))
    .filter((row) => periodMatches(row.period, filters.selectedPeriod))
    .filter((row) => filters.selectedEvent === "all" || row.event_type === filters.selectedEvent)
    .filter((row) => filters.selectedZone === "all" || row.zone === filters.selectedZone)
    .filter((row) => row.x_oriented !== null && row.y_oriented !== null);
}

export function filterLossEvents(
  rows: EventMapRow[],
  filters: {
    selectedTeam: string;
    selectedPeriod: string;
    selectedZone: string;
  },
) {
  return rows
    .filter((row) => row.event_type === "loss" || row.event_type === "turnover")
    .filter((row) => teamMatches(row.team_name, filters.selectedTeam))
    .filter((row) => periodMatches(row.period, filters.selectedPeriod))
    .filter((row) => filters.selectedZone === "all" || row.zone === filters.selectedZone)
    .filter((row) => row.x_oriented !== null && row.y_oriented !== null);
}

export function getDefensiveZoneMatrix(rows: TeamZoneMetricRow[], metricName: string, selectedTeam: string) {
  const values = defensiveZones.flatMap((zone) =>
    defensiveChannels.map((channel) => ({
      zone,
      channel,
      value: rows
        .filter((row) => row.metric_name === metricName)
        .filter((row) => teamMatches(row.team, selectedTeam))
        .filter((row) => row.zone === zone && row.channel === channel)
        .reduce((sum, row) => sum + (row.metric_value ?? 0), 0),
    })),
  );

  return {
    values,
    max: Math.max(...values.map((item) => item.value), 1),
  };
}

export function getTransitionOutcomes(rows: MatchSummaryRow[]) {
  const metrics = [
    "recoveries_followed_by_final_third_entry",
    "recoveries_followed_by_shot",
    "losses_punished_by_opponent_shot_or_box_entry",
  ];

  return metrics.map((metric) => ({
    metric,
    FCM: rows.find((row) => row.team === "FCM" && row.metric_name === metric)?.metric_value ?? null,
    FCK: rows.find((row) => row.team === "FCK" && row.metric_name === metric)?.metric_value ?? null,
    unit: rows.find((row) => row.metric_name === metric)?.metric_unit ?? null,
  }));
}

export function getHighRecoveries(rows: MatchSummaryRow[]) {
  return ["FCM", "FCK"].map((team) => ({
    team,
    value: rows.find((row) => row.team === team && row.metric_name === "high_recoveries")?.metric_value ?? 0,
    color: getTeamColor(team),
  }));
}

export function getDefensiveInsights(rows: InsightFlagRow[]) {
  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  return rows
    .filter((row) => {
      const haystack = `${row.metric_name ?? ""} ${row.insight_type ?? ""} ${row.dashboard_section ?? ""}`.toLowerCase();
      return /loss|recover|transition|defensive|tackle|interception|risk/.test(haystack);
    })
    .filter((row) => Boolean(row.insight_text))
    .sort((a, b) => (severityOrder[a.severity ?? ""] ?? 9) - (severityOrder[b.severity ?? ""] ?? 9))
    .slice(0, 6);
}

export function riskTone(event: EventMapRow) {
  const central = event.channel === "central_channel";
  const ownHalf = (event.x_oriented ?? 0) < 0;
  const defensiveThird = event.zone === "defensive_third";

  if (central && (ownHalf || defensiveThird)) return "high";
  if (central || defensiveThird) return "medium";
  return "low";
}

export function toPitchPoint(x: number | null, y: number | null) {
  return toCanvasPitchPoint({ x, y });
}

export function formatZone(value: string | null | undefined) {
  if (!value) return "Unknown zone";
  return value.replace("_third", " third").replace("_", " ");
}

export function formatChannel(value: string | null | undefined) {
  if (!value) return "Unknown channel";
  return value.replace("_channel", "").replace("_", " ");
}
