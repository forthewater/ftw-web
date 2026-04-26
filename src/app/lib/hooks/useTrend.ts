import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { trendNDCI, trendNDTI, type Area, type Index } from "../data";

type TrendPoint = { month: string; value: number; lastYear?: number };

type AreaWithMetrics = Pick<Area, "id" | "weeklyWaterMetrics">;

const mockTrend: Record<Index, TrendPoint[]> = {
  NDCI: trendNDCI,
  NDTI: trendNDTI,
  NDWI: [],
};

/**
 * Fetches 6-month trend data for a given area + index.
 * Falls back to mock data when VITE_API_BASE_URL is unset.
 */
const hasApi = !!(import.meta as any).env?.VITE_API_BASE_URL;

function getMetricValue(
  metric: AreaWithMetrics["weeklyWaterMetrics"][number],
  index: Index,
): number {
  if (index === "NDCI") return metric.ndci;
  if (index === "NDTI") return metric.turbidity;
  return metric.ndwi;
}

function toTrendPoints(area: AreaWithMetrics | undefined, index: Index): TrendPoint[] {
  if (!area?.weeklyWaterMetrics?.length) return [];

  return area.weeklyWaterMetrics.slice(-6).map((metric) => ({
    month: new Date(metric.to).toLocaleDateString("en-US", { month: "short" }),
    value: getMetricValue(metric, index),
  }));
}

export function useTrend(areaId: string, index: Index) {
  const [data, setData] = useState<TrendPoint[]>(hasApi ? [] : (mockTrend[index] ?? []));
  const [loading, setLoading] = useState(hasApi);
  const [error, setError] = useState<string | null>(null);

  const fetchTrend = useCallback(async () => {
    if (!hasApi) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<AreaWithMetrics | AreaWithMetrics[]>("/api/waterbody/all");
      const allAreas = Array.isArray(data) ? data : [data];
      const area = allAreas.find((entry) => entry.id === areaId) ?? allAreas[0];
      const points = toTrendPoints(area, index);
      setData(points.length ? points : (mockTrend[index] ?? []));
    } catch {
      setError("Failed to load trend data");
      setData(mockTrend[index] ?? []);
    } finally {
      setLoading(false);
    }
  }, [areaId, index]);

  useEffect(() => { fetchTrend(); }, [fetchTrend]);

  return { data, loading, error, refetch: fetchTrend };
}
