"use client";

import { FilterSelect } from "@/components/filters/FilterSelect";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { StatBadge } from "@/components/ui/StatBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricValue } from "@/lib/formatters/number";
import type { TrackingPlayerPhysicalRow } from "@/types/data";
import { getPhysicalMetricNames, getPhysicalRanking } from "@/components/players/impact/playerImpactUtils";

export function PhysicalOutputRanking({
  rows,
  selectedTeam,
  selectedMetric,
  onMetricChange,
}: {
  rows: TrackingPlayerPhysicalRow[];
  selectedTeam: string;
  selectedMetric: string;
  onMetricChange: (value: string) => void;
}) {
  const metrics = getPhysicalMetricNames(rows);
  const ranking = getPhysicalRanking(rows, selectedTeam, selectedMetric).slice(0, 8);

  return (
    <article className="dashboard-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Physical output ranking</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Tracking-derived load</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Confidence level is shown because tracking metrics vary in reliability.</p>
        </div>
        <FilterSelect
          label="Physical metric"
          value={selectedMetric}
          onChange={onMetricChange}
          options={metrics.map((metric) => ({ label: metric.replaceAll("_", " "), value: metric }))}
          className="sm:w-64"
        />
      </div>

      <div className="mt-5 space-y-3">
        {ranking.map((row, index) => (
          <div key={`${row.team}-${row.player_id}-${row.metric_name}`} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-6 text-center font-mono text-sm text-slate-500">{index + 1}</span>
              <PlayerAvatar playerId={row.player_id} playerName={row.player_name ?? "Unknown player"} team={row.team} size={42} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{row.player_name}</p>
                <p className="text-xs" style={{ color: getTeamColor(row.team) }}>{row.team}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-semibold text-white">{formatMetricValue(row.metric_value, row.metric_unit)}</p>
              <StatBadge tone={row.confidence_level === "high" ? "fcm" : "neutral"}>{row.confidence_level ?? "confidence n/a"}</StatBadge>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
