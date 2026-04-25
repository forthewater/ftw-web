import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { areas as mockAreas, type Area } from "../data";

/**
 * Fetches the list of monitored areas.
 * While VITE_API_BASE_URL is unset the hook falls back to the mock data
 * so development continues without a backend.
 *
 * Vue equivalent: composables/useAreas.ts with ref() + onMounted()
 */
const hasApi = !!(import.meta as any).env?.VITE_API_BASE_URL;

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>(hasApi ? [] : mockAreas);
  const [loading, setLoading] = useState(hasApi);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = useCallback(async () => {
    if (!hasApi) return; // use mock data
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Area[]>("/areas");
      setAreas(data);
    } catch {
      setError("Failed to load areas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAreas(); }, [fetchAreas]);

  const addArea = useCallback(async (area: Area) => {
    setAreas((prev) => [...prev, area]);
    // await api.post("/areas", area);
  }, []);

  const editArea = useCallback(async (area: Area) => {
    setAreas((prev) => prev.map((a) => (a.id === area.id ? area : a)));
    // await api.put(`/areas/${area.id}`, area);
  }, []);

  const deleteArea = useCallback(async (id: string) => {
    setAreas((prev) => prev.filter((a) => a.id !== id));
    // await api.delete(`/areas/${id}`);
  }, []);

  const toggleArea = useCallback((id: string) => {
    setAreas((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
    // await api.patch(`/areas/${id}/toggle`);
  }, []);

  return { areas, loading, error, addArea, editArea, deleteArea, toggleArea, refetch: fetchAreas };
}
