"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FilterSelect } from "@/components/filters/FilterSelect";
import { ConfidenceBadge } from "@/components/tracking/ConfidenceBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricLabel, formatMinute } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { TrackingTeamShapeRow, ConfidenceLevel } from "@/types/data";

const SHAPE_METRICS = [
  "team_width",
  "team_depth",
  "compactness",
  "centroid_x",
  "centroid_y",
  "avg_block_height",
  "defensive_line_height",
  "midfield_line_height",
  "forward_line_height",
  "line_height_gap",
] as const;

export function TeamShapeTimeline({ rows }: { rows: TrackingTeamShapeRow[] }) {
  const availableMetrics = useMemo(
    () => SHAPE_METRICS.filter((m) => rows.some((r) => r.metric_name === m)),
    [rows],
  );

  const [selectedMetric, setSelectedMetric] = useState<string>(availableMetrics[0] ?? "team_width");

  const { chartData, confidence } = useMemo(() => {
    const byMinute = new Map<number, Record<string, unknown>>();
    let conf: ConfidenceLevel = "high";

    for (const row of rows) {
      if (row.metric_name !== selectedMetric || row.minute_bin_5 === null) continue;
      const minute = row.minute_bin_5;
      const current = byMinute.get(minute) ?? { minute };
      const team = row.team ?? "Unknown";
      current[team] = row.metric_value ?? 0;
      byMinute.set(minute, current);
      if (row.confidence_level === "medium" || row.confidence_level === "low") conf = row.confidence_level;
    }

    return {
      chartData: [...byMinute.values()].sort((a, b) => Number(a.minute) - Number(b.minute)),
      confidence: conf,
    };
  }, [rows, selectedMetric]);

  const unit = rows.find((r) => r.metric_name === selectedMetric)?.metric_unit ?? "";

  if (chartData.length === 0) {
    return (
      <article className="dashboard-card flex min-h-[220px] flex-col items-center justify-center p-5 text-center">
        <p className="text-sm text-slate-400">No team shape data available for timeline.</p>
      </article>
    );
  }

  return (
    <article className="dashboard-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Team shape timeline
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            How did team structure evolve?
          </h3>
          <p className="mt-1 max-w-lg text-xs leading-5 text-slate-400">
            Observed spatial metrics per 5-min bin. Structure does not imply tactical intent.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ConfidenceBadge level={confidence} />
          <FilterSelect
            label="Metric"
            value={selectedMetric}
            onChange={setSelectedMetric}
            options={availableMetrics.map((m) => ({ label: formatMetricLabel(m), value: m }))}
            className="sm:w-56"
          />
        </div>
      </div>

      <div className="mt-5 h-[310px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 16, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="shapeGridGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#fff" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="minute"
              tickFormatter={(v) => formatMinute(v)}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            />
            <YAxis
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v: number) => `${v.toFixed(1)}`}
            />
            <Tooltip content={<ShapeTooltip metric={selectedMetric} unit={unit} />} />
            <Legend
              verticalAlign="top"
              height={28}
              formatter={(value: string) => <span className="text-xs text-slate-300">{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="FCM"
              stroke={getTeamColor("FCM")}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="FCK"
              stroke={getTeamColor("FCK")}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

function ShapeTooltip({
  active,
  payload,
  label,
  metric,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string | number; value?: number }>;
  label?: string | number;
  metric: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-white/10 bg-slate-950/95 p-3 text-sm shadow-2xl shadow-black/40">
      <p className="font-semibold text-white">
        {formatMetricLabel(metric)} · {formatMinute(label)}
      </p>
      <div className="mt-2 space-y-1.5">
        {payload.map((item) => {
          const team = String(item.dataKey);
          return (
            <div key={team} className="flex items-center justify-between gap-6">
              <span style={{ color: getTeamColor(team) }} className="font-semibold">
                {team}
              </span>
              <span className="font-mono text-white">
                {formatMetricValue(item.value, "meters")} {unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
