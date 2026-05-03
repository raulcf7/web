import { Goal, MapPin, Ruler, Target, Trophy } from "lucide-react";
import { formatMetricValue } from "@/lib/formatters/number";
import type { ShotRow } from "@/types/data";
import { getShotSummary } from "@/components/chance/chanceUtils";

const cards = [
  { key: "totalShots", label: "Total shots", icon: Target, unit: "count" },
  { key: "shotsOnTarget", label: "Shots on target", icon: Target, unit: "count" },
  { key: "goals", label: "Goals", icon: Trophy, unit: "count" },
  { key: "totalXg", label: "Total xG", icon: Goal, unit: "xG" },
  { key: "shotsFromBox", label: "Shots from box", icon: MapPin, unit: "count" },
  { key: "averageDistance", label: "Avg shot distance", icon: Ruler, unit: "meters" },
] as const;

export function ShotQualityCards({ shots }: { shots: ShotRow[] }) {
  const summary = getShotSummary(shots);

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = summary[card.key];

        return (
          <article key={card.key} className="dashboard-card min-h-[135px] p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-white">{card.label}</p>
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.05]">
                <Icon className="h-4 w-4 text-red-100" aria-hidden />
              </div>
            </div>
            <p className="mt-5 font-mono text-2xl font-semibold text-white">
              {card.unit === "meters" ? `${formatMetricValue(value, "meters")}m` : formatMetricValue(value, card.unit)}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {card.key === "totalXg" ? "xG only where available in shot CSV." : "Filtered by current controls."}
            </p>
          </article>
        );
      })}
    </section>
  );
}
