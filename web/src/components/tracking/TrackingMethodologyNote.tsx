import { AlertTriangle } from "lucide-react";

export function TrackingMethodologyNote() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/80" aria-hidden />
      <p className="text-xs leading-5 text-slate-300">
        <span className="font-semibold text-amber-200/90">Methodology note </span>
        Tracking metrics describe observed structure and physical output; they do not prove
        tactical intention without video/context validation. Confidence levels reflect data quality
        at each time window.
      </p>
    </div>
  );
}
