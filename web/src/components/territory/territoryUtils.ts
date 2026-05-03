import { getTeamColor } from "@/lib/assets/assets";
import type {
  EventMapRow,
  MetricRowBase,
  PossessionSequenceRow,
  TeamZoneMetricRow,
} from "@/types/data";

export const territoryMetricOptions = [
  { label: "Progressive Passes", value: "progressive_passes" },
  { label: "Vertical Distance Gained", value: "vertical_distance_gained" },
  { label: "Final-third Entries", value: "final_third_entries" },
] as const;

export const heatmapMetricOptions = [
  { label: "Total Actions", value: "total_actions" },
  { label: "Progressive Passes", value: "progressive_passes" },
  { label: "Danger Entries", value: "danger_entries" },
  { label: "Box Entries", value: "box_entries" },
] as const;

export const channels = ["left_channel", "central_channel", "right_channel"] as const;
export const zones = ["defensive_third", "middle_third", "attacking_third"] as const;

export function teamMatches(team: string | null | undefined, selectedTeam: string) {
  return selectedTeam === "all" || team === selectedTeam;
}

export function periodMatches(period: number | null | undefined, selectedPeriod: string) {
  return selectedPeriod === "all" || period === Number(selectedPeriod);
}

export function getMetricByTeam(rows: MetricRowBase[], metricName: string, selectedPeriod = "all") {
  const filtered = rows.filter((row) => row.metric_name === metricName && periodMatches(row.period, selectedPeriod));
  return ["FCM", "FCK"].map((team) => ({
    team,
    value: filtered.find((row) => row.team === team)?.metric_value ?? 0,
    color: getTeamColor(team),
  }));
}

export function sumZoneMetric(
  rows: TeamZoneMetricRow[],
  metricName: string,
  selectedTeam: string,
  channel?: string,
  zone?: string,
) {
  return rows
    .filter((row) => row.metric_name === metricName)
    .filter((row) => teamMatches(row.team, selectedTeam))
    .filter((row) => !channel || row.channel === channel)
    .filter((row) => !zone || row.zone === zone)
    .reduce((sum, row) => sum + (row.metric_value ?? 0), 0);
}

export function filterTerritoryEvents(
  rows: EventMapRow[],
  filters: {
    selectedTeam: string;
    selectedPeriod: string;
    selectedChannel: string;
    actionFilter: "progressive" | "final_third" | "both";
  },
) {
  return rows
    .filter((row) => teamMatches(row.team_name, filters.selectedTeam))
    .filter((row) => periodMatches(row.period, filters.selectedPeriod))
    .filter((row) => filters.selectedChannel === "all" || row.channel === filters.selectedChannel)
    .filter((row) => {
      if (filters.actionFilter === "progressive") return row.is_progressive === true;
      if (filters.actionFilter === "final_third") return row.is_final_third_entry === true;
      return row.is_progressive === true || row.is_final_third_entry === true;
    })
    .filter((row) => row.x_oriented !== null && row.y_oriented !== null)
    .filter((row) => row.end_x_oriented !== null && row.end_y_oriented !== null);
}

export function groupPossessions(sequences: PossessionSequenceRow[], selectedTeam: string, selectedPeriod: string) {
  const groups = new Map<string, PossessionSequenceRow[]>();

  for (const row of sequences) {
    if (!teamMatches(row.team_name, selectedTeam) || !periodMatches(row.period, selectedPeriod)) {
      continue;
    }

    const type = row.attack_type ?? "unknown";
    const bucket = type.includes("direct") || type.includes("transition") ? "direct" : type.includes("elaborate") ? "elaborate" : "other";
    groups.set(bucket, [...(groups.get(bucket) ?? []), row]);
  }

  return [...groups.entries()].map(([type, rows]) => ({
    type,
    count: rows.length,
    duration: average(rows.map((row) => row.duration_seconds)),
    verticalGain: average(rows.map((row) => row.vertical_gain_m)),
    finalThirdEntries: sum(rows.map((row) => row.final_third_entries)),
    boxEntries: sum(rows.map((row) => row.box_entries)),
    shots: sum(rows.map((row) => row.shots)),
    threat: sum(rows.map((row) => row.threat_value)),
  }));
}

export function formatChannel(value: string) {
  return value.replace("_channel", "").replace("_", " ");
}

export function formatZone(value: string) {
  return value.replace("_third", " third").replace("_", " ");
}

function average(values: Array<number | null>) {
  const valid = values.filter((value): value is number => typeof value === "number");
  return valid.length > 0 ? valid.reduce((sumValue, value) => sumValue + value, 0) / valid.length : 0;
}

function sum(values: Array<number | null>) {
  return values.reduce<number>((sumValue, value) => sumValue + (value ?? 0), 0);
}
