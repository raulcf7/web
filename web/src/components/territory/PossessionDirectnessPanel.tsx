import { StatBadge } from "@/components/ui/StatBadge";
import { formatMetricValue } from "@/lib/formatters/number";
import type { PossessionSequenceRow } from "@/types/data";
import { groupPossessions } from "@/components/territory/territoryUtils";

export function PossessionDirectnessPanel({
  rows,
  selectedTeam,
  selectedPeriod,
}: {
  rows: PossessionSequenceRow[];
  selectedTeam: string;
  selectedPeriod: string;
}) {
  const groups = groupPossessions(rows, selectedTeam, selectedPeriod).sort((a, b) => (b.threat ?? 0) - (a.threat ?? 0));

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Possession sequences</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Directness and payoff</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Sequence-level summary of how possessions progressed into final-third access, box entries, shots and simplified threat.
          </p>
        </div>
        <StatBadge tone="gold">sequence read</StatBadge>
      </div>

      <div className="mt-5 space-y-3">
        {groups.length === 0 ? (
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-4 text-sm text-slate-400">No possession sequences for the current filters.</div>
        ) : null}
        {groups.map((group) => (
          <div key={group.type} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-base font-semibold capitalize text-white">{group.type}</p>
              <StatBadge tone="neutral">{group.count} sequences</StatBadge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
              <SequenceStat label="Avg duration" value={`${formatMetricValue(group.duration, "seconds")}s`} />
              <SequenceStat label="Avg vertical gain" value={`${formatMetricValue(group.verticalGain, "meters")}m`} />
              <SequenceStat label="Final third" value={formatMetricValue(group.finalThirdEntries, "count")} />
              <SequenceStat label="Box entries" value={formatMetricValue(group.boxEntries, "count")} />
              <SequenceStat label="Shots" value={formatMetricValue(group.shots, "count")} />
              <SequenceStat label="Threat" value={formatMetricValue(group.threat, "index")} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function SequenceStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
