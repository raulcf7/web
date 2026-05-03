import { LeagueIcon } from "@/components/ui/LeagueIcon";
import { TeamIdentity } from "@/components/ui/TeamIdentity";
import { StatBadge } from "@/components/ui/StatBadge";

export function ScoreboardHeader({
  homeTeam = "FCM",
  awayTeam = "FCK",
  homeScore,
  awayScore,
  matchDate,
}: {
  homeTeam?: string | null;
  awayTeam?: string | null;
  homeScore: number | null;
  awayScore: number | null;
  matchDate?: string | null;
}) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(138,17,29,0.38),rgba(18,21,28,0.96)_45%,rgba(77,143,234,0.2))] p-5 shadow-2xl shadow-black/25 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md border border-white/10 bg-white/10">
              <LeagueIcon size={28} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-100/80">Danish Superliga</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">FCM vs FCK</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatBadge tone="gold">Match Overview</StatBadge>
            <StatBadge tone="neutral">{matchDate ?? "14/09/2024"}</StatBadge>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-4 sm:gap-6">
          <TeamIdentity team={homeTeam ?? "FCM"} label="home" crestSize={64} />
          <div className="min-w-24 rounded-md border border-white/10 bg-white/[0.05] px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Score</p>
            <p className="mt-1 font-mono text-3xl font-semibold text-white">
              {homeScore ?? "-"} <span className="text-slate-500">-</span> {awayScore ?? "-"}
            </p>
          </div>
          <TeamIdentity team={awayTeam ?? "FCK"} label="away" align="right" crestSize={64} />
        </div>
      </div>
    </section>
  );
}
