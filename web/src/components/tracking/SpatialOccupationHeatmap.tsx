"use client";

import { useMemo, useState } from "react";
import { FilterSelect } from "@/components/filters/FilterSelect";
import { ConfidenceBadge } from "@/components/tracking/ConfidenceBadge";
import { getTeamColor } from "@/lib/assets/assets";
import type { TrackingSpatialOccupationRow } from "@/types/data";

const ZONE_ORDER = ["defensive_third", "middle_third", "attacking_third"];
const CHANNEL_ORDER = ["left_channel", "central_channel", "right_channel"];

const ZONE_LABELS: Record<string, string> = {
  defensive_third: "Defensive third",
  middle_third: "Middle third",
  attacking_third: "Attacking third",
};

const CHANNEL_LABELS: Record<string, string> = {
  left_channel: "Left",
  central_channel: "Centre",
  right_channel: "Right",
};

type CellData = {
  zone: string;
  channel: string;
  density: number;
  topPlayers: Array<{ name: string; share: number }>;
};

export function SpatialOccupationHeatmap({ rows }: { rows: TrackingSpatialOccupationRow[] }) {
  const [selectedTeam, setSelectedTeam] = useState<string>("FCM");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");

  const { cells, maxDensity, confidence } = useMemo(() => {
    const filtered = rows.filter(
      (r) =>
        r.team === selectedTeam &&
        (selectedPeriod === "all" || r.period === Number(selectedPeriod)),
    );

    const cellMap = new Map<string, { density: number; players: Map<string, number> }>();

    for (const r of filtered) {
      const key = `${r.zone}|${r.channel}`;
      const existing = cellMap.get(key) ?? { density: 0, players: new Map() };
      existing.density += r.team_density_share ?? 0;
      const name = r.player_name ?? "Unknown";
      existing.players.set(name, (existing.players.get(name) ?? 0) + (r.occupation_share ?? 0));
      cellMap.set(key, existing);
    }

    let max = 0;
    const result: CellData[] = [];

    for (const zone of ZONE_ORDER) {
      for (const channel of CHANNEL_ORDER) {
        const d = cellMap.get(`${zone}|${channel}`);
        const density = d?.density ?? 0;
        if (density > max) max = density;
        const topPlayers = d
          ? [...d.players.entries()]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([name, share]) => ({ name, share }))
          : [];
        result.push({ zone, channel, density, topPlayers });
      }
    }

    const conf = filtered.some((r) => r.confidence_level === "low")
      ? "low"
      : filtered.some((r) => r.confidence_level === "medium")
        ? "medium"
        : "high";

    return { cells: result, maxDensity: max, confidence: conf as "high" | "medium" | "low" };
  }, [rows, selectedTeam, selectedPeriod]);

  if (rows.length === 0) {
    return (
      <article className="dashboard-card flex min-h-[220px] flex-col items-center justify-center p-5 text-center">
        <p className="text-sm text-slate-400">No spatial occupation data available.</p>
      </article>
    );
  }

  return (
    <article className="dashboard-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Spatial occupation
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            Where did the team concentrate?
          </h3>
          <p className="mt-1 max-w-lg text-xs leading-5 text-slate-400">
            Tracking-derived zone occupancy showing where players spent time. This is distinct
            from event heatmaps — it measures presence, not actions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ConfidenceBadge level={confidence} />
          <FilterSelect
            label="Team"
            value={selectedTeam}
            onChange={setSelectedTeam}
            options={[
              { label: "FCM", value: "FCM" },
              { label: "FCK", value: "FCK" },
            ]}
          />
          <FilterSelect
            label="Period"
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            options={[
              { label: "Full match", value: "all" },
              { label: "First half", value: "1" },
              { label: "Second half", value: "2" },
            ]}
          />
        </div>
      </div>

      {/* Grid heatmap */}
      <div className="mt-5">
        {/* Channel headers */}
        <div className="mb-1 grid grid-cols-[100px_1fr_1fr_1fr] gap-1">
          <div />
          {CHANNEL_ORDER.map((ch) => (
            <div key={ch} className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {CHANNEL_LABELS[ch]}
            </div>
          ))}
        </div>

        {/* Zone rows */}
        {ZONE_ORDER.map((zone) => (
          <div key={zone} className="mb-1 grid grid-cols-[100px_1fr_1fr_1fr] gap-1">
            <div className="flex items-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {ZONE_LABELS[zone]}
            </div>
            {CHANNEL_ORDER.map((ch) => {
              const cell = cells.find((c) => c.zone === zone && c.channel === ch);
              const density = cell?.density ?? 0;
              const opacity = maxDensity > 0 ? Math.max(0.08, density / maxDensity) : 0.08;
              const teamColor = getTeamColor(selectedTeam);

              return (
                <div
                  key={ch}
                  className="group relative flex min-h-[80px] flex-col items-center justify-center rounded-md border border-white/5 p-2 transition-all hover:border-white/20"
                  style={{ backgroundColor: teamColor, opacity: 0.1 + opacity * 0.7 }}
                >
                  <span className="text-lg font-bold text-white">
                    {(density * 100).toFixed(1)}%
                  </span>
                  {cell?.topPlayers?.length ? (
                    <div className="mt-1 space-y-0.5">
                      {cell.topPlayers.map((p) => (
                        <p key={p.name} className="text-[10px] leading-tight text-white/80">
                          {p.name}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p className="mt-3 text-[10px] leading-4 text-slate-500">
        Cell colour intensity is proportional to team density share. Top 3 players by occupation
        share are shown. Attack direction is right →
      </p>
    </article>
  );
}
