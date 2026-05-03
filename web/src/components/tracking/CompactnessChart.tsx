"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ConfidenceBadge } from "@/components/tracking/ConfidenceBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMinute } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { TrackingTeamShapeRow, ConfidenceLevel } from "@/types/data";

export function CompactnessChart({ rows }: { rows: TrackingTeamShapeRow[] }) {
  const { chartData, confidence } = useMemo(() => {
    const byMinute = new Map<number, Record<string, unknown>>();
    let conf: ConfidenceLevel = "high";

    for (const row of rows) {
      if (row.metric_name !== "compactness" || row.minute_bin_5 === null) continue;
      const minute = row.minute_bin_5;
      const current = byMinute.get(minute) ?? { minute };
      current[row.team ?? "Unknown"] = row.metric_value ?? 0;
      byMinute.set(minute, current);
      if (row.confidence_level === "medium" || row.confidence_level === "low") conf = row.confidence_level;
    }

    return {
      chartData: [...byMinute.values()].sort((a, b) => Number(a.minute) - Number(b.minute)),
      confidence: conf,
    };
  }, [rows]);

  if (chartData.length === 0) {
    return (
      <article className="dashboard-card flex min-h-[220px] flex-col items-center justify-center p-5 text-center">
        <p className="text-sm text-slate-400">No compactness data available.</p>
      </article>
    );
  }

  return (
    <article className="dashboard-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Compactness timeline
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            How compact was each team&apos;s structure?
          </h3>
          <p className="mt-1 max-w-lg text-xs leading-5 text-slate-400">
            Compactness measures the observed average inter-player distance — lower values mean a
            tighter block. This is a structural observation, not a tactical evaluation.
          </p>
        </div>
        <ConfidenceBadge level={confidence} />
      </div>

      <div className="mt-5 h-[270px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="compFcm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getTeamColor("FCM")} stopOpacity={0.4} />
                <stop offset="95%" stopColor={getTeamColor("FCM")} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="compFck" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getTeamColor("FCK")} stopOpacity={0.35} />
                <stop offset="95%" stopColor={getTeamColor("FCK")} stopOpacity={0.02} />
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
              tickFormatter={(v: number) => `${v.toFixed(1)}m`}
            />
            <Tooltip content={<CompactnessTooltip />} />
            <Area
              type="monotone"
              dataKey="FCM"
              stroke={getTeamColor("FCM")}
              fill="url(#compFcm)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="FCK"
              stroke={getTeamColor("FCK")}
              fill="url(#compFck)"
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

function CompactnessTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string | number; value?: number }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-white/10 bg-slate-950/95 p-3 text-sm shadow-2xl shadow-black/40">
      <p className="font-semibold text-white">Compactness · {formatMinute(label)}</p>
      <div className="mt-2 space-y-1.5">
        {payload.map((item) => {
          const team = String(item.dataKey);
          return (
            <div key={team} className="flex items-center justify-between gap-6">
              <span style={{ color: getTeamColor(team) }} className="font-semibold">
                {team}
              </span>
              <span className="font-mono text-white">{formatMetricValue(item.value, "meters")} m</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
