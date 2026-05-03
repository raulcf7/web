import type {
  PlayerLookupRow,
  PlayerMetricRow,
  PlayerProfileRow,
  TrackingPlayerPhysicalRow,
} from "@/types/data";

export interface PlayerIdentity {
  playerId: number | null;
  playerName: string;
  team: string;
  position: string | null;
  shirtNumber: number | null;
}

export function getMetricGroups(rows: PlayerMetricRow[]) {
  return [...new Set(rows.map((row) => row.metric_group).filter(Boolean))].sort() as string[];
}

export function getMetricNames(rows: PlayerMetricRow[], group: string, team: string) {
  return [
    ...new Set(
      rows
        .filter((row) => row.metric_group === group)
        .filter((row) => team === "all" || row.team === team)
        .map((row) => row.metric_name)
        .filter(Boolean),
    ),
  ].sort() as string[];
}

export function filterPlayerMetrics(
  rows: PlayerMetricRow[],
  filters: {
    selectedTeam: string;
    selectedGroup: string;
    selectedMetric: string;
    search: string;
  },
) {
  const search = filters.search.trim().toLowerCase();

  return rows
    .filter((row) => filters.selectedTeam === "all" || row.team === filters.selectedTeam)
    .filter((row) => row.metric_group === filters.selectedGroup)
    .filter((row) => row.metric_name === filters.selectedMetric)
    .filter((row) => !search || row.player_name?.toLowerCase().includes(search))
    .sort((a, b) => {
      const rankA = a.rank_within_team ?? 999;
      const rankB = b.rank_within_team ?? 999;
      if (rankA !== rankB) return rankA - rankB;
      return (b.metric_value ?? 0) - (a.metric_value ?? 0);
    });
}

export function getPlayerIdentity(
  playerId: number | null | undefined,
  team: string | null | undefined,
  playerName: string | null | undefined,
  lookup: PlayerLookupRow[],
): PlayerIdentity {
  const byId = lookup.find((row) => row.player_id_opta === playerId);
  const byName = lookup.find((row) => row.player_name === playerName && row.team_name === team);

  return {
    playerId: playerId ?? byName?.player_id_opta ?? null,
    playerName: playerName ?? byId?.player_name ?? "Unknown player",
    team: team ?? byId?.team_name ?? "Unknown",
    position: byId?.position ?? byName?.position ?? null,
    shirtNumber: byId?.shirt_number ?? byName?.shirt_number ?? null,
  };
}

export function getPlayerProfile(
  profiles: PlayerProfileRow[],
  playerId?: number | null,
  playerName?: string | null,
  team?: string | null,
) {
  return (
    profiles.find((profile) => profile.player_id === playerId) ??
    profiles.find((profile) => profile.player_name === playerName && profile.team === team) ??
    null
  );
}

export function getPlayerMetricsForBars(rows: PlayerMetricRow[], team: string | null, group: string, metric: string) {
  return rows
    .filter((row) => row.team === team)
    .filter((row) => row.metric_group === group)
    .filter((row) => row.metric_name === metric)
    .sort((a, b) => (b.percentile_within_team ?? 0) - (a.percentile_within_team ?? 0));
}

export function getRiskRewardRows(rows: PlayerMetricRow[], selectedTeam: string) {
  const players = new Map<string, { playerId: number | null; playerName: string; team: string; risk: number; reward: number; riskMetric: string; rewardMetric: string }>();
  const filtered = rows.filter((row) => selectedTeam === "all" || row.team === selectedTeam);

  for (const row of filtered) {
    if (!row.player_name || !row.team) continue;
    const key = `${row.team}-${row.player_id ?? row.player_name}`;
    const current = players.get(key) ?? {
      playerId: row.player_id,
      playerName: row.player_name,
      team: row.team,
      risk: 0,
      reward: 0,
      riskMetric: "dangerous_losses",
      rewardMetric: "threat_contribution",
    };

    if (row.metric_name === "loss_risk_per_action" || row.metric_name === "dangerous_losses") {
      if ((row.metric_value ?? 0) >= current.risk) {
        current.risk = row.metric_value ?? 0;
        current.riskMetric = row.metric_name;
      }
    }

    if (row.metric_name === "threat_contribution" || row.metric_name === "progression_contribution_share" || row.metric_name === "progressive_passes") {
      if ((row.metric_value ?? 0) >= current.reward) {
        current.reward = row.metric_value ?? 0;
        current.rewardMetric = row.metric_name;
      }
    }

    players.set(key, current);
  }

  return [...players.values()].filter((row) => row.risk > 0 || row.reward > 0);
}

export function getPhysicalMetricNames(rows: TrackingPlayerPhysicalRow[]) {
  return [...new Set(rows.map((row) => row.metric_name).filter(Boolean))].sort() as string[];
}

export function getPhysicalRanking(rows: TrackingPlayerPhysicalRow[], selectedTeam: string, metricName: string) {
  return rows
    .filter((row) => selectedTeam === "all" || row.team === selectedTeam)
    .filter((row) => row.metric_name === metricName)
    .sort((a, b) => (b.metric_value ?? 0) - (a.metric_value ?? 0));
}
