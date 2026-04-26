import { useState, useEffect } from "react";
import { api } from "../api";
import { pins as mockPins, type Pin } from "../data";

const hasApi = !!(import.meta as any).env?.VITE_API_BASE_URL;

type BeaconPayload = Record<string, unknown>;

function pickNumber(source: BeaconPayload, keys: string[]): number | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

function pickString(source: BeaconPayload, keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function normalizeSeverity(raw: unknown, ndci: number, hasAnomaly: boolean): Pin["severity"] {
  if (raw === "critical" || raw === "warning" || raw === "ok" || raw === "info") {
    return raw;
  }
  if (hasAnomaly) return "critical";
  if (ndci > 0.2) return "critical";
  if (ndci > 0.1) return "warning";
  return "ok";
}

function normalizeBeacon(beacon: BeaconPayload, index: number): Pin | null {
  const lat = pickNumber(beacon, ["latitude", "lat"]);
  const lon = pickNumber(beacon, ["longitude", "lon"]);
  if (lat === null || lon === null) return null;

  const latest =
    typeof beacon.latest === "object" && beacon.latest !== null
      ? (beacon.latest as BeaconPayload)
      : undefined;

  const ndci =
    pickNumber(beacon, ["ndci"]) ??
    (latest ? pickNumber(latest, ["ndci"]) : null) ??
    0;
  const ndti =
    pickNumber(beacon, ["ndti", "turbidity"]) ??
    (latest ? pickNumber(latest, ["ndti", "turbidity"]) : null) ??
    0;
  const ndwi =
    pickNumber(beacon, ["ndwi"]) ??
    (latest ? pickNumber(latest, ["ndwi"]) : null) ??
    0;

  const hasAnomaly =
    beacon.anomaly === true ||
    beacon.anomalyFlag === true ||
    latest?.anomaly === true ||
    latest?.anomalyFlag === true;

  const severity = normalizeSeverity(
    beacon.severity ?? latest?.severity,
    ndci,
    hasAnomaly,
  );

  return {
    id:
      pickString(beacon, ["uuid", "id", "beaconId", "hardwareUuid"]) ??
      `beacon-${index}`,
    areaId:
      pickString(beacon, ["areaId", "waterbodyId", "waterBodyId"]) ??
      "",
    name: pickString(beacon, ["name", "label"]) ?? `Beacon ${index + 1}`,
    lat,
    lon,
    ndci,
    ndti,
    ndwi,
    severity,
    lastReading:
      pickString(beacon, ["lastReading", "timestamp", "recordedAt"]) ??
      (latest ? pickString(latest, ["timestamp", "recordedAt"]) : null) ??
      "Latest",
  };
}

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
      .get<BeaconPayload[]>("/data/beacons/map-locations")
      .then(({ data }) => {
        const mapped = data
          .map((beacon, index) => normalizeBeacon(beacon, index))
          .filter((pin): pin is Pin => pin !== null);

        const hasAreaAssociation = mapped.some((pin) => pin.areaId);
        const nextPins = hasAreaAssociation
          ? mapped.filter((pin) => pin.areaId === areaId)
          : mapped;

        setPins(nextPins);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [areaId]);

  return { pins, loading };
}
