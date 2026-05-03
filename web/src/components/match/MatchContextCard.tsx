import { CalendarDays, MapPinned, Ruler } from "lucide-react";
import { formatTeamName } from "@/lib/formatters/football";

export function MatchContextCard({
  description,
  matchDate,
  homeTeam,
  awayTeam,
  pitchLength,
  pitchWidth,
}: {
  description?: string | null;
  matchDate?: string | null;
  homeTeam?: string | null;
  awayTeam?: string | null;
  pitchLength?: number | null;
  pitchWidth?: number | null;
}) {
  return (
    <article className="dashboard-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Match context</p>
      <h2 className="mt-3 text-lg font-semibold text-white">{description ?? "FCM vs FCK"}</h2>
      <div className="mt-5 grid gap-3 text-sm text-slate-300">
        <ContextItem icon={CalendarDays} label="Date" value={matchDate ?? "14/09/2024"} />
        <ContextItem icon={MapPinned} label="Teams" value={`${formatTeamName(homeTeam)} vs ${formatTeamName(awayTeam)}`} />
        <ContextItem icon={Ruler} label="Pitch assumption" value={`${pitchLength ?? 112}m x ${pitchWidth ?? 80}m`} />
      </div>
    </article>
  );
}

function ContextItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <span className="inline-flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" aria-hidden />
        {label}
      </span>
      <span className="text-right font-medium text-slate-100">{value}</span>
    </div>
  );
}
