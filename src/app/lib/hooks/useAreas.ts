import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { areas as mockAreas, type Area } from "../data";

/**
 * Fetches the list of tracked water body areas from /waterbody/track.
 * The endpoint may return a single object or an array — both are normalised
 * to an array before being stored.
 *
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
      // Real backend: GET /waterbody/track — mock server: GET /track
      const { data } = await api.get<Area | Area[]>("/track");
      setAreas(Array.isArray(data) ? data : [data]);
    } catch {
      setError("Failed to load areas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const addArea = useCallback(async (area: Area) => {
    if (hasApi) {
      const { data } = await api.post<Area>("/track", area);
      setAreas((prev) => [...prev, data]);
      return data;
    }

    setAreas((prev) => [...prev, area]);
    return area;
  }, []);

  const editArea = useCallback(async (area: Area) => {
    if (hasApi) {
      const { data } = await api.put<Area>(`/track/${area.id}`, area);
      setAreas((prev) => prev.map((a) => (a.id === data.id ? data : a)));
      return data;
    }

    setAreas((prev) => prev.map((a) => (a.id === area.id ? area : a)));
    return area;
  }, []);

  const deleteArea = useCallback(async (id: string) => {
    setAreas((prev) => prev.filter((a) => a.id !== id));
    // await api.delete(`/waterbody/track/${id}`);
  }, []);

  const toggleArea = useCallback((id: string) => {
    setAreas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
    );
    // await api.patch(`/waterbody/track/${id}/toggle`);
  }, []);

  return {
    areas,
    loading,
    error,
    addArea,
    editArea,
    deleteArea,
    toggleArea,
    refetch: fetchAreas,
  };
}
