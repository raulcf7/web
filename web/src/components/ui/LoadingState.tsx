export function LoadingState({ label = "Loading analysis" }: { label?: string }) {
  return (
    <div className="dashboard-card space-y-4 p-5" aria-live="polite" aria-busy="true">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-300" />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
        <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
        <div className="h-3 w-5/6 animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}
