import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { trendNDCI, trendNDTI, type Index } from "../data";

type TrendPoint = { month: string; value: number; lastYear?: number };

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

export function useTrend(areaId: string, index: Index) {
  const [data, setData] = useState<TrendPoint[]>(hasApi ? [] : (mockTrend[index] ?? []));
  const [loading, setLoading] = useState(hasApi);
  const [error, setError] = useState<string | null>(null);

  const fetchTrend = useCallback(async () => {
    if (!hasApi) return;
    setLoading(true);
    setError(null);
    try {
      const { data: points } = await api.get<TrendPoint[]>("/trend", {
        params: { areaId, index },
      });
      setData(points);
    } catch {
      setError("Failed to load trend data");
    } finally {
      setLoading(false);
    }
  }, [areaId, index]);

  useEffect(() => { fetchTrend(); }, [fetchTrend]);

  return { data, loading, error, refetch: fetchTrend };
}
