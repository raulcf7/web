import { StatBadge } from "@/components/ui/StatBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMinute } from "@/lib/formatters/football";
import type { EventMapRow } from "@/types/data";
import { DefensivePitchLines } from "@/components/defensive/DefensivePitch";
import { formatChannel, formatZone, riskTone, toPitchPoint } from "@/components/defensive/defensiveUtils";

export function DangerousLossesMap({ events }: { events: EventMapRow[] }) {
  const highRiskCount = events.filter((event) => riskTone(event) === "high").length;

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Ball losses</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Where did transition risk start?</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Central and defensive-third losses are visually highlighted as risk zones.</p>
        </div>
        <StatBadge tone={highRiskCount > 0 ? "danger" : "neutral"}>{highRiskCount} high risk</StatBadge>
      </div>
      <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-[#102319]">
        <svg viewBox="0 0 112 80" role="img" aria-label="Dangerous losses map" className="h-auto w-full">
          <DefensivePitchLines />
          <rect x="1" y="18" width="36.3" height="44" fill="rgba(248,113,113,0.08)" stroke="rgba(248,113,113,0.15)" strokeWidth="0.35" />
          <rect x="37.3" y="18" width="37.3" height="44" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.12)" strokeWidth="0.35" />
          {events.slice(0, 260).map((event, index) => {
            const point = toPitchPoint(event.x_oriented, event.y_oriented);
            const tone = riskTone(event);
            const color = tone === "high" ? "#F87171" : tone === "medium" ? "#FBBF24" : getTeamColor(event.team_name);
            return (
              <circle key={`${event.event_id}-${index}`} cx={point.x} cy={point.y} r={tone === "high" ? 1.35 : 0.9} fill={color} fillOpacity={0.8} stroke={getTeamColor(event.team_name)} strokeWidth={0.35}>
                <title>{`${event.team_name ?? "Team"} · ${event.player_name ?? "unknown"} · ${formatMinute(event.match_minute)} · ${formatZone(event.zone)} · ${formatChannel(event.channel)} · ${tone} risk`}</title>
              </circle>
            );
          })}
        </svg>
      </div>
    </article>
  );
}
