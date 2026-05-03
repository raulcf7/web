import { Info } from "lucide-react";

export function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <Info className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-100" aria-hidden />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-64 rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-xs leading-5 text-slate-200 opacity-0 shadow-2xl shadow-black/40 transition-opacity group-hover:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
