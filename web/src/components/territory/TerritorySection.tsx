"use client";

import { useMemo, useState } from "react";
import { FilterSelect } from "@/components/filters/FilterSelect";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ChannelProgressionChart } from "@/components/territory/ChannelProgressionChart";
import { FieldTiltComparison } from "@/components/territory/FieldTiltComparison";
import { MetricExplanationCard } from "@/components/territory/MetricExplanationCard";
import { PeriodMetricBars } from "@/components/territory/PeriodMetricBars";
import { PossessionDirectnessPanel } from "@/components/territory/PossessionDirectnessPanel";
import { ProgressiveActionsPitch } from "@/components/territory/ProgressiveActionsPitch";
import { ZoneChannelHeatmap } from "@/components/territory/ZoneChannelHeatmap";
import { filterTerritoryEvents } from "@/components/territory/territoryUtils";
import { useFilters } from "@/hooks/useDashboardFilters";
import type {
  EventMapRow,
  MatchSummaryRow,
  PossessionSequenceRow,
  TeamPeriodMetricRow,
  TeamZoneMetricRow,
} from "@/types/data";

export function TerritorySection({
  matchSummary,
  teamPeriodMetrics,
  teamZoneMetrics,
  eventMap,
  possessionSequences,
}: {
  matchSummary: MatchSummaryRow[];
  teamPeriodMetrics: TeamPeriodMetricRow[];
  teamZoneMetrics: TeamZoneMetricRow[];
  eventMap: EventMapRow[];
  possessionSequences: PossessionSequenceRow[];
}) {
  const { selectedTeam, setSelectedTeam, selectedPeriod, setSelectedPeriod } = useFilters();
  const [progressionMetric, setProgressionMetric] = useState("progressive_passes");
  const [heatmapMetric, setHeatmapMetric] = useState("total_actions");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [actionFilter, setActionFilter] = useState<"progressive" | "final_third" | "both">("both");

  const filteredPitchEvents = useMemo(
    () =>
      filterTerritoryEvents(eventMap, {
        selectedTeam,
        selectedPeriod,
        selectedChannel,
        actionFilter,
      }),
    [actionFilter, eventMap, selectedChannel, selectedPeriod, selectedTeam],
  );

  return (
    <section id="territory" className="scroll-mt-6 space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Territory & Progression"
          title="Who controlled the field, and did progression reach advantage zones?"
          description="This section separates territorial dominance from productive progression through channels, zones and possession outcomes."
          badge="oriented pitch"
        />
        <div className="flex flex-wrap gap-3">
          <FilterSelect
            label="Team"
            value={selectedTeam}
            onChange={setSelectedTeam}
            options={[
              { label: "All teams", value: "all" },
              { label: "FCM", value: "FCM" },
              { label: "FCK", value: "FCK" },
            ]}
          />
          <FilterSelect
            label="Period"
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            options={[
              { label: "Full match", value: "all" },
              { label: "First half", value: "1" },
              { label: "Second half", value: "2" },
            ]}
          />
        </div>
      </div>

      <MetricExplanationCard />

      <div className="grid gap-4 xl:grid-cols-2">
        <FieldTiltComparison matchRows={matchSummary} periodRows={teamPeriodMetrics} selectedPeriod={selectedPeriod} />
        <PeriodMetricBars rows={teamPeriodMetrics} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <ChannelProgressionChart
          rows={teamZoneMetrics}
          selectedMetric={progressionMetric}
          onMetricChange={setProgressionMetric}
          onChannelSelect={setSelectedChannel}
        />
        <ZoneChannelHeatmap
          rows={teamZoneMetrics}
          selectedTeam={selectedTeam}
          selectedMetric={heatmapMetric}
          onMetricChange={setHeatmapMetric}
          onChannelSelect={setSelectedChannel}
        />
      </div>

      <ProgressiveActionsPitch
        events={filteredPitchEvents}
        selectedChannel={selectedChannel}
        onChannelChange={setSelectedChannel}
        actionFilter={actionFilter}
        onActionFilterChange={setActionFilter}
      />

      <PossessionDirectnessPanel rows={possessionSequences} selectedTeam={selectedTeam} selectedPeriod={selectedPeriod} />
    </section>
  );
}
