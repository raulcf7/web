"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTeamColor } from "@/lib/assets/assets";
import type { ShotRow } from "@/types/data";
import { getShotsByPhase } from "@/components/chance/chanceUtils";

export function ShotsByPhaseChart({ shots }: { shots: ShotRow[] }) {
  const data = getShotsByPhase(shots);

  return (
    <article className="dashboard-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Shots by phase</p>
      <h3 className="mt-2 text-lg font-semibold text-white">Open play and set-play sources</h3>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="phase" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#fff" }} />
            <Legend wrapperStyle={{ color: "#CBD5E1", fontSize: 12 }} />
            <Bar dataKey="FCM" fill={getTeamColor("FCM")} radius={[5, 5, 0, 0]} />
            <Bar dataKey="FCK" fill={getTeamColor("FCK")} radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
