"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FilterSelect } from "@/components/filters/FilterSelect";
import { ConfidenceBadge } from "@/components/tracking/ConfidenceBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricLabel } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { TrackingPlayerPhysicalRow, ConfidenceLevel } from "@/types/data";

const PHYSICAL_METRICS = [
  "distance_covered_m",
  "high_speed_distance_m",
  "sprint_distance_m",
  "max_speed_kmh",
  "avg_speed_kmh",
] as const;

export function PhysicalMetricsPanel({ rows }: { rows: TrackingPlayerPhysicalRow[] }) {
  const availableMetrics = useMemo(
    () =>
      PHYSICAL_METRICS.filter(
        (m) => rows.some((r) => r.metric_name === m && (r.metric_value ?? 0) > 0),
      ),
    [rows],
  );

  const [selectedMetric, setSelectedMetric] = useState<string>(
    availableMetrics[0] ?? "distance_covered_m",
  );
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  const { players, confidence } = useMemo(() => {
    let conf: ConfidenceLevel = "high";
    const filtered = rows
      .filter((r) => r.metric_name === selectedMetric && (r.metric_value ?? 0) > 0)
      .filter((r) => selectedTeam === "all" || r.team === selectedTeam);

    for (const r of filtered) {
      if (r.confidence_level === "medium" || r.confidence_level === "low") conf = r.confidence_level;
    }

    const sorted = [...filtered].sort(
      (a, b) => (b.metric_value ?? 0) - (a.metric_value ?? 0),
    );
    return { players: sorted, confidence: conf };
  }, [rows, selectedMetric, selectedTeam]);

  const unit = rows.find((r) => r.metric_name === selectedMetric)?.metric_unit ?? "";

  if (players.length === 0) {
    return (
      <article className="dashboard-card flex min-h-[220px] flex-col items-center justify-center p-5 text-center">
        <p className="text-sm text-slate-400">No physical tracking data available.</p>
      </article>
    );
  }

  const chartData = players.map((r) => ({
    name: r.player_name ?? "Unknown",
    value: r.metric_value ?? 0,
    team: r.team ?? "",
    confidence: r.confidence_level,
  }));

  return (
    <article className="dashboard-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Physical output
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">Player physical rankings</h3>
          <p className="mt-1 max-w-lg text-xs leading-5 text-slate-400">
            Tracking-derived physical output per player. Players with 0 minutes (subs unused) are
            excluded.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ConfidenceBadge level={confidence} />
          <FilterSelect
            label="Team"
            value={selectedTeam}
            onChange={setSelectedTeam}
            options={[
              { label: "All teams", value: "all" },
              { label: "FCM", value: "FCM" },
              { label: "FCK", value: "FCK" },
            ]}
          />
          <FilterSelect
            label="Metric"
            value={selectedMetric}
            onChange={setSelectedMetric}
            options={availableMetrics.map((m) => ({
              label: formatMetricLabel(m),
              value: m,
            }))}
            className="sm:w-56"
          />
        </div>
      </div>

      <div className="mt-5" style={{ height: Math.max(280, chartData.length * 32 + 40) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickFormatter={(v: number) => formatMetricValue(v, unit)}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fill: "#CBD5E1", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<PhysicalTooltip metric={selectedMetric} unit={unit} />} />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              maxBarSize={22}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getTeamColor(entry.team)}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

function PhysicalTooltip({
  active,
  payload,
  metric,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { name?: string; value?: number; team?: string; confidence?: string } }>;
  metric: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className="rounded-md border border-white/10 bg-slate-950/95 p-3 text-sm shadow-2xl shadow-black/40">
      <p className="font-semibold text-white">{d.name}</p>
      <p className="mt-1 text-slate-400">
        <span style={{ color: getTeamColor(d.team ?? "") }} className="font-semibold">
          {d.team}
        </span>{" "}
        · {formatMetricLabel(metric)}
      </p>
      <p className="mt-1 font-mono text-white">
        {formatMetricValue(d.value, unit)} {unit}
      </p>
      {d.confidence ? (
        <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
          {d.confidence} confidence
        </p>
      ) : null}
    </div>
  );
}
