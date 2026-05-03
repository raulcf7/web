"use client";

import { getTeamColor } from "@/lib/assets/assets";
import { formatMinute } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import { orientPointToTeamGoal } from "@/lib/pitch/orientation";
import type { ShotRow } from "@/types/data";
import { formatPhaseLabel, getShotPhase, toPitchPoint } from "@/components/chance/chanceUtils";

export function ShotMap({
  shots,
  selectedShot,
  onShotSelect,
}: {
  shots: ShotRow[];
  selectedShot: ShotRow | null;
  onShotSelect: (shot: ShotRow) => void;
}) {
  return (
    <article className="dashboard-card p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Shot map</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Location and quality of attempts</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Bubble size is xG. Border shape highlights goals and on-target attempts.</p>
        </div>
        <p className="text-sm text-slate-400">{shots.length} shots</p>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-[#102319]">
        <svg viewBox="0 0 112 80" role="img" aria-label="Shot map using oriented coordinates" className="h-auto w-full">
          <PitchLines />
          {shots.map((shot) => {
            const oriented = orientPointToTeamGoal({ x: shot.x_oriented, y: shot.y_oriented }, shot.team_name);
            const point = toPitchPoint(oriented.x, oriented.y);
            const radius = Math.max(1.15, Math.min(4.2, 1.2 + (shot.xg ?? 0) * 4.2));
            const color = shot.is_goal ? "#D8AE57" : getTeamColor(shot.team_name);
            const isSelected = selectedShot?.event_id === shot.event_id;

            return (
              <g
                key={shot.event_id ?? `${shot.team_name}-${shot.match_minute}-${shot.player_name}`}
                role="button"
                tabIndex={0}
                onClick={() => onShotSelect(shot)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    onShotSelect(shot);
                  }
                }}
                aria-label={`${shot.player_name ?? "Unknown player"} shot ${formatMinute(shot.match_minute)}`}
                className="cursor-pointer outline-none"
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isSelected ? radius + 1.1 : radius}
                  fill={color}
                  fillOpacity={shot.shot_outcome === "block" ? 0.45 : 0.82}
                  stroke={shot.is_goal ? "#FEF3C7" : shot.is_on_target ? "#FFFFFF" : "rgba(255,255,255,0.35)"}
                  strokeWidth={shot.is_goal ? 0.75 : shot.is_on_target ? 0.55 : 0.25}
                >
                  <title>{`${shot.player_name ?? "Unknown"} · ${shot.team_name ?? "Team"} · ${formatMinute(shot.match_minute)} · xG ${formatMetricValue(shot.xg, "xG")} · ${shot.shot_outcome ?? "unknown"} · ${formatPhaseLabel(getShotPhase(shot))}`}</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
    </article>
  );
}

export function PitchLines() {
  return (
    <>
      <rect x="0" y="0" width="112" height="80" fill="#102319" />
      <rect x="1" y="1" width="110" height="78" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="0.55" />
      <line x1="56" y1="1" x2="56" y2="79" stroke="rgba(255,255,255,0.35)" strokeWidth="0.45" />
      <circle cx="56" cy="40" r="9.15" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.45" />
      <rect x="1" y="18" width="16.5" height="44" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.45" />
      <rect x="94.5" y="18" width="16.5" height="44" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.45" />
      <rect x="1" y="30" width="5.5" height="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.35" />
      <rect x="105.5" y="30" width="5.5" height="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.35" />
      <line x1="74.6" y1="1" x2="74.6" y2="79" stroke="rgba(255,255,255,0.12)" strokeWidth="0.35" strokeDasharray="2 2" />
    </>
  );
}
