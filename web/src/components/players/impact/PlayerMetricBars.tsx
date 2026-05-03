"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricValue } from "@/lib/formatters/number";
import type { PlayerMetricRow } from "@/types/data";

export function PlayerMetricBars({
  rows,
  selectedPlayerId,
}: {
  rows: PlayerMetricRow[];
  selectedPlayerId: number | null;
}) {
  const data = rows.slice(0, 12).map((row) => ({
    name: row.player_name,
    percentile: row.percentile_within_team ?? 0,
    team: row.team,
    selected: row.player_id === selectedPlayerId,
  }));

  return (
    <article className="dashboard-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Percentile bars</p>
      <h3 className="mt-2 text-lg font-semibold text-white">Selected metric within team</h3>
      <div className="mt-5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 18, left: 18, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#CBD5E1", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value) => formatMetricValue(Number(value), "%")}
              contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#fff" }}
            />
            <Bar dataKey="percentile" radius={[0, 5, 5, 0]} shape={(props: unknown) => <PercentileBar {...(props as PercentileBarProps)} />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

interface PercentileBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: { team?: string; selected?: boolean };
}

function PercentileBar({ x = 0, y = 0, width = 0, height = 0, payload }: PercentileBarProps) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={5}
      fill={payload?.selected ? "#D8AE57" : getTeamColor(payload?.team)}
      opacity={payload?.selected ? 1 : 0.72}
    />
  );
}
