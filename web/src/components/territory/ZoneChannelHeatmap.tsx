"use client";

import { FilterSelect } from "@/components/filters/FilterSelect";
import { StatBadge } from "@/components/ui/StatBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricLabel } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { TeamZoneMetricRow } from "@/types/data";
import { channels, formatChannel, formatZone, heatmapMetricOptions, sumZoneMetric, zones } from "@/components/territory/territoryUtils";

export function ZoneChannelHeatmap({
  rows,
  selectedTeam,
  selectedMetric,
  onMetricChange,
  onChannelSelect,
}: {
  rows: TeamZoneMetricRow[];
  selectedTeam: string;
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  onChannelSelect: (channel: string) => void;
}) {
  const values = zones.flatMap((zone) =>
    channels.map((channel) => ({
      zone,
      channel,
      value: sumZoneMetric(rows, selectedMetric, selectedTeam, channel, zone),
    })),
  );
  const max = Math.max(...values.map((item) => item.value), 1);

  return (
    <article className="dashboard-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Zone-channel heatmap</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{formatMetricLabel(selectedMetric)}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Event heatmap by tagged zone/channel. This is not real spatial occupation.
          </p>
        </div>
        <FilterSelect label="Metric" value={selectedMetric} onChange={onMetricChange} options={heatmapMetricOptions} className="sm:w-64" />
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-white/10">
        <div className="grid grid-cols-[130px_repeat(3,minmax(0,1fr))] bg-black/30 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          <div className="border-r border-white/10 p-3">Zone</div>
          {channels.map((channel) => (
            <button key={channel} type="button" onClick={() => onChannelSelect(channel)} className="border-r border-white/10 p-3 text-left last:border-r-0 hover:bg-white/[0.04]">
              {formatChannel(channel)}
            </button>
          ))}
        </div>
        {zones.map((zone) => (
          <div key={zone} className="grid grid-cols-[130px_repeat(3,minmax(0,1fr))] border-t border-white/10">
            <div className="border-r border-white/10 bg-black/20 p-3 text-sm font-medium text-slate-300">{formatZone(zone)}</div>
            {channels.map((channel) => {
              const value = values.find((item) => item.zone === zone && item.channel === channel)?.value ?? 0;
              const intensity = value / max;
              const teamColor = selectedTeam === "FCK" ? getTeamColor("FCK") : getTeamColor("FCM");
              return (
                <button
                  key={`${zone}-${channel}`}
                  type="button"
                  onClick={() => onChannelSelect(channel)}
                  className="min-h-20 border-r border-white/10 p-3 text-left transition last:border-r-0 hover:ring-1 hover:ring-inset hover:ring-red-200/30"
                  style={{
                    background: `linear-gradient(135deg, ${teamColor}${Math.round(20 + intensity * 90).toString(16).padStart(2, "0")}, rgba(255,255,255,0.02))`,
                  }}
                  title={`${formatZone(zone)} / ${formatChannel(channel)}: ${formatMetricValue(value, "count")}`}
                >
                  <span className="font-mono text-lg font-semibold text-white">{formatMetricValue(value, selectedMetric === "threat" ? "index" : "count")}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <StatBadge tone="neutral">event-location proxy</StatBadge>
      </div>
    </article>
  );
}
