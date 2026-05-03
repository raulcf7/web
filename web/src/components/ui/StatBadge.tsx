import clsx from "clsx";

type StatBadgeTone = "fcm" | "fck" | "neutral" | "gold" | "danger";

const toneClasses: Record<StatBadgeTone, string> = {
  fcm: "border-red-500/30 bg-red-500/10 text-red-100",
  fck: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  neutral: "border-slate-500/30 bg-slate-500/10 text-slate-200",
  gold: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  danger: "border-rose-400/30 bg-rose-400/10 text-rose-100",
};

export function StatBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: StatBadgeTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
