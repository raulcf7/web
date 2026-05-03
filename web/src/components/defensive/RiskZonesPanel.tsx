import { ShieldAlert } from "lucide-react";
import { StatBadge } from "@/components/ui/StatBadge";
import type { EventMapRow } from "@/types/data";
import { formatChannel, formatZone, riskTone } from "@/components/defensive/defensiveUtils";

export function RiskZonesPanel({ losses }: { losses: EventMapRow[] }) {
  const highRisk = losses.filter((event) => riskTone(event) === "high");
  const central = losses.filter((event) => event.channel === "central_channel");
  const defensiveThird = losses.filter((event) => event.zone === "defensive_third");

  const topZones = [...new Map(losses.map((event) => [`${event.zone}-${event.channel}`, event])).values()]
    .map((event) => ({
      zone: event.zone,
      channel: event.channel,
      count: losses.filter((row) => row.zone === event.zone && row.channel === event.channel).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Risk zones</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Sensitive ball-loss areas</h3>
        </div>
        <ShieldAlert className="h-5 w-5 text-rose-200" aria-hidden />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <RiskStat label="High risk" value={highRisk.length} tone="danger" />
        <RiskStat label="Central" value={central.length} tone="gold" />
        <RiskStat label="Def. third" value={defensiveThird.length} tone="neutral" />
      </div>
      <div className="mt-5 space-y-2">
        {topZones.map((zone) => (
          <div key={`${zone.zone}-${zone.channel}`} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm">
            <span className="text-slate-300">{formatZone(zone.zone)} · {formatChannel(zone.channel)}</span>
            <span className="font-mono font-semibold text-white">{zone.count}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function RiskStat({ label, value, tone }: { label: string; value: number; tone: "danger" | "gold" | "neutral" }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
      <StatBadge tone={tone}>{label}</StatBadge>
      <p className="mt-3 font-mono text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
