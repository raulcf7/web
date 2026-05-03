"use client";

import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PlayerDetailDrawer } from "@/components/players/impact/PlayerDetailDrawer";
import { PlayerMetricBars } from "@/components/players/impact/PlayerMetricBars";
import { PlayerMetricSelector } from "@/components/players/impact/PlayerMetricSelector";
import { PlayerProfileCard } from "@/components/players/impact/PlayerProfileCard";
import { PlayerRankingTable } from "@/components/players/impact/PlayerRankingTable";
import { PhysicalOutputRanking } from "@/components/players/impact/PhysicalOutputRanking";
import { RiskRewardScatter } from "@/components/players/impact/RiskRewardScatter";
import {
  filterPlayerMetrics,
  getMetricGroups,
  getMetricNames,
  getPhysicalMetricNames,
  getPlayerMetricsForBars,
  getPlayerProfile,
} from "@/components/players/impact/playerImpactUtils";
import type {
  PlayerLookupRow,
  PlayerMetricRow,
  PlayerProfileRow,
  TrackingPlayerPhysicalRow,
} from "@/types/data";
import { useFilters } from "@/hooks/useDashboardFilters";

export function PlayerImpactSection({
  playerMetrics,
  playerProfiles,
  physicalMetrics,
  playerLookup,
}: {
  playerMetrics: PlayerMetricRow[];
  playerProfiles: PlayerProfileRow[];
  physicalMetrics: TrackingPlayerPhysicalRow[];
  playerLookup: PlayerLookupRow[];
}) {
  const { selectedTeam, setSelectedTeam, selectedMetric, setSelectedMetric, selectedPlayer: globalSelectedPlayer, setSelectedPlayer: setGlobalSelectedPlayer } = useFilters();
  const groups = useMemo(() => getMetricGroups(playerMetrics), [playerMetrics]);
  const [selectedGroup, setSelectedGroup] = useState(groups.includes("Progression") ? "Progression" : groups[0] ?? "");
  const physicalOptions = useMemo(() => getPhysicalMetricNames(physicalMetrics), [physicalMetrics]);
  const [selectedPhysicalMetric, setSelectedPhysicalMetric] = useState("distance_covered_m");
  const [search, setSearch] = useState("");
  const [drawerPlayer, setDrawerPlayer] = useState<PlayerMetricRow | null>(null);
  const metricOptions = useMemo(() => getMetricNames(playerMetrics, selectedGroup, selectedTeam), [playerMetrics, selectedGroup, selectedTeam]);
  const effectiveMetric = metricOptions.includes(selectedMetric) ? selectedMetric : metricOptions[0] ?? "";
  const effectivePhysicalMetric = physicalOptions.includes(selectedPhysicalMetric) ? selectedPhysicalMetric : physicalOptions[0] ?? "";

  const rankingRows = useMemo(
    () =>
      filterPlayerMetrics(playerMetrics, {
        selectedTeam,
        selectedGroup,
        selectedMetric: effectiveMetric,
        search,
      }),
    [effectiveMetric, playerMetrics, search, selectedGroup, selectedTeam],
  );
  const selectedPlayerObj = playerMetrics.find((p) => String(p.player_id) === globalSelectedPlayer) ?? null;
  const activePlayer = selectedPlayerObj && rankingRows.some((row) => row.player_id === selectedPlayerObj.player_id && row.team === selectedPlayerObj.team)
    ? selectedPlayerObj
    : rankingRows[0] ?? null;
  const profile = getPlayerProfile(playerProfiles, activePlayer?.player_id, activePlayer?.player_name, activePlayer?.team);
  const bars = getPlayerMetricsForBars(playerMetrics, activePlayer?.team ?? null, selectedGroup, effectiveMetric);

  return (
    <section id="players" className="scroll-mt-6 space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Player Impact"
          title="Which players shaped the match?"
          description="Rankings, profiles and physical outputs are read within team context, not as cross-team absolutes."
          badge="within-team ranks"
        />
        <PlayerMetricSelector
          team={selectedTeam}
          group={selectedGroup}
          metric={selectedMetric}
          groups={groups}
          metrics={metricOptions}
          search={search}
          onTeamChange={setSelectedTeam}
          onGroupChange={setSelectedGroup}
          onMetricChange={(value) => {
            setSelectedMetric(value);
            setGlobalSelectedPlayer("all");
          }}
          onSearchChange={(value) => {
            setSearch(value);
            setGlobalSelectedPlayer("all");
          }}
        />
      </div>

      <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-50">
        Player profiles are descriptive of this match only. Risk metrics need role context; higher value is not always better.
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <PlayerRankingTable
          rows={rankingRows}
          lookup={playerLookup}
          onPlayerSelect={(player) => {
            setGlobalSelectedPlayer(String(player?.player_id ?? "all"));
            setDrawerPlayer(player);
          }}
        />
        <PlayerProfileCard profile={profile} lookup={playerLookup} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PlayerMetricBars rows={bars} selectedPlayerId={activePlayer?.player_id ?? null} />
        <RiskRewardScatter rows={playerMetrics} selectedTeam={selectedTeam} />
      </div>

      <PhysicalOutputRanking
        rows={physicalMetrics}
        selectedTeam={selectedTeam}
        selectedMetric={effectivePhysicalMetric}
        onMetricChange={setSelectedPhysicalMetric}
      />

      <PlayerDetailDrawer
        player={drawerPlayer}
        metrics={playerMetrics}
        profiles={playerProfiles}
        lookup={playerLookup}
        selectedGroup={selectedGroup}
        selectedMetric={effectiveMetric}
        onClose={() => setDrawerPlayer(null)}
      />
    </section>
  );
}
