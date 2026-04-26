import { useState, useEffect } from "react";
import { api } from "../api";
import { pins as mockPins, type Pin } from "../data";

const hasApi = !!(import.meta as any).env?.VITE_API_BASE_URL;
const POLL_INTERVAL_MS = 15_000;

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

function buildNodeLabel(beacon: BeaconPayload, index: number, id: string): string {
  const explicitLabel = pickString(beacon, ["name", "label"]);
  if (explicitLabel) return explicitLabel;

  const compactId = id.replace(/[^a-zA-Z0-9]/g, "").slice(-6);
  return compactId ? `Sensor node ${compactId}` : `Sensor node ${index + 1}`;
}

function normalizeBeacon(beacon: BeaconPayload, index: number): Pin | null {
  const latestReading =
    typeof beacon.latestReading === "object" && beacon.latestReading !== null
      ? (beacon.latestReading as BeaconPayload)
      : undefined;

  const latest =
    typeof beacon.latest === "object" && beacon.latest !== null
      ? (beacon.latest as BeaconPayload)
      : undefined;

  const source = latestReading ?? latest ?? beacon;

  const lat =
    pickNumber(source, ["latitude", "lat"]) ??
    pickNumber(beacon, ["latitude", "lat"]);
  const lon =
    pickNumber(source, ["longitude", "lon"]) ??
    pickNumber(beacon, ["longitude", "lon"]);
  if (lat === null || lon === null) return null;

  const ndci =
    pickNumber(source, ["ndci"]) ??
    pickNumber(beacon, ["ndci"]) ??
    (latest ? pickNumber(latest, ["ndci"]) : null) ??
    0;
  const ndti =
    pickNumber(source, ["ndti", "turbidity"]) ??
    pickNumber(beacon, ["ndti", "turbidity"]) ??
    (latest ? pickNumber(latest, ["ndti", "turbidity"]) : null) ??
    0;
  const ndwi =
    pickNumber(source, ["ndwi"]) ??
    pickNumber(beacon, ["ndwi"]) ??
    (latest ? pickNumber(latest, ["ndwi"]) : null) ??
    0;

  const hasAnomaly =
    beacon.anomaly === true ||
    beacon.anomalyFlag === true ||
    beacon.anomalyFlag === 1 ||
    latestReading?.anomaly === true ||
    latestReading?.anomalyFlag === true ||
    latestReading?.anomalyFlag === 1 ||
    latest?.anomaly === true ||
    latest?.anomalyFlag === true ||
    latest?.anomalyFlag === 1;

  const severity = normalizeSeverity(
    beacon.severity ?? latest?.severity,
    ndci,
    hasAnomaly,
  );

  const id =
    pickString(beacon, ["uuid", "id", "beaconId", "hardwareUuid"]) ??
    `beacon-${index}`;
  if (id.toLowerCase() === "all") return null;

  const temperature = pickNumber(source, ["temperature"]) ?? undefined;
  const ph = pickNumber(source, ["ph"]) ?? undefined;
  const activity = pickNumber(source, ["activity"]) ?? undefined;
  const speedPxS = pickNumber(source, ["speedPxS"]) ?? undefined;
  const immobility = pickNumber(source, ["immobility"]) ?? undefined;
  const dispersionPx = pickNumber(source, ["dispersionPx"]) ?? undefined;
  const anomalyScore = pickNumber(source, ["anomalyScore"]) ?? undefined;

  return {
    id,
    areaId:
      pickString(beacon, ["areaId", "waterbodyId", "waterBodyId"]) ??
      "",
    name: buildNodeLabel(beacon, index, id),
    lat,
    lon,
    ndci,
    ndti,
    ndwi,
    severity,
    lastReading:
      pickString(source, ["lastReading", "timestamp", "recordedAt"]) ??
      pickString(beacon, ["lastReading", "timestamp", "recordedAt"]) ??
      (latest ? pickString(latest, ["timestamp", "recordedAt"]) : null) ??
      "Latest",
    temperature,
    ph,
    activity,
    speedPxS,
    immobility,
    dispersionPx,
    anomalyScore,
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
    let isMounted = true;
    let isFirstFetch = true;

    const fetchPins = async () => {
      if (isFirstFetch) setLoading(true);
      try {
        const { data } = await api.get<BeaconPayload[]>("/data/beacons/latest");
        if (!isMounted) return;

        const mapped = data
          .map((beacon, index) => normalizeBeacon(beacon, index))
          .filter((pin): pin is Pin => pin !== null);

        const hasAreaAssociation = mapped.some((pin) => pin.areaId);
        const nextPins = hasAreaAssociation
          ? mapped.filter((pin) => pin.areaId === areaId)
          : mapped;

        setPins(nextPins);
      } catch {
        // Ignore transient polling errors; keep last successful values.
      } finally {
        if (isMounted && isFirstFetch) setLoading(false);
        isFirstFetch = false;
      }
    };

    fetchPins();
    const intervalId = window.setInterval(fetchPins, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [areaId]);

  return { pins, loading };
}
