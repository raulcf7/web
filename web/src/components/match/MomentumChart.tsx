"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FilterSelect } from "@/components/filters/FilterSelect";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricLabel, formatMinute } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { MomentumTimelineRow } from "@/types/data";

const preferredMetrics = ["threat", "box_entries", "attacking_third_actions", "final_third_entries"] as const;

export function MomentumChart({
  rows,
  selectedMetric,
  onMetricChange,
}: {
  rows: MomentumTimelineRow[];
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
}) {
  const availableMetrics = preferredMetrics.filter((metric) => rows.some((row) => row.metric_name === metric));
  const activeMetric = availableMetrics.includes(selectedMetric as (typeof preferredMetrics)[number])
    ? selectedMetric
    : availableMetrics[0] ?? selectedMetric;
  const chartData = buildChartData(rows, activeMetric);

  if (chartData.length === 0) {
    return (
      <article className="dashboard-card min-h-[360px] p-5">
        <ChartHeader
          availableMetrics={availableMetrics}
          selectedMetric={activeMetric}
          onMetricChange={onMetricChange}
        />
        <div className="mt-6 grid h-64 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-sm text-slate-400">
          Momentum data unavailable for this metric.
        </div>
      </article>
    );
  }

  return (
    <article className="dashboard-card p-5">
      <ChartHeader
        availableMetrics={availableMetrics}
        selectedMetric={activeMetric}
        onMetricChange={onMetricChange}
      />
      <div className="mt-6 h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="fcmMomentum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getTeamColor("FCM")} stopOpacity={0.5} />
                <stop offset="95%" stopColor={getTeamColor("FCM")} stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="fckMomentum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getTeamColor("FCK")} stopOpacity={0.45} />
                <stop offset="95%" stopColor={getTeamColor("FCK")} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="minute"
              tickFormatter={(value) => formatMinute(value)}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={42}
            />
            <Tooltip content={<MomentumTooltip metric={activeMetric} />} />
            <Area
              type="monotone"
              dataKey="FCM"
              stroke={getTeamColor("FCM")}
              fill="url(#fcmMomentum)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="FCK"
              stroke={getTeamColor("FCK")}
              fill="url(#fckMomentum)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

function ChartHeader({
  availableMetrics,
  selectedMetric,
  onMetricChange,
}: {
  availableMetrics: readonly string[];
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Momentum timeline</p>
        <h3 className="mt-2 text-lg font-semibold text-white">When did control or danger shift?</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Binned event data by team. Read spikes as moments to investigate, not automatic tactical intent.
        </p>
      </div>
      <FilterSelect
        label="Metric"
        value={selectedMetric}
        onChange={onMetricChange}
        options={availableMetrics.map((metric) => ({
          label: formatMetricLabel(metric),
          value: metric,
        }))}
        className="sm:w-64"
      />
    </div>
  );
}

function buildChartData(rows: MomentumTimelineRow[], metricName: string) {
  const byMinute = new Map<number, Record<string, unknown>>();

  for (const row of rows) {
    if (row.metric_name !== metricName || row.minute_bin === null) {
      continue;
    }

    const minute = row.minute_bin;
    const current = byMinute.get(minute) ?? { minute };
    const team = row.team ?? "Unknown";
    current[team] = row.metric_value ?? 0;
    current[`${team}Insight`] = row.insight_text;
    current[`${team}Label`] = row.interpretation_label;
    byMinute.set(minute, current);
  }

  return [...byMinute.values()].sort((a, b) => Number(a.minute) - Number(b.minute));
}

function MomentumTooltip({
  active,
  payload,
  label,
  metric,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string | number; value?: number; payload?: Record<string, unknown> }>;
  label?: string | number;
  metric: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="max-w-xs rounded-md border border-white/10 bg-slate-950/95 p-3 text-sm shadow-2xl shadow-black/40">
      <p className="font-semibold text-white">{formatMetricLabel(metric)} · {formatMinute(label)}</p>
      <div className="mt-3 space-y-3">
        {payload.map((item) => {
          const team = String(item.dataKey);
          const insight = item.payload?.[`${team}Insight`];

          return (
            <div key={team}>
              <div className="flex items-center justify-between gap-4">
                <span style={{ color: getTeamColor(team) }} className="font-semibold">{team}</span>
                <span className="font-mono text-white">{formatMetricValue(item.value, metric === "threat" ? "index" : "count")}</span>
              </div>
              {typeof insight === "string" ? <p className="mt-1 text-xs leading-5 text-slate-400">{insight}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
