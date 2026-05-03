import { CircleDashed } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="dashboard-card flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
      <CircleDashed className="h-8 w-8 text-slate-500" aria-hidden />
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
