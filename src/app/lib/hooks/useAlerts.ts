import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { alerts as mockAlerts, type Alert } from "../data";

/**
 * Fetches alerts, optionally filtered by areaId and/or status.
 * Falls back to mock data when VITE_API_BASE_URL is unset.
 */
const hasApi = !!(import.meta as any).env?.VITE_API_BASE_URL;

export function useAlerts(areaId?: string) {
  const [alerts, setAlerts] = useState<Alert[]>(hasApi ? [] : mockAlerts);
  const [loading, setLoading] = useState(hasApi);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!hasApi) return;
    setLoading(true);
    setError(null);
    try {
      const params = areaId ? { areaId } : undefined;
      const { data } = await api.get<Alert[]>("/alerts", { params });
      setAlerts(data);
    } catch {
      setError("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, [areaId]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const acknowledge = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "acknowledged",
              acknowledgedBy: "You",
              acknowledgedAt: "Just now",
            }
          : a,
      ),
    );
    // await api.patch(`/alerts/${id}/acknowledge`);
  }, []);

  return { alerts, loading, error, acknowledge, refetch: fetchAlerts };
}
