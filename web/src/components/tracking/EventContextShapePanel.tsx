"use client";

import { useMemo, useState } from "react";
import { FilterSelect } from "@/components/filters/FilterSelect";
import { ConfidenceBadge } from "@/components/tracking/ConfidenceBadge";
import { getTeamColor } from "@/lib/assets/assets";
import { formatMetricLabel } from "@/lib/formatters/football";
import { formatMetricValue } from "@/lib/formatters/number";
import type { TrackingEventContextRow } from "@/types/data";

const EVENT_LABELS: Record<string, string> = {
  shot: "Shots",
  loss: "Losses",
  recovery: "Recoveries",
};

const CONTEXT_LABELS: Record<string, string> = {
  "1s_before_shot": "1 s before shot",
  "1s_after_loss": "1 s after loss",
  at_regain: "At regain",
};

export function EventContextShapePanel({ rows }: { rows: TrackingEventContextRow[] }) {
  const eventTypes = useMemo(
    () => [...new Set(rows.map((r) => r.event_type).filter(Boolean))] as string[],
    [rows],
  );

  const [selectedEvent, setSelectedEvent] = useState<string>(eventTypes[0] ?? "shot");

  const { grouped, confidence } = useMemo(() => {
    const filtered = rows.filter((r) => r.event_type === selectedEvent);
    let conf: string = "high";

    // Group by event_team → team_shape_metric and compute avg
    const teamMetric = new Map<string, Map<string, { sum: number; count: number }>>();

    for (const r of filtered) {
      const team = r.event_team ?? "Unknown";
      if (!teamMetric.has(team)) teamMetric.set(team, new Map());
      const metrics = teamMetric.get(team)!;
      const metric = r.team_shape_metric ?? "";
      const current = metrics.get(metric) ?? { sum: 0, count: 0 };
      current.sum += r.metric_value ?? 0;
      current.count += 1;
      metrics.set(metric, current);
      if (r.confidence_level === "medium" || r.confidence_level === "low") conf = r.confidence_level;
    }

    const result: Array<{
      team: string;
      metrics: Array<{ name: string; avg: number; count: number }>;
    }> = [];

    for (const [team, metrics] of teamMetric) {
      const entries = [...metrics.entries()]
        .map(([name, { sum, count }]) => ({
          name,
          avg: count > 0 ? sum / count : 0,
          count,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      result.push({ team, metrics: entries });
    }

    return { grouped: result.sort((a, b) => a.team.localeCompare(b.team)), confidence: conf };
  }, [rows, selectedEvent]);

  const contextLabel = useMemo(() => {
    const ctx = rows.find((r) => r.event_type === selectedEvent)?.context_window;
    return ctx ? CONTEXT_LABELS[ctx] ?? ctx : "";
  }, [rows, selectedEvent]);

  if (rows.length === 0) {
    return (
      <article className="dashboard-card flex min-h-[220px] flex-col items-center justify-center p-5 text-center">
        <p className="text-sm text-slate-400">No event-context tracking data available.</p>
      </article>
    );
  }

  return (
    <article className="dashboard-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Shape at key moments
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            What was the team structure around events?
          </h3>
          <p className="mt-1 max-w-lg text-xs leading-5 text-slate-400">
            Average tracking-frame metrics at the moment of {selectedEvent}s ({contextLabel}).
            Correlation with outcome is not implied — context validation is needed.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ConfidenceBadge level={confidence as "high" | "medium" | "low"} />
          <FilterSelect
            label="Event type"
            value={selectedEvent}
            onChange={setSelectedEvent}
            options={eventTypes.map((t) => ({
              label: EVENT_LABELS[t] ?? formatMetricLabel(t),
              value: t,
            }))}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {grouped.map(({ team, metrics }) => (
          <div
            key={team}
            className="rounded-lg border border-white/8 bg-white/[0.02] p-4"
          >
            <h4
              className="text-sm font-bold"
              style={{ color: getTeamColor(team) }}
            >
              {team}
            </h4>
            <p className="mb-3 text-[10px] text-slate-500">
              Based on {metrics[0]?.count ?? 0} {selectedEvent} events
            </p>

            <div className="space-y-2">
              {metrics.map(({ name, avg }) => (
                <div key={name} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">
                    {formatMetricLabel(name)}
                  </span>
                  <span className="font-mono text-sm text-white">
                    {formatMetricValue(avg, "meters")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
