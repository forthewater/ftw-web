import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { INDICES, areas as mockAreas, type Area, type Index } from "../data";

/**
 * Fetches tracked water bodies from /api/waterbody/all.
 * The endpoint may return a single object or an array, both are normalised
 * to an array before being stored.
 *
 * While VITE_API_BASE_URL is unset the hook falls back to the mock data
 * so development continues without a backend.
 *
 * Vue equivalent: composables/useAreas.ts with ref() + onMounted()
 */
const hasApi = !!(import.meta as any).env?.VITE_API_BASE_URL;

type Coordinate = { lat: number; lon: number };

type ApiArea = Partial<Area> & {
  waterBodyDetails?: Partial<Area["waterBodyDetails"]> | null;
};

const DEFAULT_INDICES: Index[] = [...INDICES];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function normalizeArea(area: ApiArea, fallbackIndex = 0): Area {
  const details: Partial<NonNullable<ApiArea["waterBodyDetails"]>> = area.waterBodyDetails ?? {};

  const name =
    typeof details.name === "string" && details.name.trim().length > 0
      ? details.name.trim()
      : `Water body ${fallbackIndex + 1}`;

  const polygon = Array.isArray(details.polygon)
    ? details.polygon.filter(
        (point): point is { lat: number; lon: number } =>
          !!point &&
          typeof point.lat === "number" &&
          Number.isFinite(point.lat) &&
          typeof point.lon === "number" &&
          Number.isFinite(point.lon),
      )
    : undefined;

  const bbox = details.bbox;
  const normalizedBbox =
    bbox &&
    typeof bbox.west === "number" &&
    typeof bbox.south === "number" &&
    typeof bbox.east === "number" &&
    typeof bbox.north === "number"
      ? bbox
      : undefined;

  const lat = typeof details.lat === "number" && Number.isFinite(details.lat)
    ? details.lat
    : undefined;
  const lon = typeof details.lon === "number" && Number.isFinite(details.lon)
    ? details.lon
    : undefined;

  const warning =
    typeof details.warning === "string" || details.warning === null
      ? details.warning
      : null;

  const normalizedIndices = Array.isArray(area.indices)
    ? area.indices.filter((index): index is Index => INDICES.includes(index as Index))
    : [];

  const weeklyWaterMetrics = Array.isArray(area.weeklyWaterMetrics)
    ? area.weeklyWaterMetrics
    : [];

  const id =
    typeof area.id === "string" && area.id.trim().length > 0
      ? area.id
      : `${slugify(name) || "water-body"}-${fallbackIndex + 1}`;

  return {
    ...area,
    id,
    active: typeof area.active === "boolean" ? area.active : true,
    activeAlerts:
      typeof area.activeAlerts === "number" && Number.isFinite(area.activeAlerts)
        ? area.activeAlerts
        : 0,
    indices: normalizedIndices.length ? normalizedIndices : DEFAULT_INDICES,
    waterBodyDetails: {
      name,
      ...(lat !== undefined ? { lat } : {}),
      ...(lon !== undefined ? { lon } : {}),
      ...(normalizedBbox ? { bbox: normalizedBbox } : {}),
      ...(polygon?.length ? { polygon } : {}),
      warning,
    },
    weeklyWaterMetrics,
  };
}

function getRepresentativePoint(area: Area): Coordinate | null {
  const lat = area.waterBodyDetails.lat;
  const lon = area.waterBodyDetails.lon;
  if (typeof lat === "number" && Number.isFinite(lat) && typeof lon === "number" && Number.isFinite(lon)) {
    return { lat, lon };
  }

  const polygon = area.waterBodyDetails.polygon;
  if (polygon?.length) {
    const sum = polygon.reduce(
      (acc, point) => ({ lat: acc.lat + point.lat, lon: acc.lon + point.lon }),
      { lat: 0, lon: 0 },
    );
    return { lat: sum.lat / polygon.length, lon: sum.lon / polygon.length };
  }

  const bbox = area.waterBodyDetails.bbox;
  if (!bbox) return null;
  return {
    lat: (bbox.south + bbox.north) / 2,
    lon: (bbox.west + bbox.east) / 2,
  };
}

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>(hasApi ? [] : mockAreas);
  const [loading, setLoading] = useState(hasApi);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = useCallback(async () => {
    if (!hasApi) return; // use mock data
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<ApiArea | ApiArea[]>("/api/waterbody/all");
      const normalized = (Array.isArray(data) ? data : [data]).map((item, index) => normalizeArea(item, index));
      setAreas(normalized);
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
      const point = getRepresentativePoint(area);
      let nextArea = area;

      if (point) {
        const [outlineRes, trackRes] = await Promise.all([
          api.get<Area["waterBodyDetails"]>("/api/waterbody/outline", { params: point }),
          api.get<Partial<Area>>("/api/waterbody/track", { params: point }),
        ]);

        nextArea = {
          ...area,
          ...trackRes.data,
          waterBodyDetails: {
            ...area.waterBodyDetails,
            ...outlineRes.data,
          },
          weeklyWaterMetrics:
            trackRes.data.weeklyWaterMetrics ?? area.weeklyWaterMetrics,
        };
      }

      const normalized = normalizeArea(nextArea);
      setAreas((prev) => [...prev, normalized]);
      return normalized;
    }

    setAreas((prev) => [...prev, area]);
    return area;
  }, []);

  const editArea = useCallback(async (area: Area) => {
    if (hasApi) {
      const point = getRepresentativePoint(area);
      let nextArea = area;

      if (point) {
        const [outlineRes, trackRes] = await Promise.all([
          api.get<Area["waterBodyDetails"]>("/api/waterbody/outline", { params: point }),
          api.get<Partial<Area>>("/api/waterbody/track", { params: point }),
        ]);

        nextArea = {
          ...area,
          ...trackRes.data,
          waterBodyDetails: {
            ...area.waterBodyDetails,
            ...outlineRes.data,
          },
          weeklyWaterMetrics:
            trackRes.data.weeklyWaterMetrics ?? area.weeklyWaterMetrics,
        };
      }

      const normalized = normalizeArea(nextArea);
      setAreas((prev) => prev.map((a) => (a.id === normalized.id ? normalized : a)));
      return normalized;
    }

    setAreas((prev) => prev.map((a) => (a.id === area.id ? area : a)));
    return area;
  }, []);

  const deleteArea = useCallback(async (id: string) => {
    setAreas((prev) => prev.filter((a) => a.id !== id));
    // Backend currently has no delete endpoint for tracked areas.
  }, []);

  const toggleArea = useCallback((id: string) => {
    setAreas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
    );
    // Backend currently has no toggle endpoint for tracked areas.
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
