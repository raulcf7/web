"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatBadge } from "@/components/ui/StatBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMinute } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { MomentumTimelineRow } from "@/types/data";
import { getThreatTimeline } from "@/components/chance/chanceUtils";

export function ThreatTimeline({
  rows,
  selectedMinuteBin,
  onMinuteBinSelect,
}: {
  rows: MomentumTimelineRow[];
  selectedMinuteBin: number | null;
  onMinuteBinSelect: (minute: number | null) => void;
}) {
  const data = getThreatTimeline(rows);

  return (
    <article className="dashboard-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Threat timeline</p>
          <h3 className="mt-2 text-lg font-semibold text-white">When did simplified threat spike?</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Threat is a simplified proxy, not official xT.</p>
        </div>
        <button
          type="button"
          onClick={() => onMinuteBinSelect(null)}
          className="w-fit"
        >
          <StatBadge tone={selectedMinuteBin === null ? "neutral" : "gold"}>
            {selectedMinuteBin === null ? "all bins" : `${selectedMinuteBin}-${selectedMinuteBin + 5}' selected`}
          </StatBadge>
        </button>
      </div>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
            onClick={(event) => {
              const label = Number(event?.activeLabel);
              if (Number.isFinite(label)) onMinuteBinSelect(label);
            }}
          >
            <defs>
              <linearGradient id="chanceFcmThreat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getTeamColor("FCM")} stopOpacity={0.45} />
                <stop offset="95%" stopColor={getTeamColor("FCM")} stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="chanceFckThreat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getTeamColor("FCK")} stopOpacity={0.45} />
                <stop offset="95%" stopColor={getTeamColor("FCK")} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="minute" tickFormatter={(value) => formatMinute(value)} tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ThreatTooltip />} />
            <Area type="monotone" dataKey="FCM" stroke={getTeamColor("FCM")} fill="url(#chanceFcmThreat)" strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} connectNulls />
            <Area type="monotone" dataKey="FCK" stroke={getTeamColor("FCK")} fill="url(#chanceFckThreat)" strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

function ThreatTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string | number; value?: number; payload?: Record<string, unknown> }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="max-w-xs rounded-md border border-white/10 bg-slate-950/95 p-3 text-sm shadow-xl">
      <p className="font-semibold text-white">Simplified Threat · {formatMinute(label)}</p>
      <div className="mt-3 space-y-2">
        {payload.map((item) => {
          const team = String(item.dataKey);
          return (
            <div key={team}>
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold" style={{ color: getTeamColor(team) }}>{team}</span>
                <span className="font-mono text-white">{formatMetricValue(item.value, "index")}</span>
              </div>
              {typeof item.payload?.[`${team}Insight`] === "string" ? (
                <p className="mt-1 text-xs leading-5 text-slate-400">{String(item.payload[`${team}Insight`])}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
