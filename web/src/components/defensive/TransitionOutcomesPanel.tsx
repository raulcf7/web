import { StatBadge } from "@/components/ui/StatBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricLabel } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { MatchSummaryRow } from "@/types/data";
import { getTransitionOutcomes } from "@/components/defensive/defensiveUtils";

export function TransitionOutcomesPanel({ rows }: { rows: MatchSummaryRow[] }) {
  const outcomes = getTransitionOutcomes(rows);

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Transition outcomes</p>
          <h3 className="mt-2 text-lg font-semibold text-white">What happened after regains or losses?</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Consequence metrics from prepared CSVs. Read as event-chain flags, not causal proof.</p>
        </div>
        <StatBadge tone="gold">consequence flags</StatBadge>
      </div>
      <div className="mt-5 space-y-3">
        {outcomes.map((outcome) => {
          const fcm = outcome.FCM ?? 0;
          const fck = outcome.FCK ?? 0;
          const total = Math.max(fcm + fck, 1);
          const fcmShare = (fcm / total) * 100;

          return (
            <div key={outcome.metric} className="rounded-md border border-white/10 bg-white/[0.035] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{formatMetricLabel(outcome.metric)}</p>
                <p className="font-mono text-xs text-slate-400">
                  FCM {formatMetricValue(outcome.FCM, outcome.unit)} · FCK {formatMetricValue(outcome.FCK, outcome.unit)}
                </p>
              </div>
              <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/10">
                <span style={{ width: `${fcmShare}%`, backgroundColor: getTeamColor("FCM") }} />
                <span style={{ width: `${100 - fcmShare}%`, backgroundColor: getTeamColor("FCK") }} />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
