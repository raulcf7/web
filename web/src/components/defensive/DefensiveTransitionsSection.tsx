"use client";

import { useMemo, useState } from "react";
import { FilterSelect } from "@/components/filters/FilterSelect";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DefensiveActionsByZone } from "@/components/defensive/DefensiveActionsByZone";
import { DefensiveInsightList } from "@/components/defensive/DefensiveInsightList";
import { DangerousLossesMap } from "@/components/defensive/DangerousLossesMap";
import { HighRecoveriesCard } from "@/components/defensive/HighRecoveriesCard";
import { RecoveryMap } from "@/components/defensive/RecoveryMap";
import { RiskZonesPanel } from "@/components/defensive/RiskZonesPanel";
import { TransitionOutcomesPanel } from "@/components/defensive/TransitionOutcomesPanel";
import {
  type DefensiveEventFilter,
  filterDefensiveEvents,
  filterLossEvents,
} from "@/components/defensive/defensiveUtils";
import { useFilters } from "@/hooks/useDashboardFilters";
import type { EventMapRow, InsightFlagRow, MatchSummaryRow, TeamPeriodMetricRow, TeamZoneMetricRow } from "@/types/data";

export function DefensiveTransitionsSection({
  eventMap,
  matchSummary,
  teamPeriodMetrics,
  teamZoneMetrics,
  insightFlags,
}: {
  eventMap: EventMapRow[];
  matchSummary: MatchSummaryRow[];
  teamPeriodMetrics: TeamPeriodMetricRow[];
  teamZoneMetrics: TeamZoneMetricRow[];
  insightFlags: InsightFlagRow[];
}) {
  const { selectedTeam, setSelectedTeam, selectedPeriod, setSelectedPeriod } = useFilters();
  const [selectedEvent, setSelectedEvent] = useState<DefensiveEventFilter>("all");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("recoveries");

  const defensiveEvents = useMemo(
    () =>
      filterDefensiveEvents(eventMap, {
        selectedTeam,
        selectedPeriod,
        selectedEvent,
        selectedZone,
      }),
    [eventMap, selectedEvent, selectedPeriod, selectedTeam, selectedZone],
  );

  const lossEvents = useMemo(
    () =>
      filterLossEvents(eventMap, {
        selectedTeam,
        selectedPeriod,
        selectedZone,
      }),
    [eventMap, selectedPeriod, selectedTeam, selectedZone],
  );

  const recoveryEvents = defensiveEvents.filter((event) => event.event_type === "recovery" || event.event_type === "regain");

  return (
    <section id="defensive" className="scroll-mt-6 space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Defensive Behaviour & Transitions"
          title="Where did teams recover, lose, and expose transition risk?"
          description="A staff-facing view of defensive actions, ball losses and consequence flags without overclaiming pressure."
          badge="no pressure model"
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
          <FilterSelect
            label="Event"
            value={selectedEvent}
            onChange={(value) => setSelectedEvent(value as DefensiveEventFilter)}
            options={[
              { label: "All defensive events", value: "all" },
              { label: "Recoveries", value: "recovery" },
              { label: "Regains", value: "regain" },
              { label: "Losses", value: "loss" },
            ]}
          />
          <FilterSelect
            label="Zone"
            value={selectedZone}
            onChange={setSelectedZone}
            options={[
              { label: "All zones", value: "all" },
              { label: "Defensive third", value: "defensive_third" },
              { label: "Middle third", value: "middle_third" },
              { label: "Attacking third", value: "attacking_third" },
            ]}
          />
        </div>
      </div>

      <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-50">
        <span className="font-semibold">Methodology:</span> This section uses defensive actions, recoveries, ball losses, transition risk and high regains. It does not label any metric as pressing intensity.
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <RecoveryMap events={recoveryEvents} />
        <DangerousLossesMap events={lossEvents} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DefensiveActionsByZone
          rows={teamZoneMetrics}
          aggregateRows={matchSummary}
          periodRows={teamPeriodMetrics}
          selectedPeriod={selectedPeriod}
          selectedTeam={selectedTeam}
          selectedMetric={selectedMetric}
          onMetricChange={setSelectedMetric}
          onZoneSelect={setSelectedZone}
        />
        <div className="grid gap-4">
          <HighRecoveriesCard rows={matchSummary} />
          <RiskZonesPanel losses={lossEvents} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <TransitionOutcomesPanel rows={matchSummary} />
        <DefensiveInsightList insights={insightFlags} />
      </div>
    </section>
  );
}
