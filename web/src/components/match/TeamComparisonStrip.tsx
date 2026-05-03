import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricLabel } from "@/lib/formatters/football";
import { formatMetricValue, formatPercent } from "@/lib/formatters/number";
import type { MatchSummaryRow } from "@/types/data";

export function TeamComparisonStrip({
  rows,
  metricName,
  label,
}: {
  rows: MatchSummaryRow[];
  metricName: string;
  label?: string;
}) {
  const metricRows = rows.filter((row) => row.metric_name === metricName);
  const fcm = metricRows.find((row) => row.team === "FCM");
  const fck = metricRows.find((row) => row.team === "FCK");
  const total = Math.abs(fcm?.metric_value ?? 0) + Math.abs(fck?.metric_value ?? 0);
  const fcmShare = total > 0 ? ((fcm?.metric_value ?? 0) / total) * 100 : 50;
  const fckShare = total > 0 ? ((fck?.metric_value ?? 0) / total) * 100 : 50;
  const unit = fcm?.metric_unit ?? fck?.metric_unit;

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Control check</p>
          <h3 className="mt-2 text-base font-semibold text-white">{label ?? formatMetricLabel(metricName)}</h3>
        </div>
        <p className="text-sm text-slate-400">{unit === "share" ? "share" : "volume"}</p>
      </div>
      <div className="mt-5 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <ValueBlock team="FCM" value={fcm?.metric_value ?? null} unit={unit} />
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div className="flex h-full">
            <span style={{ width: `${fcmShare}%`, backgroundColor: getTeamColor("FCM") }} />
            <span style={{ width: `${fckShare}%`, backgroundColor: getTeamColor("FCK") }} />
          </div>
        </div>
        <ValueBlock team="FCK" value={fck?.metric_value ?? null} unit={unit} align="right" />
      </div>
    </article>
  );
}

function ValueBlock({
  team,
  value,
  unit,
  align = "left",
}: {
  team: "FCM" | "FCK";
  value: number | null;
  unit?: string | null;
  align?: "left" | "right";
}) {
  const formatted = unit === "share" ? formatPercent(value) : formatMetricValue(value, unit);

  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: getTeamColor(team) }}>{team}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-white">{formatted}</p>
    </div>
  );
}
