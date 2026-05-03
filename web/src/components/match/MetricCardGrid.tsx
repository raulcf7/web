import { Activity, ArrowRight, ShieldAlert, Target, TrendingUp } from "lucide-react";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricLabel } from "@/lib/formatters/football";
import { formatMetricValue, formatPercent } from "@/lib/formatters/number";
import type { MatchSummaryRow } from "@/types/data";

const kpiDefinitions = [
  { metric: "field_tilt", label: "Field Tilt", question: "Who controlled advanced territory?", icon: TrendingUp },
  { metric: "possession_proxy", label: "Action Share / Possession Proxy", question: "Who had more action volume?", icon: Activity },
  { metric: "shots", label: "Shots", question: "Was there attacking volume?", icon: Target },
  { metric: "threat", label: "Simplified Threat", question: "Did control become danger?", icon: TrendingUp },
  { metric: "box_entries", label: "Box Entries", question: "Who accessed the box?", icon: ArrowRight },
  { metric: "dangerous_losses", label: "Dangerous Losses", question: "Where did risk appear?", icon: ShieldAlert },
  { metric: "final_third_entries", label: "Final-third Entries", question: "Who progressed into advanced zones?", icon: ArrowRight },
  { metric: "progressive_passes", label: "Progressive Passes", question: "Who moved the ball forward?", icon: ArrowRight },
];

export function MetricCardGrid({ rows }: { rows: MatchSummaryRow[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpiDefinitions.map((definition) => (
        <OverviewMetricCard key={definition.metric} rows={rows} {...definition} />
      ))}
    </section>
  );
}

function OverviewMetricCard({
  rows,
  metric,
  label,
  question,
  icon: Icon,
}: {
  rows: MatchSummaryRow[];
  metric: string;
  label: string;
  question: string;
  icon: React.ElementType;
}) {
  const metricRows = rows.filter((row) => row.metric_name === metric);
  const fcm = metricRows.find((row) => row.team === "FCM");
  const fck = metricRows.find((row) => row.team === "FCK");
  const unit = fcm?.metric_unit ?? fck?.metric_unit ?? null;
  const hasMetric = Boolean(fcm || fck);
  const fcmValue = fcm?.metric_value ?? null;
  const fckValue = fck?.metric_value ?? null;
  const leader = getLeader(fcmValue, fckValue, metric);
  const leaderValue = leader === "FCM" ? fcmValue : leader === "FCK" ? fckValue : null;
  const total = Math.abs(fcmValue ?? 0) + Math.abs(fckValue ?? 0);
  const fcmShare = total > 0 ? ((fcmValue ?? 0) / total) * 100 : 50;

  return (
    <article className="dashboard-card flex min-h-[180px] flex-col justify-between p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{label || formatMetricLabel(metric)}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{question}</p>
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.05]">
          <Icon className="h-4 w-4 text-red-100" aria-hidden />
        </div>
      </div>

      {hasMetric ? (
        <>
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Leader</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-2xl font-semibold text-white" style={{ color: leader ? getTeamColor(leader) : undefined }}>
                {leader ?? "Level"}
              </p>
              <p className="font-mono text-xl font-semibold text-white">
                {unit === "share" ? formatPercent(leaderValue) : formatMetricValue(leaderValue, unit)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full" style={{ width: `${fcmShare}%`, backgroundColor: getTeamColor("FCM") }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>FCM {unit === "share" ? formatPercent(fcmValue) : formatMetricValue(fcmValue, unit)}</span>
              <span>FCK {unit === "share" ? formatPercent(fckValue) : formatMetricValue(fckValue, unit)}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-400">
          Metric unavailable in current CSV.
        </div>
      )}
    </article>
  );
}

function getLeader(fcm: number | null, fck: number | null, metric: string) {
  if (fcm === null && fck === null) return null;
  if (fcm === fck) return null;
  const lowerIsBetter = metric === "dangerous_losses";

  if (lowerIsBetter) {
    return (fcm ?? Number.POSITIVE_INFINITY) < (fck ?? Number.POSITIVE_INFINITY) ? "FCM" : "FCK";
  }

  return (fcm ?? Number.NEGATIVE_INFINITY) > (fck ?? Number.NEGATIVE_INFINITY) ? "FCM" : "FCK";
}
