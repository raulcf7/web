import { getTeamColor } from "@/lib/assets/assets";
import { toPitchPoint as toCanvasPitchPoint } from "@/lib/pitch/orientation";
import type { EventMapRow, MatchSummaryRow, MomentumTimelineRow, ShotRow } from "@/types/data";

export type ShotOutcomeFilter = "all" | "goal" | "save" | "off_target" | "block";
export type ShotPhaseFilter = "all" | "open_play" | string;

export function teamMatches(team: string | null | undefined, selectedTeam: string) {
  return selectedTeam === "all" || team === selectedTeam;
}

export function periodMatches(period: number | null | undefined, selectedPeriod: string) {
  return selectedPeriod === "all" || period === Number(selectedPeriod);
}

export function shotOutcomeMatches(shot: ShotRow, outcome: ShotOutcomeFilter) {
  return outcome === "all" || shot.shot_outcome === outcome;
}

export function getShotPhase(shot: ShotRow) {
  if (shot.phase) return shot.phase;
  if (shot.set_play_type) return shot.set_play_type;
  return "open_play";
}

export function shotPhaseMatches(shot: ShotRow, phase: ShotPhaseFilter) {
  return phase === "all" || getShotPhase(shot) === phase;
}

export function filterShots(
  shots: ShotRow[],
  filters: {
    selectedTeam: string;
    selectedPeriod: string;
    selectedOutcome: ShotOutcomeFilter;
    selectedPhase: ShotPhaseFilter;
    selectedMinuteBin: number | null;
  },
) {
  return shots
    .filter((shot) => teamMatches(shot.team_name, filters.selectedTeam))
    .filter((shot) => periodMatches(shot.period, filters.selectedPeriod))
    .filter((shot) => shotOutcomeMatches(shot, filters.selectedOutcome))
    .filter((shot) => shotPhaseMatches(shot, filters.selectedPhase))
    .filter((shot) => {
      if (filters.selectedMinuteBin === null) return true;
      const minute = shot.match_minute ?? 0;
      return minute >= filters.selectedMinuteBin && minute < filters.selectedMinuteBin + 5;
    });
}

export function getShotSummary(shots: ShotRow[]) {
  const totalShots = shots.length;
  const shotsOnTarget = shots.filter((shot) => shot.is_on_target || shot.is_goal).length;
  const goals = shots.filter((shot) => shot.is_goal).length;
  const totalXg = shots.reduce((sum, shot) => sum + (shot.xg ?? 0), 0);
  const shotsFromBox = shots.filter((shot) => shot.is_from_box).length;
  const averageDistance =
    shots.length > 0
      ? shots.reduce((sum, shot) => sum + (shot.shot_distance_m ?? 0), 0) / shots.length
      : 0;

  return {
    totalShots,
    shotsOnTarget,
    goals,
    totalXg,
    shotsFromBox,
    averageDistance,
  };
}

export function getTeamShotSummary(shots: ShotRow[]) {
  return ["FCM", "FCK"].map((team) => ({
    team,
    color: getTeamColor(team),
    ...getShotSummary(shots.filter((shot) => shot.team_name === team)),
  }));
}

export function getAvailableShotPhases(shots: ShotRow[]) {
  return [...new Set(shots.map(getShotPhase))].filter(Boolean).sort();
}

export function getShotsByPhase(shots: ShotRow[]) {
  const phases = getAvailableShotPhases(shots);
  return phases.map((phase) => ({
    phase: formatPhaseLabel(phase),
    phaseKey: phase,
    FCM: shots.filter((shot) => shot.team_name === "FCM" && getShotPhase(shot) === phase).length,
    FCK: shots.filter((shot) => shot.team_name === "FCK" && getShotPhase(shot) === phase).length,
  }));
}

export function getEfficiencyMetrics(rows: MatchSummaryRow[]) {
  const metrics = [
    "threat_per_possession",
    "threat_per_attacking_action",
    "box_entries",
    "shots_from_box",
    "danger_entries",
  ];

  return metrics.map((metric) => ({
    metric,
    FCM: rows.find((row) => row.team === "FCM" && row.metric_name === metric)?.metric_value ?? null,
    FCK: rows.find((row) => row.team === "FCK" && row.metric_name === metric)?.metric_value ?? null,
    unit: rows.find((row) => row.metric_name === metric)?.metric_unit ?? null,
  }));
}

export function getThreatTimeline(rows: MomentumTimelineRow[]) {
  const byMinute = new Map<number, Record<string, unknown>>();

  for (const row of rows) {
    if (row.metric_name !== "threat" || row.minute_bin === null) continue;
    const current = byMinute.get(row.minute_bin) ?? { minute: row.minute_bin };
    const team = row.team ?? "Unknown";
    current[team] = row.metric_value ?? 0;
    current[`${team}Insight`] = row.insight_text;
    byMinute.set(row.minute_bin, current);
  }

  return [...byMinute.values()].sort((a, b) => Number(a.minute) - Number(b.minute));
}

export function filterBoxThreatEvents(
  rows: EventMapRow[],
  filters: {
    selectedTeam: string;
    selectedPeriod: string;
    selectedMinuteBin: number | null;
  },
) {
  return rows
    .filter((row) => row.is_box_entry === true || (row.threat_value ?? 0) > 0)
    .filter((row) => teamMatches(row.team_name, filters.selectedTeam))
    .filter((row) => periodMatches(row.period, filters.selectedPeriod))
    .filter((row) => {
      if (filters.selectedMinuteBin === null) return true;
      const minute = row.match_minute ?? 0;
      return minute >= filters.selectedMinuteBin && minute < filters.selectedMinuteBin + 5;
    })
    .filter((row) => row.x_oriented !== null && row.y_oriented !== null)
    .filter((row) => row.end_x_oriented !== null && row.end_y_oriented !== null);
}

export function toPitchPoint(x: number | null, y: number | null) {
  return toCanvasPitchPoint({ x, y });
}

export function formatPhaseLabel(phase: string | null | undefined) {
  if (!phase) return "Open play";
  if (phase === "open_play") return "Open play";
  return phase
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
