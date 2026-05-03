import type {
  DashboardData,
  DatasetName,
  GameRow,
  InsightFlagRow,
  MatchSummaryRow,
  MomentumTimelineRow,
  PlayerMetricRow,
  PlayerProfileRow,
  ShotRow,
  TrackingPlayerPhysicalRow,
  TrackingTeamShapeRow,
} from "@/types/data";

export interface DashboardFilters {
  selectedTeam: string;
  selectedPeriod: string;
  selectedMetric: string;
  selectedPlayer: string;
  selectedPhase: string;
  selectedPriority: string;
}

export function getTeams(data: Pick<DashboardData, "playerLookup" | "matchSummary" | "games">) {
  const teams = new Set<string>();

  for (const game of data.games) {
    if (game.home_team_name) teams.add(game.home_team_name);
    if (game.away_team_name) teams.add(game.away_team_name);
  }

  for (const row of data.playerLookup) {
    if (row.team_name) teams.add(row.team_name);
  }

  for (const row of data.matchSummary) {
    if (row.team) teams.add(row.team);
  }

  return [...teams].sort();
}

export function getMatchContext(games: GameRow[]) {
  const game = games[0];

  if (!game) {
    return null;
  }

  return {
    matchId: game.match_id,
    gameId: game.game_id_opta,
    description: game.description,
    matchDate: game.match_date,
    homeTeam: game.home_team_name,
    awayTeam: game.away_team_name,
    pitchLength: game.pitch_length_assumption_m,
    pitchWidth: game.pitch_width_assumption_m,
  };
}

export function getMetricValue(
  rows: MatchSummaryRow[],
  metricName: string,
  team?: string,
  period?: string | number,
) {
  return getMetricRows(rows, metricName, team, period)[0]?.metric_value ?? null;
}

export function getMetricRows<T extends { metric_name: string | null; team?: string | null; period?: number | null }>(
  rows: T[],
  metricName: string,
  team?: string,
  period?: string | number,
) {
  return rows.filter((row) => {
    const teamMatches = !team || team === "all" || row.team === team;
    const periodMatches = period === undefined || period === "all" || row.period === Number(period);
    return row.metric_name === metricName && teamMatches && periodMatches;
  });
}

export function getTopInsights(rows: InsightFlagRow[], limit = 3, priority = "all") {
  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  return rows
    .filter((row) => priority === "all" || row.priority_level === priority || row.severity === priority)
    .filter((row) => Boolean(row.insight_text))
    .sort((a, b) => {
      const aSeverity = severityOrder[a.severity ?? ""] ?? 9;
      const bSeverity = severityOrder[b.severity ?? ""] ?? 9;
      return aSeverity - bSeverity;
    })
    .slice(0, limit);
}

export function getMomentumSeries(rows: MomentumTimelineRow[], metricName = "attacking_third_actions") {
  return rows
    .filter((row) => row.metric_name === metricName && row.minute_bin !== null)
    .map((row) => ({
      minute: row.minute_bin,
      team: row.team,
      value: row.metric_value ?? 0,
      label: row.interpretation_label,
      insight: row.insight_text,
    }));
}

export function getShotSummary(shots: ShotRow[]) {
  const byTeam = new Map<string, { team: string; shots: number; goals: number; onTarget: number; xg: number }>();

  for (const shot of shots) {
    const team = shot.team_name ?? "Unknown";
    const current = byTeam.get(team) ?? { team, shots: 0, goals: 0, onTarget: 0, xg: 0 };
    current.shots += 1;
    current.goals += shot.is_goal ? 1 : 0;
    current.onTarget += shot.is_on_target ? 1 : 0;
    current.xg += shot.xg ?? 0;
    byTeam.set(team, current);
  }

  return [...byTeam.values()];
}

export function getPlayerProfile(rows: PlayerProfileRow[], playerId?: number | string | null) {
  if (!playerId) {
    return rows[0] ?? null;
  }

  return rows.find((row) => row.player_id === Number(playerId)) ?? null;
}

export function getPlayerMetricsByGroup(rows: PlayerMetricRow[], playerId?: number | string | null) {
  const grouped = new Map<string, PlayerMetricRow[]>();

  for (const row of rows) {
    if (playerId && row.player_id !== Number(playerId)) {
      continue;
    }

    const group = row.metric_group ?? "Other";
    grouped.set(group, [...(grouped.get(group) ?? []), row]);
  }

  return grouped;
}

export function getTrackingMetrics(data: {
  trackingTeamShape: TrackingTeamShapeRow[];
  trackingPlayerPhysical: TrackingPlayerPhysicalRow[];
}) {
  return {
    teamShapeMetrics: [...new Set(data.trackingTeamShape.map((row) => row.metric_name).filter(Boolean))],
    physicalMetrics: [...new Set(data.trackingPlayerPhysical.map((row) => row.metric_name).filter(Boolean))],
    confidenceLevels: [
      ...new Set(
        [...data.trackingTeamShape, ...data.trackingPlayerPhysical]
          .map((row) => row.confidence_level)
          .filter(Boolean),
      ),
    ],
  };
}

export function getDatasetRowCounts(data: DashboardData) {
  return Object.fromEntries(
    (Object.keys(data) as DatasetName[]).map((key) => [key, data[key].length]),
  ) as Record<DatasetName, number>;
}
