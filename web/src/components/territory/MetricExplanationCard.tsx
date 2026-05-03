import { Info } from "lucide-react";
import { StatBadge } from "@/components/ui/StatBadge";

export function MetricExplanationCard() {
  return (
    <article className="dashboard-card p-5">
      <div className="flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.05]">
          <Info className="h-5 w-5 text-amber-100" aria-hidden />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-white">Reading territory correctly</h3>
            <StatBadge tone="gold">methodology</StatBadge>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Field tilt and channel heatmaps describe where event volume happened. They do not prove tactical intent or spatial occupation.
            Productive progression is read by pairing territorial dominance with final-third entries, box entries, shots and simplified threat.
          </p>
        </div>
      </div>
    </article>
  );
}
