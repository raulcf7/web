"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clearCsvWarnings, getCsvWarnings } from "@/lib/data/csv";
import {
  getDatasetRowCounts,
  getMatchContext,
  getMomentumSeries,
  getShotSummary,
  getTeams,
  getTopInsights,
  getTrackingMetrics,
} from "@/lib/data/derived";
import { loadAllDashboardData } from "@/lib/data/loaders";
import type { CsvWarning, DashboardData } from "@/types/data";

export interface UseMatchDataState {
  loading: boolean;
  error: Error | null;
  data: DashboardData | null;
  derived: ReturnType<typeof buildDerived> | null;
  warnings: CsvWarning[];
  reload: () => Promise<void>;
}

export function useMatchData(): UseMatchDataState {
  const [data, setData] = useState<DashboardData | null>(null);
  const [warnings, setWarnings] = useState<CsvWarning[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    clearCsvWarnings();

    try {
      const nextData = await loadAllDashboardData();
      setData(nextData);
      setWarnings(getCsvWarnings());
    } catch (caught) {
      const nextError = caught instanceof Error ? caught : new Error("Unknown data loading error");
      setError(nextError);
      setWarnings(getCsvWarnings());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [reload]);

  const derived = useMemo(() => (data ? buildDerived(data) : null), [data]);

  return {
    loading,
    error,
    data,
    derived,
    warnings,
    reload,
  };
}

function buildDerived(data: DashboardData) {
  return {
    teams: getTeams(data),
    matchContext: getMatchContext(data.games),
    rowCounts: getDatasetRowCounts(data),
    topInsights: getTopInsights(data.insightFlags, 5),
    momentumSeries: getMomentumSeries(data.momentumTimeline),
    shotSummary: getShotSummary(data.shots),
    trackingMetrics: getTrackingMetrics(data),
  };
}
