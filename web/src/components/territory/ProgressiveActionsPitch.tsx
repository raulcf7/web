"use client";

import { FilterSelect } from "@/components/filters/FilterSelect";
import { StatBadge } from "@/components/ui/StatBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { orientSegmentToTeamGoal, toPitchPoint } from "@/lib/pitch/orientation";
import { formatChannel } from "@/components/territory/territoryUtils";
import type { EventMapRow } from "@/types/data";

export function ProgressiveActionsPitch({
  events,
  selectedChannel,
  onChannelChange,
  actionFilter,
  onActionFilterChange,
}: {
  events: EventMapRow[];
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
  actionFilter: "progressive" | "final_third" | "both";
  onActionFilterChange: (value: "progressive" | "final_third" | "both") => void;
}) {
  const sampled = events.slice(0, 140);

  return (
    <article className="dashboard-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Progressive actions pitch</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Actions moving toward advantage zones</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Drawn with oriented coordinates, so both teams attack from left to right.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <FilterSelect
            label="Channel"
            value={selectedChannel}
            onChange={onChannelChange}
            options={[
              { label: "All channels", value: "all" },
              { label: "Left", value: "left_channel" },
              { label: "Central", value: "central_channel" },
              { label: "Right", value: "right_channel" },
            ]}
          />
          <FilterSelect
            label="Action"
            value={actionFilter}
            onChange={(value) => onActionFilterChange(value as "progressive" | "final_third" | "both")}
            options={[
              { label: "Progressive + final third", value: "both" },
              { label: "Progressive only", value: "progressive" },
              { label: "Final-third entries", value: "final_third" },
            ]}
          />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-[#102319]">
        <svg viewBox="0 0 112 80" role="img" aria-label="Oriented pitch map of progressive actions" className="h-auto w-full">
          <defs>
            <marker id="arrow-fcm" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={getTeamColor("FCM")} />
            </marker>
            <marker id="arrow-fck" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={getTeamColor("FCK")} />
            </marker>
          </defs>
          <rect x="0" y="0" width="112" height="80" fill="#102319" />
          <rect x="1" y="1" width="110" height="78" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="0.55" />
          <line x1="56" y1="1" x2="56" y2="79" stroke="rgba(255,255,255,0.35)" strokeWidth="0.45" />
          <circle cx="56" cy="40" r="9.15" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.45" />
          <rect x="1" y="18" width="16.5" height="44" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.45" />
          <rect x="94.5" y="18" width="16.5" height="44" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.45" />
          <line x1="74.6" y1="1" x2="74.6" y2="79" stroke="rgba(255,255,255,0.15)" strokeWidth="0.35" strokeDasharray="2 2" />
          {sampled.map((event, index) => {
            const team = event.team_name ?? "FCM";
            const color = getTeamColor(team);
            const marker = team === "FCK" ? "url(#arrow-fck)" : "url(#arrow-fcm)";
            const oriented = orientSegmentToTeamGoal(
              {
                x: event.x_oriented,
                y: event.y_oriented,
                endX: event.end_x_oriented,
                endY: event.end_y_oriented,
              },
              team,
            );
            const start = toPitchPoint({ x: oriented.x, y: oriented.y });
            const end = toPitchPoint({ x: oriented.endX, y: oriented.endY });
            return (
              <g key={`${event.event_id}-${index}`} opacity={event.is_final_third_entry ? 0.95 : 0.55}>
                <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={event.is_final_third_entry ? 0.75 : 0.45} markerEnd={marker}>
                  <title>{`${team} ${event.player_name ?? "unknown"} · ${event.event_type ?? "event"} · ${formatChannel(event.channel ?? "all")}`}</title>
                </line>
                <circle cx={start.x} cy={start.y} r={0.65} fill={color} />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">{events.length.toLocaleString("en-GB")} actions match the current filters. Showing first {sampled.length.toLocaleString("en-GB")}.</p>
        <StatBadge tone="neutral">oriented coordinates</StatBadge>
      </div>
    </article>
  );
}
