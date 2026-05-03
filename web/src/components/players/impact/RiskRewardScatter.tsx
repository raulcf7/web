"use client";

import { Scatter, ScatterChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricLabel } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { PlayerMetricRow } from "@/types/data";
import { getRiskRewardRows } from "@/components/players/impact/playerImpactUtils";

export function RiskRewardScatter({
  rows,
  selectedTeam,
}: {
  rows: PlayerMetricRow[];
  selectedTeam: string;
}) {
  const data = getRiskRewardRows(rows, selectedTeam);

  return (
    <article className="dashboard-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Risk / reward</p>
      <h3 className="mt-2 text-lg font-semibold text-white">Threat contribution vs loss risk</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">Higher risk is not automatically worse; interpret with role and volume.</p>
      <div className="mt-5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 12, right: 18, left: -12, bottom: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" />
            <XAxis type="number" dataKey="risk" name="Risk" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="number" dataKey="reward" name="Reward" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<RiskRewardTooltip />} />
            <Scatter data={data} shape={(props: unknown) => <ScatterPoint {...(props as ScatterPointProps)} />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

interface ScatterPointProps {
  cx?: number;
  cy?: number;
  payload?: { team?: string };
}

function ScatterPoint({ cx = 0, cy = 0, payload }: ScatterPointProps) {
  return <circle cx={cx} cy={cy} r={5} fill={getTeamColor(payload?.team)} fillOpacity={0.82} stroke="rgba(255,255,255,0.45)" strokeWidth={1} />;
}

function RiskRewardTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { playerName: string; team: string; risk: number; reward: number; riskMetric: string; rewardMetric: string } }>;
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const row = payload[0].payload;

  return (
    <div className="rounded-md border border-white/10 bg-slate-950 p-3 text-sm shadow-xl">
      <p className="font-semibold text-white">{row.playerName}</p>
      <p className="mt-1 text-xs" style={{ color: getTeamColor(row.team) }}>{row.team}</p>
      <p className="mt-3 text-slate-300">{formatMetricLabel(row.rewardMetric)}: {formatMetricValue(row.reward, "index")}</p>
      <p className="text-slate-300">{formatMetricLabel(row.riskMetric)}: {formatMetricValue(row.risk, "count")}</p>
    </div>
  );
}
