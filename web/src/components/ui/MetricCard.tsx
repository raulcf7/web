import clsx from "clsx";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StatBadge } from "@/components/ui/StatBadge";

export function MetricCard({
  label,
  value,
  unit,
  detail,
  trend,
  tone = "neutral",
  tooltip,
}: {
  label: string;
  value: string;
  unit?: string;
  detail?: string;
  trend?: "up" | "down";
  tone?: "fcm" | "fck" | "neutral" | "gold" | "danger";
  tooltip?: string;
}) {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <article className="dashboard-card group min-h-[150px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-semibold text-white">{value}</span>
            {unit ? <span className="pb-1 text-sm text-slate-400">{unit}</span> : null}
          </div>
        </div>
        {tooltip ? <InfoTooltip text={tooltip} /> : null}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        {detail ? <p className="text-sm leading-5 text-slate-400">{detail}</p> : <span />}
        {trend ? (
          <StatBadge tone={tone} className={clsx("gap-1 normal-case tracking-normal")}>
            <TrendIcon className="h-3.5 w-3.5" aria-hidden />
            trend
          </StatBadge>
        ) : null}
      </div>
    </article>
  );
}
