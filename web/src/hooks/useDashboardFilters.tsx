"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { DashboardFilters } from "@/lib/data/derived";

export const defaultFilters: DashboardFilters = {
  selectedTeam: "all",
  selectedPeriod: "all",
  selectedMetric: "threat",
  selectedPlayer: "all",
  selectedPhase: "all",
  selectedPriority: "all",
};

export type FilterApi = DashboardFilters & {
  setSelectedTeam: (v: string) => void;
  setSelectedPeriod: (v: string) => void;
  setSelectedMetric: (v: string) => void;
  setSelectedPlayer: (v: string) => void;
  setSelectedPhase: (v: string) => void;
  setSelectedPriority: (v: string) => void;
  resetFilters: () => void;
};

export const FilterContext = createContext<FilterApi | null>(null);

export function FilterProvider({
  children,
  initialFilters,
}: {
  children: React.ReactNode;
  initialFilters?: Partial<DashboardFilters>;
}) {
  const [filters, setFilters] = useState<DashboardFilters>({
    ...defaultFilters,
    ...initialFilters,
  });

  const api = useMemo(
    () => ({
      ...filters,
      setSelectedTeam: (selectedTeam: string) => setFilters((current) => ({ ...current, selectedTeam })),
      setSelectedPeriod: (selectedPeriod: string) => setFilters((current) => ({ ...current, selectedPeriod })),
      setSelectedMetric: (selectedMetric: string) => setFilters((current) => ({ ...current, selectedMetric })),
      setSelectedPlayer: (selectedPlayer: string) => setFilters((current) => ({ ...current, selectedPlayer })),
      setSelectedPhase: (selectedPhase: string) => setFilters((current) => ({ ...current, selectedPhase })),
      setSelectedPriority: (selectedPriority: string) => setFilters((current) => ({ ...current, selectedPriority })),
      resetFilters: () => setFilters(defaultFilters),
    }),
    [filters],
  );

  return <FilterContext.Provider value={api}>{children}</FilterContext.Provider>;
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}

