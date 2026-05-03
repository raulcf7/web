"use client";

import { FilterSelect } from "@/components/filters/FilterSelect";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricLabel } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { MatchSummaryRow, TeamPeriodMetricRow, TeamZoneMetricRow } from "@/types/data";
import { defensiveChannels, defensiveMetrics, defensiveZones, formatChannel, formatZone, getDefensiveZoneMatrix } from "@/components/defensive/defensiveUtils";

export function DefensiveActionsByZone({
  rows,
  aggregateRows,
  periodRows,
  selectedPeriod,
  selectedTeam,
  selectedMetric,
  onMetricChange,
  onZoneSelect,
}: {
  rows: TeamZoneMetricRow[];
  aggregateRows: MatchSummaryRow[];
  periodRows: TeamPeriodMetricRow[];
  selectedPeriod: string;
  selectedTeam: string;
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  onZoneSelect: (zone: string) => void;
}) {
  const matrix = getDefensiveZoneMatrix(rows, selectedMetric, selectedTeam);
  const teamColor = selectedTeam === "FCK" ? getTeamColor("FCK") : getTeamColor("FCM");
  const hasZoneBreakdown = rows.some((row) => row.metric_name === selectedMetric);

  return (
    <article className="dashboard-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Defensive actions by zone</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{formatMetricLabel(selectedMetric)}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Aggregate metrics by zone/channel. This is action location, not pressure intensity.</p>
        </div>
        <FilterSelect label="Metric" value={selectedMetric} onChange={onMetricChange} options={defensiveMetrics} className="sm:w-60" />
      </div>

      {!hasZoneBreakdown ? (
        <AggregateFallback
          metricName={selectedMetric}
          selectedPeriod={selectedPeriod}
          aggregateRows={aggregateRows}
          periodRows={periodRows}
        />
      ) : (
        <div className="mt-5 overflow-hidden rounded-lg border border-white/10">
        <div className="grid grid-cols-[130px_repeat(3,minmax(0,1fr))] bg-black/30 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          <div className="border-r border-white/10 p-3">Zone</div>
          {defensiveChannels.map((channel) => (
            <div key={channel} className="border-r border-white/10 p-3 last:border-r-0">{formatChannel(channel)}</div>
          ))}
        </div>
        {defensiveZones.map((zone) => (
          <div key={zone} className="grid grid-cols-[130px_repeat(3,minmax(0,1fr))] border-t border-white/10">
            <button type="button" onClick={() => onZoneSelect(zone)} className="border-r border-white/10 bg-black/20 p-3 text-left text-sm font-medium text-slate-300 hover:bg-white/[0.04]">
              {formatZone(zone)}
            </button>
            {defensiveChannels.map((channel) => {
              const value = matrix.values.find((item) => item.zone === zone && item.channel === channel)?.value ?? 0;
              const alpha = Math.round(18 + (value / matrix.max) * 95).toString(16).padStart(2, "0");
              return (
                <button
                  key={`${zone}-${channel}`}
                  type="button"
                  onClick={() => onZoneSelect(zone)}
                  className="min-h-20 border-r border-white/10 p-3 text-left transition last:border-r-0 hover:ring-1 hover:ring-inset hover:ring-red-200/30"
                  style={{ background: `linear-gradient(135deg, ${teamColor}${alpha}, rgba(255,255,255,0.02))` }}
                >
                  <span className="font-mono text-lg font-semibold text-white">{formatMetricValue(value, "count")}</span>
                </button>
              );
            })}
          </div>
        ))}
        </div>
      )}
    </article>
  );
}

function AggregateFallback({
  metricName,
  selectedPeriod,
  aggregateRows,
  periodRows,
}: {
  metricName: string;
  selectedPeriod: string;
  aggregateRows: MatchSummaryRow[];
  periodRows: TeamPeriodMetricRow[];
}) {
  const sourceRows = selectedPeriod === "all" ? aggregateRows : periodRows.filter((row) => row.period === Number(selectedPeriod));
  const values = ["FCM", "FCK"].map((team) => ({
    team,
    value: sourceRows.find((row) => row.team === team && row.metric_name === metricName)?.metric_value ?? null,
    unit: sourceRows.find((row) => row.metric_name === metricName)?.metric_unit ?? "count",
  }));

  return (
    <div className="mt-5 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
      <p className="text-sm leading-6 text-amber-50">
        `tableau_team_zone_metrics.csv` does not include a zone/channel breakdown for {formatMetricLabel(metricName)}.
        Showing aggregate totals instead of a misleading zero heatmap.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {values.map((row) => (
          <div key={row.team} className="rounded-md border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-semibold" style={{ color: getTeamColor(row.team) }}>{row.team}</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-white">{formatMetricValue(row.value, row.unit)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
