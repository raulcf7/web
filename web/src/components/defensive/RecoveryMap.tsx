import { StatBadge } from "@/components/ui/StatBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMinute } from "@/lib/formatters/football";
import type { EventMapRow } from "@/types/data";
import { DefensivePitchLines } from "@/components/defensive/DefensivePitch";
import { formatChannel, formatZone, toPitchPoint } from "@/components/defensive/defensiveUtils";

export function RecoveryMap({ events }: { events: EventMapRow[] }) {
  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Recovery map</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Where did ball recoveries happen?</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Recovery/regain events from event locations. Interceptions and tackles are available as aggregate metrics.</p>
        </div>
        <StatBadge tone="neutral">{events.length} events</StatBadge>
      </div>
      <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-[#102319]">
        <svg viewBox="0 0 112 80" role="img" aria-label="Recovery map" className="h-auto w-full">
          <DefensivePitchLines />
          {events.slice(0, 220).map((event, index) => {
            const point = toPitchPoint(event.x_oriented, event.y_oriented);
            const color = getTeamColor(event.team_name);
            return (
              <circle key={`${event.event_id}-${index}`} cx={point.x} cy={point.y} r={event.event_type === "regain" ? 1.15 : 0.85} fill={color} fillOpacity={0.72} stroke="rgba(255,255,255,0.32)" strokeWidth={0.25}>
                <title>{`${event.team_name ?? "Team"} · ${event.player_name ?? "unknown"} · ${formatMinute(event.match_minute)} · ${formatZone(event.zone)} · ${formatChannel(event.channel)} · ${event.event_type ?? "event"}`}</title>
              </circle>
            );
          })}
        </svg>
      </div>
    </article>
  );
}
