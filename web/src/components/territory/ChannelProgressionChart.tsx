"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FilterSelect } from "@/components/filters/FilterSelect";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricLabel } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { TeamZoneMetricRow } from "@/types/data";
import { channels, formatChannel, territoryMetricOptions } from "@/components/territory/territoryUtils";

export function ChannelProgressionChart({
  rows,
  selectedMetric,
  onMetricChange,
  onChannelSelect,
}: {
  rows: TeamZoneMetricRow[];
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  onChannelSelect: (channel: string) => void;
}) {
  const hasMetric = rows.some((row) => row.metric_name === selectedMetric);
  const data = channels.map((channel) => ({
    channel,
    label: formatChannel(channel),
    FCM: sum(rows, selectedMetric, "FCM", channel),
    FCK: sum(rows, selectedMetric, "FCK", channel),
  }));

  return (
    <article className="dashboard-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Progression by channel</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{formatMetricLabel(selectedMetric)}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Grouped by oriented left, central and right channels.</p>
        </div>
        <FilterSelect label="Metric" value={selectedMetric} onChange={onMetricChange} options={territoryMetricOptions} className="sm:w-64" />
      </div>

      {hasMetric ? (
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
              onClick={(event) => {
                const payload = event as { activePayload?: Array<{ payload?: { channel?: string } }> };
                const channel = payload.activePayload?.[0]?.payload?.channel;
                if (channel) onChannelSelect(channel);
              }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                formatter={(value) => formatMetricValue(Number(value), selectedMetric === "vertical_distance_gained" ? "meters" : "count")}
                contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#fff" }}
              />
              <Legend wrapperStyle={{ color: "#CBD5E1", fontSize: 12 }} />
              <Bar dataKey="FCM" fill={getTeamColor("FCM")} radius={[5, 5, 0, 0]} />
              <Bar dataKey="FCK" fill={getTeamColor("FCK")} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.035] p-5 text-sm leading-6 text-slate-400">
          `{formatMetricLabel(selectedMetric)}` is not available by channel in `tableau_team_zone_metrics.csv`.
        </div>
      )}
    </article>
  );
}

function sum(rows: TeamZoneMetricRow[], metricName: string, team: string, channel: string) {
  return rows
    .filter((row) => row.metric_name === metricName && row.team === team && row.channel === channel)
    .reduce((total, row) => total + (row.metric_value ?? 0), 0);
}
