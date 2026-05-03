import { AlertTriangle, ArrowRight, Lightbulb } from "lucide-react";
import { StatBadge } from "@/components/ui/StatBadge";
import { formatMetricLabel } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { InsightFlagRow } from "@/types/data";

export function TopInsightsPanel({
  insights,
  onInsightSelect,
}: {
  insights: InsightFlagRow[];
  onInsightSelect?: (insight: InsightFlagRow) => void;
}) {
  return (
    <article className="dashboard-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Top insights</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Narrative signals for staff</h3>
        </div>
        <Lightbulb className="h-5 w-5 text-amber-200" aria-hidden />
      </div>

      <div className="mt-5 space-y-3">
        {insights.length === 0 ? (
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-4 text-sm text-slate-400">
            No insight flags available.
          </div>
        ) : null}
        {insights.map((insight) => (
          <button
            key={`${insight.team}-${insight.metric_name}-${insight.insight_type}-${insight.period ?? "all"}`}
            type="button"
            onClick={() => onInsightSelect?.(insight)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-red-300/30 hover:bg-red-500/10"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/10">
                <AlertTriangle className="h-4 w-4 text-amber-100" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatBadge tone={insight.severity === "high" ? "danger" : "gold"}>{insight.severity ?? "signal"}</StatBadge>
                  <StatBadge tone="neutral">{insight.insight_type ?? formatMetricLabel(insight.metric_name)}</StatBadge>
                  {insight.team ? <span className="text-xs font-semibold text-slate-400">{insight.team}</span> : null}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-200">{insight.insight_text}</p>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span>{formatMetricLabel(insight.metric_name)} · {formatMetricValue(insight.metric_value, insight.metric_unit)}</span>
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    apply filter
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </article>
  );
}
