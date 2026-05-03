"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricValue } from "@/lib/formatters/number";
import type { TeamPeriodMetricRow } from "@/types/data";

export function PeriodMetricBars({
  rows,
  metricName = "final_third_entries",
}: {
  rows: TeamPeriodMetricRow[];
  metricName?: string;
}) {
  const data = [1, 2].map((period) => {
    const periodRows = rows.filter((row) => row.period === period && row.metric_name === metricName);
    return {
      period: `P${period}`,
      FCM: periodRows.find((row) => row.team === "FCM")?.metric_value ?? 0,
      FCK: periodRows.find((row) => row.team === "FCK")?.metric_value ?? 0,
    };
  });

  return (
    <article className="dashboard-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Period split</p>
      <h3 className="mt-2 text-lg font-semibold text-white">Final-third entries by period</h3>
      <div className="mt-5 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="period" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              formatter={(value) => formatMetricValue(Number(value), "count")}
              contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#fff" }}
            />
            <Legend wrapperStyle={{ color: "#CBD5E1", fontSize: 12 }} />
            <Bar dataKey="FCM" fill={getTeamColor("FCM")} radius={[5, 5, 0, 0]} />
            <Bar dataKey="FCK" fill={getTeamColor("FCK")} radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
