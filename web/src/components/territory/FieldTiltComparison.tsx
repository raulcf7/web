"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTeamColor } from "@/lib/assets/assets";
import { formatPercent } from "@/lib/formatters/number";
import type { MatchSummaryRow, TeamPeriodMetricRow } from "@/types/data";
import { getMetricByTeam } from "@/components/territory/territoryUtils";

export function FieldTiltComparison({
  matchRows,
  periodRows,
  selectedPeriod,
}: {
  matchRows: MatchSummaryRow[];
  periodRows: TeamPeriodMetricRow[];
  selectedPeriod: string;
}) {
  const rows = selectedPeriod === "all" ? matchRows : periodRows;
  const data = getMetricByTeam(rows, selectedPeriod === "all" ? "field_tilt" : "field_tilt", selectedPeriod);

  return (
    <article className="dashboard-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Territorial control</p>
      <h3 className="mt-2 text-lg font-semibold text-white">Field tilt comparison</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Share of attacking-third action volume. This reads territory, not chance quality by itself.
      </p>
      <div className="mt-5 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
            <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => formatPercent(Number(value))} tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="team" tick={{ fill: "#E2E8F0", fontSize: 12 }} axisLine={false} tickLine={false} width={42} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0]?.payload as { team: string; value: number };
                return (
                  <div className="rounded-md border border-white/10 bg-slate-950 p-3 text-sm shadow-xl">
                    <p className="font-semibold text-white">{item.team}</p>
                    <p className="mt-1 font-mono text-slate-300">{formatPercent(item.value)}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} fill={getTeamColor("FCM")} shape={(props: unknown) => <FieldTiltBar {...(props as FieldTiltBarProps)} />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

interface FieldTiltBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: { team?: string };
}

function FieldTiltBar(props: FieldTiltBarProps) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  return <rect x={x} y={y} width={width} height={height} rx={6} fill={getTeamColor(payload?.team)} />;
}
