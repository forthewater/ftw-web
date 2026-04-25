import type { Area, BBox, PolygonPoint } from "./data";

type Geometry = {
  bbox?: BBox;
  polygon?: PolygonPoint[];
};

export function getGeometryBounds({ bbox, polygon }: Geometry): BBox | null {
  if (bbox) return bbox;
  if (!polygon?.length) return null;

  return polygon.reduce<BBox>(
    (bounds, point) => ({
      west: Math.min(bounds.west, point.lon),
      south: Math.min(bounds.south, point.lat),
      east: Math.max(bounds.east, point.lon),
      north: Math.max(bounds.north, point.lat),
    }),
    {
      west: polygon[0].lon,
      south: polygon[0].lat,
      east: polygon[0].lon,
      north: polygon[0].lat,
    },
  );
}

export function formatGeometryBounds(area: Area): string {
  const bounds = getGeometryBounds(area.waterBodyDetails);
  if (!bounds) return "No geometry";

  const prefix = area.waterBodyDetails.polygon?.length
    ? `Polygon ${area.waterBodyDetails.polygon.length} pts`
    : "BBox";
  return `${prefix} · W ${formatCoord(bounds.west)} · S ${formatCoord(bounds.south)} · E ${formatCoord(bounds.east)} · N ${formatCoord(bounds.north)}`;
}

export function geometryKey({ bbox, polygon }: Geometry): string {
  if (polygon?.length) {
    return polygon.map((point) => `${point.lat},${point.lon}`).join("|");
  }

  if (bbox) {
    return `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`;
  }

  return "empty";
}

function formatCoord(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(6);
}

export function formatPassDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
