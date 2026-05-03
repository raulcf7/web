"use client";

import { X } from "lucide-react";
import { PlayerProfileCard } from "@/components/players/impact/PlayerProfileCard";
import { PlayerMetricBars } from "@/components/players/impact/PlayerMetricBars";
import type { PlayerLookupRow, PlayerMetricRow, PlayerProfileRow } from "@/types/data";
import { getPlayerMetricsForBars, getPlayerProfile } from "@/components/players/impact/playerImpactUtils";

export function PlayerDetailDrawer({
  player,
  metrics,
  profiles,
  lookup,
  selectedGroup,
  selectedMetric,
  onClose,
}: {
  player: PlayerMetricRow | null;
  metrics: PlayerMetricRow[];
  profiles: PlayerProfileRow[];
  lookup: PlayerLookupRow[];
  selectedGroup: string;
  selectedMetric: string;
  onClose: () => void;
}) {
  if (!player) return null;

  const profile = getPlayerProfile(profiles, player.player_id, player.player_name, player.team);
  const bars = getPlayerMetricsForBars(metrics, player.team, selectedGroup, selectedMetric);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Close player detail" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-slate-950 p-5 shadow-2xl shadow-black">
        <div className="mb-4 flex justify-end">
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/10">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="space-y-4">
          <PlayerProfileCard profile={profile} lookup={lookup} />
          <PlayerMetricBars rows={bars} selectedPlayerId={player.player_id} />
        </div>
      </aside>
    </div>
  );
}
