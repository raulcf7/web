import { AlertCircle } from "lucide-react";

const warnings = [
  "Action Share / Possession Proxy is not official possession.",
  "Simplified Threat is a proxy, not official xT.",
  "Defensive actions are not labelled as pressure.",
];

export function MethodologyWarningBadge() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-50 sm:flex-row sm:items-center">
      <AlertCircle className="h-4 w-4 shrink-0 text-amber-200" aria-hidden />
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {warnings.map((warning) => (
          <span key={warning}>{warning}</span>
        ))}
      </div>
    </div>
  );
}
