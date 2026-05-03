"use client";

import { RefreshCw } from "lucide-react";
import { FilterSelect } from "@/components/filters/FilterSelect";
import { ChanceCreationSection } from "@/components/chance/ChanceCreationSection";
import { DefensiveTransitionsSection } from "@/components/defensive/DefensiveTransitionsSection";
import { PlayerImpactSection } from "@/components/players/impact/PlayerImpactSection";
import { TrackingShapeSection } from "@/components/tracking/TrackingShapeSection";
import { MethodologySection } from "@/components/methodology/MethodologySection";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AppShell } from "@/components/layout/AppShell";
import { MatchContextCard } from "@/components/match/MatchContextCard";
import { MatchHeader } from "@/components/match/MatchHeader";
import { MethodologyWarningBadge } from "@/components/match/MethodologyWarningBadge";
import { MetricCardGrid } from "@/components/match/MetricCardGrid";
import { MomentumChart } from "@/components/match/MomentumChart";
import { ShotMiniSummary, getScoreFromShots } from "@/components/match/ShotMiniSummary";
import { TeamComparisonStrip } from "@/components/match/TeamComparisonStrip";
import { TopInsightsPanel } from "@/components/match/TopInsightsPanel";
import { TerritorySection } from "@/components/territory/TerritorySection";
import { FilterProvider, useFilters } from "@/hooks/useDashboardFilters";
import { useMatchData } from "@/hooks/useMatchData";
import type { InsightFlagRow, MatchSummaryRow, MomentumTimelineRow } from "@/types/data";

export function MatchOverviewPage() {
  return (
    <FilterProvider initialFilters={{ selectedMetric: "threat", selectedPriority: "all" }}>
      <DashboardContent />
    </FilterProvider>
  );
}

function DashboardContent() {
  const { loading, error, data, derived, reload } = useMatchData();
  const filters = useFilters();

  if (loading) {
    return (
      <AppShell>
        <LoadingState label="Loading match overview data" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <LoadingState />
          <LoadingState />
          <LoadingState />
          <LoadingState />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <EmptyState title="Could not load match data" description={error.message} />
        <button
          type="button"
          onClick={() => void reload()}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white transition hover:border-red-300/30 hover:bg-red-500/10"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Retry
        </button>
      </AppShell>
    );
  }

  if (!data || !derived?.matchContext) {
    return (
      <AppShell>
        <EmptyState
          title="No overview data available"
          description="The CSV files loaded, but the app could not find match context rows."
        />
      </AppShell>
    );
  }

  const context = derived.matchContext;
  const homeTeam = context.homeTeam ?? "FCM";
  const awayTeam = context.awayTeam ?? "FCK";
  const { homeScore, awayScore } = getScoreFromShots(data.shots, homeTeam, awayTeam);
  const visibleMatchSummary = filterMetricRows(data.matchSummary, filters.selectedTeam, filters.selectedPeriod);
  const visibleMomentum = filterMomentumRows(data.momentumTimeline, filters.selectedTeam, filters.selectedPeriod);
  const visibleInsights = filterInsights(data.insightFlags, filters.selectedTeam, filters.selectedPeriod, filters.selectedPriority);

  return (
    <AppShell>
      <div className="flex flex-col gap-4">
        <MatchHeader
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          homeScore={homeScore}
          awayScore={awayScore}
          matchDate={context.matchDate}
        />
        {(filters.selectedTeam !== "all" || filters.selectedPeriod !== "all" || (filters as any).selectedPhase !== "all" || (filters as any).selectedPlayer !== "all") ? (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={filters.resetFilters}
              className="inline-flex h-8 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset all filters
            </button>
          </div>
        ) : null}
      </div>

      <section id="overview" className="flex scroll-mt-6 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow="Match Overview"
          title="What happened in the match?"
          description="A fast staff read: territorial control, action share, real danger, main insights and momentum shifts."
          badge="real CSV data"
        />
        <div className="flex flex-wrap gap-3">
          <FilterSelect
            label="Team"
            value={filters.selectedTeam}
            onChange={filters.setSelectedTeam}
            options={[
              { label: "All teams", value: "all" },
              { label: "FCM", value: "FCM" },
              { label: "FCK", value: "FCK" },
            ]}
          />
          <FilterSelect
            label="Period"
            value={filters.selectedPeriod}
            onChange={filters.setSelectedPeriod}
            options={[
              { label: "Full match", value: "all" },
              { label: "First half", value: "1" },
              { label: "Second half", value: "2" },
            ]}
          />
          <FilterSelect
            label="Insight priority"
            value={filters.selectedPriority}
            onChange={filters.setSelectedPriority}
            options={[
              { label: "All priorities", value: "all" },
              { label: "High", value: "high" },
              { label: "Medium", value: "medium" },
              { label: "Low", value: "low" },
            ]}
          />
        </div>
      </section>

      <MethodologyWarningBadge />

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <MatchContextCard
          description={context.description}
          matchDate={context.matchDate}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          pitchLength={context.pitchLength}
          pitchWidth={context.pitchWidth}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <TeamComparisonStrip
            rows={data.matchSummary}
            metricName="field_tilt"
            label="Territorial control: field tilt"
          />
          <TeamComparisonStrip
            rows={data.matchSummary}
            metricName="threat"
            label="Danger check: simplified threat"
          />
        </div>
      </section>

      <MetricCardGrid rows={visibleMatchSummary.length > 0 ? visibleMatchSummary : data.matchSummary} />

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <MomentumChart
          rows={visibleMomentum.length > 0 ? visibleMomentum : data.momentumTimeline}
          selectedMetric={filters.selectedMetric}
          onMetricChange={filters.setSelectedMetric}
        />
        <TopInsightsPanel
          insights={visibleInsights}
          onInsightSelect={(insight) => {
            if (insight.team) {
              filters.setSelectedTeam(insight.team);
            }

            if (insight.period !== null && insight.period !== undefined) {
              filters.setSelectedPeriod(String(insight.period));
            }

            if (insight.metric_name) {
              filters.setSelectedMetric(insight.metric_name);
            }

            if (insight.dashboard_section) {
              // Convert "Territory", "Chance Creation" to DOM ids: #territory, #chance, #defensive, #players, #tracking
              const sectionMap: Record<string, string> = {
                "Territory": "territory",
                "Chance Creation": "chance",
                "Defence & Transitions": "defensive",
                "Player Impact": "players",
                "Tracking Shape": "tracking",
              };
              const sectionId = sectionMap[insight.dashboard_section] || insight.dashboard_section.toLowerCase().replace(/[^a-z0-9]+/g, "-");
              const el = document.getElementById(sectionId);
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
                // Also update the URL hash
                window.history.pushState(null, "", `#${sectionId}`);
              }
            }
          }}
        />
      </section>

      <ShotMiniSummary shots={data.shots} />

      <TerritorySection
        matchSummary={data.matchSummary}
        teamPeriodMetrics={data.teamPeriodMetrics}
        teamZoneMetrics={data.teamZoneMetrics}
        eventMap={data.eventMap}
        possessionSequences={data.possessionSequences}
      />

      <ChanceCreationSection
        shots={data.shots}
        eventMap={data.eventMap}
        matchSummary={data.matchSummary}
        momentumTimeline={data.momentumTimeline}
      />

      <DefensiveTransitionsSection
        eventMap={data.eventMap}
        matchSummary={data.matchSummary}
        teamPeriodMetrics={data.teamPeriodMetrics}
        teamZoneMetrics={data.teamZoneMetrics}
        insightFlags={data.insightFlags}
      />

      <PlayerImpactSection
        playerMetrics={data.playerMetrics}
        playerProfiles={data.playerProfiles}
        physicalMetrics={data.trackingPlayerPhysical}
        playerLookup={data.playerLookup}
      />

      <TrackingShapeSection
        trackingTeamShape={data.trackingTeamShape}
        trackingSpatialOccupation={data.trackingSpatialOccupation}
        trackingEventContext={data.trackingEventContext}
      />

      <MethodologySection />
    </AppShell>
  );
}

function filterMetricRows(rows: MatchSummaryRow[], selectedTeam: string, selectedPeriod: string) {
  return rows.filter((row) => {
    const teamMatches = selectedTeam === "all" || row.team === selectedTeam;
    const periodMatches = selectedPeriod === "all" || row.period === Number(selectedPeriod);
    return teamMatches && periodMatches;
  });
}

function filterMomentumRows(rows: MomentumTimelineRow[], selectedTeam: string, selectedPeriod: string) {
  return rows.filter((row) => {
    const teamMatches = selectedTeam === "all" || row.team === selectedTeam;
    const periodMatches = selectedPeriod === "all" || row.period === Number(selectedPeriod);
    return teamMatches && periodMatches;
  });
}

function filterInsights(
  rows: InsightFlagRow[],
  selectedTeam: string,
  selectedPeriod: string,
  selectedPriority: string,
) {
  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

  return rows
    .filter((row) => selectedTeam === "all" || row.team === selectedTeam)
    .filter((row) => selectedPeriod === "all" || row.period === Number(selectedPeriod))
    .filter((row) => selectedPriority === "all" || row.priority_level === selectedPriority || row.severity === selectedPriority)
    .filter((row) => Boolean(row.insight_text))
    .sort((a, b) => {
      const priorityDiff = (severityOrder[a.severity ?? ""] ?? 9) - (severityOrder[b.severity ?? ""] ?? 9);
      if (priorityDiff !== 0) return priorityDiff;
      return Math.abs(b.metric_value ?? 0) - Math.abs(a.metric_value ?? 0);
    })
    .slice(0, 5);
}
