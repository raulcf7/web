import { ArrowUpRight } from "lucide-react";
import { StatBadge } from "@/components/ui/StatBadge";
import { formatMetricValue } from "@/lib/formatters/number";
import type { MatchSummaryRow } from "@/types/data";
import { getHighRecoveries } from "@/components/defensive/defensiveUtils";

export function HighRecoveriesCard({ rows }: { rows: MatchSummaryRow[] }) {
  const values = getHighRecoveries(rows);

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">High regains</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Recoveries in advanced areas</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">High recoveries are not labelled pressing intensity.</p>
        </div>
        <ArrowUpRight className="h-5 w-5 text-red-100" aria-hidden />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {values.map((team) => (
          <div key={team.team} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold" style={{ color: team.color }}>{team.team}</p>
              <StatBadge tone={team.team === "FCM" ? "fcm" : "fck"}>high regains</StatBadge>
            </div>
            <p className="mt-4 font-mono text-3xl font-semibold text-white">{formatMetricValue(team.value, "count")}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
