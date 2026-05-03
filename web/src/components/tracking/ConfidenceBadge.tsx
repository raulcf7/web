import clsx from "clsx";
import type { ConfidenceLevel } from "@/types/data";

const toneMap: Record<string, string> = {
  high: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  medium: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  low: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

export function ConfidenceBadge({
  level,
  className,
}: {
  level: ConfidenceLevel;
  className?: string;
}) {
  const key = (level ?? "medium").toLowerCase();
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
        toneMap[key] ?? toneMap.medium,
        className,
      )}
    >
      {key} confidence
    </span>
  );
}
