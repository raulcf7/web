import { StatBadge } from "@/components/ui/StatBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricLabel } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { MatchSummaryRow } from "@/types/data";
import { getEfficiencyMetrics } from "@/components/chance/chanceUtils";

export function ChanceEfficiencyPanel({ rows }: { rows: MatchSummaryRow[] }) {
  const metrics = getEfficiencyMetrics(rows);

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Chance efficiency</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Volume vs payoff</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">Compare access metrics with simplified threat ratios.</p>
        </div>
        <StatBadge tone="gold">proxy aware</StatBadge>
      </div>
      <div className="mt-5 space-y-3">
        {metrics.map((metric) => {
          const fcm = metric.FCM ?? 0;
          const fck = metric.FCK ?? 0;
          const total = Math.abs(fcm) + Math.abs(fck);
          const fcmShare = total > 0 ? (fcm / total) * 100 : 50;

          return (
            <div key={metric.metric} className="rounded-md border border-white/10 bg-white/[0.035] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{formatMetricLabel(metric.metric)}</p>
                <p className="font-mono text-xs text-slate-400">
                  FCM {formatMetricValue(metric.FCM, metric.unit)} · FCK {formatMetricValue(metric.FCK, metric.unit)}
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="flex h-full">
                  <span style={{ width: `${fcmShare}%`, backgroundColor: getTeamColor("FCM") }} />
                  <span style={{ width: `${100 - fcmShare}%`, backgroundColor: getTeamColor("FCK") }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
