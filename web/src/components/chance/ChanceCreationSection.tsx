"use client";

import { useMemo, useState } from "react";
import { FilterSelect } from "@/components/filters/FilterSelect";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatBadge } from "@/components/ui/StatBadge";
import { BoxEntriesMap } from "@/components/chance/BoxEntriesMap";
import { ChanceEfficiencyPanel } from "@/components/chance/ChanceEfficiencyPanel";
import { ShotDetailDrawer } from "@/components/chance/ShotDetailDrawer";
import { ShotMap } from "@/components/chance/ShotMap";
import { ShotQualityCards } from "@/components/chance/ShotQualityCards";
import { ShotsByPhaseChart } from "@/components/chance/ShotsByPhaseChart";
import { ThreatTimeline } from "@/components/chance/ThreatTimeline";
import {
  type ShotOutcomeFilter,
  type ShotPhaseFilter,
  filterBoxThreatEvents,
  filterShots,
  getAvailableShotPhases,
} from "@/components/chance/chanceUtils";
import { useFilters } from "@/hooks/useDashboardFilters";
import type { EventMapRow, MatchSummaryRow, MomentumTimelineRow, ShotRow } from "@/types/data";

export function ChanceCreationSection({
  shots,
  eventMap,
  matchSummary,
  momentumTimeline,
}: {
  shots: ShotRow[];
  eventMap: EventMapRow[];
  matchSummary: MatchSummaryRow[];
  momentumTimeline: MomentumTimelineRow[];
}) {
  const { selectedTeam, setSelectedTeam, selectedPeriod, setSelectedPeriod, selectedPhase, setSelectedPhase } = useFilters();
  const [selectedOutcome, setSelectedOutcome] = useState<ShotOutcomeFilter>("all");
  const [selectedMinuteBin, setSelectedMinuteBin] = useState<number | null>(null);
  const [selectedShot, setSelectedShot] = useState<ShotRow | null>(null);

  const phaseOptions = useMemo(
    () => [
      { label: "All phases", value: "all" },
      ...getAvailableShotPhases(shots).map((phase) => ({
        label: phase === "open_play" ? "Open play" : phase.replaceAll("_", " "),
        value: phase,
      })),
    ],
    [shots],
  );

  const filteredShots = useMemo(
    () =>
      filterShots(shots, {
        selectedTeam,
        selectedPeriod,
        selectedOutcome,
        selectedPhase,
        selectedMinuteBin,
      }),
    [selectedMinuteBin, selectedOutcome, selectedPeriod, selectedPhase, selectedTeam, shots],
  );

  const filteredEvents = useMemo(
    () =>
      filterBoxThreatEvents(eventMap, {
        selectedTeam,
        selectedPeriod,
        selectedMinuteBin,
      }),
    [eventMap, selectedMinuteBin, selectedPeriod, selectedTeam],
  );

  return (
    <section id="chance" className="scroll-mt-6 space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Chance Creation"
          title="Did attacking volume become real danger?"
          description="This section separates shot volume, location quality, simplified threat, phases and box access."
          badge="xG when available"
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
            label="Outcome"
            value={selectedOutcome}
            onChange={(value) => setSelectedOutcome(value as ShotOutcomeFilter)}
            options={[
              { label: "All outcomes", value: "all" },
              { label: "Goals", value: "goal" },
              { label: "Saved", value: "save" },
              { label: "Off target", value: "off_target" },
              { label: "Blocked", value: "block" },
            ]}
          />
          <FilterSelect
            label="Phase"
            value={selectedPhase}
            onChange={(value) => setSelectedPhase(value)}
            options={phaseOptions}
          />
        </div>
      </div>

      <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm leading-6 text-amber-50">
        <span className="font-semibold">Methodology:</span> Simplified Threat is a proxy, not official xT. xG is used only where the shot CSV provides it.
      </div>

      <ShotQualityCards shots={filteredShots} />

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <ShotMap shots={filteredShots} selectedShot={selectedShot} onShotSelect={setSelectedShot} />
        <ChanceEfficiencyPanel rows={matchSummary} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <ThreatTimeline
          rows={momentumTimeline}
          selectedMinuteBin={selectedMinuteBin}
          onMinuteBinSelect={setSelectedMinuteBin}
        />
        <ShotsByPhaseChart shots={filteredShots} />
      </div>

      <BoxEntriesMap events={filteredEvents} />

      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
        <StatBadge tone="neutral">{filteredShots.length} filtered shots</StatBadge>
        <StatBadge tone="neutral">{filteredEvents.length} box/threat events</StatBadge>
        {selectedMinuteBin !== null ? (
          <button type="button" onClick={() => setSelectedMinuteBin(null)} className="text-red-100 underline-offset-4 hover:underline">
            Clear minute-bin highlight
          </button>
        ) : null}
      </div>

      <ShotDetailDrawer shot={selectedShot} onClose={() => setSelectedShot(null)} />
    </section>
  );
}
