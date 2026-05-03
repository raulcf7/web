"use client";

import { StatBadge } from "@/components/ui/StatBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricValue } from "@/lib/formatters/number";
import { orientSegmentToTeamGoal } from "@/lib/pitch/orientation";
import type { EventMapRow } from "@/types/data";
import { PitchLines } from "@/components/chance/ShotMap";
import { toPitchPoint } from "@/components/chance/chanceUtils";

export function BoxEntriesMap({ events }: { events: EventMapRow[] }) {
  const sampled = events.slice(0, 180);

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Box entries and threat actions</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Where did access to danger zones happen?</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Includes `is_box_entry = true` and events with positive simplified threat.</p>
        </div>
        <StatBadge tone="neutral">{events.length} events</StatBadge>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-[#102319]">
        <svg viewBox="0 0 112 80" role="img" aria-label="Box entries and threat actions map" className="h-auto w-full">
          <PitchLines />
          {sampled.map((event, index) => {
            const oriented = orientSegmentToTeamGoal(
              {
                x: event.x_oriented,
                y: event.y_oriented,
                endX: event.end_x_oriented,
                endY: event.end_y_oriented,
              },
              event.team_name,
            );
            const start = toPitchPoint(oriented.x, oriented.y);
            const end = toPitchPoint(oriented.endX, oriented.endY);
            const color = event.is_box_entry ? getTeamColor(event.team_name) : "#D8AE57";
            return (
              <g key={`${event.event_id}-${index}`} opacity={event.is_box_entry ? 0.8 : 0.45}>
                <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={event.is_box_entry ? 0.55 : 0.35}>
                  <title>{`${event.team_name ?? "Team"} · ${event.event_type ?? "event"} · threat ${formatMetricValue(event.threat_value, "index")}`}</title>
                </line>
                <circle cx={end.x} cy={end.y} r={event.is_box_entry ? 0.9 : 0.55} fill={color} />
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-4 text-sm text-slate-400">Showing first {sampled.length.toLocaleString("en-GB")} filtered events for readability.</p>
    </article>
  );
}
