"use client";

import { AlertTriangle, Database, RefreshCw } from "lucide-react";
import { useMatchData } from "@/hooks/useMatchData";
import { formatMetricValue } from "@/lib/formatters/number";
import { formatTeamName } from "@/lib/formatters/football";
import { StatBadge } from "@/components/ui/StatBadge";

export function DataDebugPanel() {
  const { loading, error, data, derived, warnings, reload } = useMatchData();

  return (
    <section className="dashboard-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.05]">
            <Database className="h-5 w-5 text-red-100" aria-hidden />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-white">Real data loading layer</h3>
              <StatBadge tone={loading ? "neutral" : error ? "danger" : "fcm"}>
                {loading ? "loading" : error ? "error" : "loaded"}
              </StatBadge>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Temporary development panel for CSV status, row counts and missing-column warnings.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void reload()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-slate-100 transition hover:border-red-300/30 hover:bg-red-500/10"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Reload
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-md border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error.message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Match context</p>
          {derived?.matchContext ? (
            <div className="mt-4 space-y-3 text-sm">
              <InfoRow label="Description" value={derived.matchContext.description} />
              <InfoRow label="Date" value={derived.matchContext.matchDate} />
              <InfoRow label="Teams" value={`${formatTeamName(derived.matchContext.homeTeam)} vs ${formatTeamName(derived.matchContext.awayTeam)}`} />
              <InfoRow label="Pitch" value={`${derived.matchContext.pitchLength}m x ${derived.matchContext.pitchWidth}m`} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No match context loaded yet.</p>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Shot summary from CSV</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(derived?.shotSummary ?? []).map((team) => (
              <div key={team.team} className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                <p className="font-semibold text-white">{formatTeamName(team.team)}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <InfoStat label="Shots" value={team.shots} />
                  <InfoStat label="On target" value={team.onTarget} />
                  <InfoStat label="xG" value={formatMetricValue(team.xg, "xG")} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Rows by dataset</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {derived?.rowCounts
              ? Object.entries(derived.rowCounts).map(([dataset, count]) => (
                  <div key={dataset} className="flex items-center justify-between gap-3 rounded-md bg-white/[0.035] px-3 py-2">
                    <span className="truncate text-xs text-slate-300">{dataset}</span>
                    <span className="font-mono text-xs font-semibold text-white">{count.toLocaleString("en-GB")}</span>
                  </div>
                ))
              : null}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Column warnings</p>
            <StatBadge tone={warnings.length > 0 ? "danger" : "fcm"}>{warnings.length}</StatBadge>
          </div>
          <div className="mt-4 space-y-2">
            {warnings.length === 0 && data ? (
              <p className="text-sm text-slate-400">No missing important columns detected.</p>
            ) : null}
            {warnings.map((warning, index) => (
              <div key={`${warning.dataset}-${index}`} className="flex gap-2 rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-50">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div>
                  <p className="font-medium">{warning.dataset}: {warning.message}</p>
                  {warning.columns ? <p className="mt-1 text-xs text-amber-100/80">{warning.columns.join(", ")}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2 last:border-b-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-100">{value}</span>
    </div>
  );
}

function InfoStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
