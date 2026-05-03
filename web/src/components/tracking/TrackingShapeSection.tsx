"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { TrackingMethodologyNote } from "@/components/tracking/TrackingMethodologyNote";
import { TeamShapeTimeline } from "@/components/tracking/TeamShapeTimeline";
import { CompactnessChart } from "@/components/tracking/CompactnessChart";
import { SpatialOccupationHeatmap } from "@/components/tracking/SpatialOccupationHeatmap";
import { EventContextShapePanel } from "@/components/tracking/EventContextShapePanel";
import { EmptyState } from "@/components/ui/EmptyState";
import type {
  TrackingTeamShapeRow,
  TrackingSpatialOccupationRow,
  TrackingEventContextRow,
} from "@/types/data";

export function TrackingShapeSection({
  trackingTeamShape,
  trackingSpatialOccupation,
  trackingEventContext,
}: {
  trackingTeamShape: TrackingTeamShapeRow[];
  trackingSpatialOccupation: TrackingSpatialOccupationRow[];
  trackingEventContext: TrackingEventContextRow[];
}) {
  const hasShape = trackingTeamShape.length > 0;
  const hasSpatial = trackingSpatialOccupation.length > 0;
  const hasContext = trackingEventContext.length > 0;
  const hasAnyData = hasShape || hasSpatial || hasContext;

  if (!hasAnyData) {
    return (
      <section id="tracking" className="scroll-mt-6 space-y-5">
        <SectionHeader
          eyebrow="Tracking & Team Shape"
          title="Structure, spacing and physical output"
          badge="tracking data"
        />
        <EmptyState
          title="No tracking data available"
          description="The tracking CSV files are empty or not yet generated. Run the tracking analysis pipeline to populate this section."
        />
      </section>
    );
  }

  return (
    <section id="tracking" className="scroll-mt-6 space-y-5">
      <SectionHeader
        eyebrow="Tracking & Team Shape"
        title="Structure, spacing and physical output"
        description="Tracking-derived metrics covering team shape, compactness and spatial occupation. All readings describe observed structure — not tactical intent."
        badge="tracking data"
      />

      <TrackingMethodologyNote />

      {/* Row 1: Team Shape Timeline + Compactness */}
      {hasShape ? (
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <TeamShapeTimeline rows={trackingTeamShape} />
          <CompactnessChart rows={trackingTeamShape} />
        </div>
      ) : (
        <EmptyState
          title="Team shape data unavailable"
          description="The tableau_tracking_team_shape.csv file is empty. Team width, depth and compactness charts require this dataset."
        />
      )}

      {/* Row 2: Spatial Occupation + Event Context */}
      <div className="grid gap-4 xl:grid-cols-2">
        {hasSpatial ? (
          <SpatialOccupationHeatmap rows={trackingSpatialOccupation} />
        ) : (
          <EmptyState
            title="Spatial occupation data unavailable"
            description="The tableau_tracking_spatial_occupation.csv file is empty."
          />
        )}

        {hasContext ? (
          <EventContextShapePanel rows={trackingEventContext} />
        ) : (
          <EmptyState
            title="Event context data unavailable"
            description="The tableau_tracking_event_context.csv file is empty."
          />
        )}
      </div>
    </section>
  );
}
