"use client";

import { FilterSelect } from "@/components/filters/FilterSelect";

export function PlayerMetricSelector({
  team,
  group,
  metric,
  groups,
  metrics,
  search,
  onTeamChange,
  onGroupChange,
  onMetricChange,
  onSearchChange,
}: {
  team: string;
  group: string;
  metric: string;
  groups: string[];
  metrics: string[];
  search: string;
  onTeamChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onMetricChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <FilterSelect
        label="Team"
        value={team}
        onChange={onTeamChange}
        options={[
          { label: "All teams", value: "all" },
          { label: "FCM", value: "FCM" },
          { label: "FCK", value: "FCK" },
        ]}
      />
      <FilterSelect label="Metric group" value={group} onChange={onGroupChange} options={groups.map((value) => ({ label: value, value }))} />
      <FilterSelect label="Metric" value={metric} onChange={onMetricChange} options={metrics.map((value) => ({ label: value.replaceAll("_", " "), value }))} />
      <label className="flex min-w-[220px] flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Search</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Player name"
          className="h-10 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-slate-100 outline-none transition placeholder:text-slate-600 hover:border-red-300/30 focus:border-red-300/60"
        />
      </label>
    </div>
  );
}
