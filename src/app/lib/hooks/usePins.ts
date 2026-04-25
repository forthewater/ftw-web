import { useState, useEffect } from "react";
import { api } from "../api";
import { pins as mockPins, type Pin } from "../data";

const hasApi = !!(import.meta as any).env?.VITE_API_BASE_URL;

export function usePins(areaId: string) {
  const [pins, setPins] = useState<Pin[]>(
    hasApi ? [] : mockPins.filter((p) => p.areaId === areaId),
  );
  const [loading, setLoading] = useState(hasApi);

  useEffect(() => {
    if (!hasApi) {
      setPins(mockPins.filter((p) => p.areaId === areaId));
      return;
    }
    setLoading(true);
    api
      .get<Pin[]>(`/pins?areaId=${areaId}`)
      .then(({ data }) => setPins(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [areaId]);

  return { pins, loading };
}
