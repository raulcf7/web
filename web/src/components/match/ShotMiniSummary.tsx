import { Goal, Target } from "lucide-react";
import { StatBadge } from "@/components/ui/StatBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricValue } from "@/lib/formatters/number";
import type { ShotRow } from "@/types/data";

export function ShotMiniSummary({ shots }: { shots: ShotRow[] }) {
  const summary = summarizeShots(shots);

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Shot mini-summary</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Did volume become real danger?</h3>
        </div>
        <Target className="h-5 w-5 text-red-100" aria-hidden />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {summary.map((team) => (
          <div key={team.team} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white" style={{ color: getTeamColor(team.team) }}>{team.team}</p>
              <StatBadge tone={team.team === "FCM" ? "fcm" : "fck"}>
                <Goal className="mr-1 h-3.5 w-3.5" aria-hidden />
                {team.goals} goals
              </StatBadge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <ShotStat label="Shots" value={team.shots} />
              <ShotStat label="On target" value={team.onTarget} />
              <ShotStat label="xG" value={formatMetricValue(team.xg, "xG")} />
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">
              xG comes from shot rows. Simplified Threat is shown separately in KPIs.
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

export function getScoreFromShots(shots: ShotRow[], homeTeam = "FCM", awayTeam = "FCK") {
  const summary = summarizeShots(shots);
  const homeScore = summary.find((row) => row.team === homeTeam)?.goals ?? null;
  const awayScore = summary.find((row) => row.team === awayTeam)?.goals ?? null;
  return { homeScore, awayScore };
}

function summarizeShots(shots: ShotRow[]) {
  const byTeam = new Map<string, { team: string; shots: number; goals: number; onTarget: number; xg: number }>();

  for (const shot of shots) {
    const team = shot.team_name ?? "Unknown";
    const current = byTeam.get(team) ?? { team, shots: 0, goals: 0, onTarget: 0, xg: 0 };
    current.shots += 1;
    current.goals += shot.is_goal ? 1 : 0;
    current.onTarget += shot.is_on_target ? 1 : 0;
    current.xg += shot.xg ?? 0;
    byTeam.set(team, current);
  }

  return [...byTeam.values()].sort((a, b) => (a.team === "FCM" ? -1 : b.team === "FCM" ? 1 : a.team.localeCompare(b.team)));
}

function ShotStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
