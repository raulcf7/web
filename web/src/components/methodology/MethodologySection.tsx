import { SectionHeader } from "@/components/ui/SectionHeader";
import { AlertTriangle, BookOpen, Database, Target, Zap } from "lucide-react";

export function MethodologySection() {
  return (
    <section id="methodology" className="scroll-mt-6 space-y-5">
      <SectionHeader
        eyebrow="Methodology"
        title="How to interpret this dashboard"
        description="A transparent look at how data is collected, processed and visualized."
        badge="documentation"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="dashboard-card p-5">
          <div className="flex items-center gap-3 text-emerald-400">
            <Database className="h-5 w-5" />
            <h3 className="font-semibold text-white">Data Sources</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            This dashboard uses merged datasets from event-based logs (Opta/StatsBomb) and raw optical tracking data (Signality/Tracab). The integration provides context to events (where players were during an action) and physical outputs across periods.
          </p>
        </article>

        <article className="dashboard-card p-5">
          <div className="flex items-center gap-3 text-amber-400">
            <Target className="h-5 w-5" />
            <h3 className="font-semibold text-white">Prudential Proxies</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            We strictly avoid inferring tactical intent. Metrics like "Simplified Threat" or "High Regains" measure observed outcomes, not tactical plans. "Pressing" is described as "Defensive Actions" since defensive intent requires subjective video review.
          </p>
        </article>

        <article className="dashboard-card p-5">
          <div className="flex items-center gap-3 text-blue-400">
            <BookOpen className="h-5 w-5" />
            <h3 className="font-semibold text-white">Tracking Confidence</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Optical tracking can have occlusion or frame-drops. We use a Confidence Badge (High, Medium, Low) for tracking metrics based on the data completeness. "Low" confidence implies potential missing frames during key match phases.
          </p>
        </article>

        <article className="dashboard-card p-5 md:col-span-2 xl:col-span-3">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold text-white">Known Limitations</h3>
          </div>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-6 text-slate-400">
            <li><strong>xG Availability:</strong> Expected Goals (xG) is only displayed when provided by the data provider. We use a proxy "Simplified Threat" for contextual danger when xG is missing.</li>
            <li><strong>Contextual Profiles:</strong> Player profiles ("Progressor", "Finisher") describe their statistical output in this specific match, not their intrinsic abilities.</li>
            <li><strong>Shape vs Intent:</strong> "Team Width" and "Compactness" reflect the physical bounding box of the players, not the instructed tactical shape.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
