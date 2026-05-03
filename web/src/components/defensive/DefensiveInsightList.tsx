import { AlertTriangle } from "lucide-react";
import { StatBadge } from "@/components/ui/StatBadge";
import { formatMetricLabel } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { InsightFlagRow } from "@/types/data";
import { getDefensiveInsights } from "@/components/defensive/defensiveUtils";

export function DefensiveInsightList({ insights }: { insights: InsightFlagRow[] }) {
  const filtered = getDefensiveInsights(insights);

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Defensive insights</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Risk and transition flags</h3>
        </div>
        <AlertTriangle className="h-5 w-5 text-amber-200" aria-hidden />
      </div>
      <div className="mt-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-4 text-sm text-slate-400">No defensive or transition insight flags available.</div>
        ) : null}
        {filtered.map((insight) => (
          <div key={`${insight.team}-${insight.metric_name}-${insight.insight_type}`} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatBadge tone={insight.severity === "high" ? "danger" : "gold"}>{insight.severity ?? "signal"}</StatBadge>
              <StatBadge tone="neutral">{insight.team ?? "Team"}</StatBadge>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-200">{insight.insight_text}</p>
            <p className="mt-2 text-xs text-slate-500">{formatMetricLabel(insight.metric_name)} · {formatMetricValue(insight.metric_value, insight.metric_unit)}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
