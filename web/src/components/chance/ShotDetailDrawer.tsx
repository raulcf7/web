"use client";

import { X } from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { StatBadge } from "@/components/ui/StatBadge";
import { TeamIdentity } from "@/components/ui/TeamIdentity";
import { formatMinute } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { ShotRow } from "@/types/data";
import { formatPhaseLabel, getShotPhase } from "@/components/chance/chanceUtils";

export function ShotDetailDrawer({
  shot,
  onClose,
}: {
  shot: ShotRow | null;
  onClose: () => void;
}) {
  if (!shot) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Close shot detail" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-slate-950 p-5 shadow-2xl shadow-black">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <PlayerAvatar playerId={shot.player_id} playerName={shot.player_name ?? "Unknown player"} team={shot.team_name} size={54} />
            <div>
              <p className="text-lg font-semibold text-white">{shot.player_name ?? "Unknown player"}</p>
              <p className="text-sm text-slate-400">{formatMinute(shot.match_minute)} · {formatPhaseLabel(getShotPhase(shot))}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/10">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <TeamIdentity team={shot.team_name ?? "Unknown"} crestSize={42} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <DetailStat label="xG" value={formatMetricValue(shot.xg, "xG")} />
          <DetailStat label="Outcome" value={shot.shot_outcome ?? "-"} />
          <DetailStat label="Distance" value={`${formatMetricValue(shot.shot_distance_m, "meters")}m`} />
          <DetailStat label="Angle" value={`${formatMetricValue(shot.shot_angle, "degrees")}°`} />
          <DetailStat label="Set play" value={shot.set_play_type ?? "Open play"} />
          <DetailStat label="From box" value={shot.is_from_box ? "Yes" : "No"} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {shot.is_goal ? <StatBadge tone="gold">goal</StatBadge> : null}
          {shot.is_on_target ? <StatBadge tone="fcm">on target</StatBadge> : null}
          <StatBadge tone="neutral">{shot.shot_technique ?? "technique unknown"}</StatBadge>
        </div>

        {shot.insight_text ? (
          <p className="mt-5 rounded-lg border border-red-300/20 bg-red-500/10 p-4 text-sm leading-6 text-red-50">
            {shot.insight_text}
          </p>
        ) : null}
      </aside>
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
