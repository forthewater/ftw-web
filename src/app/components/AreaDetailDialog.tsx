import { useEffect, useRef, useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { X, MapPin, Pencil } from "lucide-react"
import { Button } from "./ui/button"
import { SeverityBadge, type Severity } from "./SeverityBadge"
import { MetricCard } from "./MetricCard"
import { TrendChart } from "./TrendChart"
import type { Area, Alert, Pin } from "../lib/data"
import { trendNDCI } from "../lib/data"
import { usePins } from "../lib/hooks/usePins"
import { formatGeometryBounds, geometryKey, getGeometryBounds } from "../lib/geometry"

// ── Constants ─────────────────────────────────────────────────────────────────

const BBOX_COLOR = "#185fa5"

// Light-mode severity colours (always used — OSM base map is always light)
const SEV_COLOR: Record<Severity, string> = {
  critical: "#A32D2D",
  warning: "#854F0B",
  ok: "#3B6D11",
  info: "#185FA5",
}

// ── Main component ────────────────────────────────────────────────────────────

export function AreaDetailDialog({
  area,
  alerts,
  open,
  onOpenChange,
  onEdit,
}: {
  area: Area | null
  alerts: Alert[]
  open: boolean
  onOpenChange: (b: boolean) => void
  onEdit?: (a: Area) => void
}) {
  const { pins } = usePins(area?.id ?? "")
  const [selected, setSelected] = useState<string | null>(null)

  if (!area) return null

  const selectedPin = pins.find((p) => p.id === selected) ?? null
  const areaAlerts = alerts.filter((a) => a.areaId === area.id)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content className="fixed inset-0 z-50 bg-background flex flex-col outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0">
          <DialogPrimitive.Title className="sr-only">
            {area.waterBodyDetails.name}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Detailed map view of {area.waterBodyDetails.name} with sampling station data.
          </DialogPrimitive.Description>

          <header className="border-b px-4 sm:px-6 h-14 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: "var(--accent)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapPin size={15} />
              </div>
              <div className="min-w-0">
                <div
                  className="truncate"
                  style={{ fontSize: 14, fontWeight: 500 }}
                >
                  {area.waterBodyDetails.name}
                </div>
                <div
                  className="truncate hidden sm:block"
                  style={{
                    fontSize: 11,
                    color: "var(--muted-foreground)",
                    fontFamily: "ui-monospace, monospace",
                  }}
                >
                  {formatGeometryBounds(area)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(area)}
                >
                  <Pencil size={13} />{" "}
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close">
                  <X size={16} />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
            <div className="relative h-[320px] lg:flex-1 lg:h-auto shrink-0" style={{ isolation: "isolate" }}>
              <MapCanvas
                area={area}
                pins={pins}
                selectedId={selected}
                onSelect={setSelected}
              />

              {/* Station count badge */}
              <div
                className="absolute bottom-8 right-3 z-[1000] bg-card border"
                style={{
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                }}
              >
                {pins.length} sampling stations · pass {area.weeklyWaterMetrics.length ? new Date(area.weeklyWaterMetrics[area.weeklyWaterMetrics.length - 1].to).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
              </div>
            </div>

            <aside className="lg:w-[360px] lg:border-l border-t lg:border-t-0 lg:overflow-auto bg-card shrink-0">
              <div className="p-5 space-y-5">
                {selectedPin ? (
                  <PinDetail
                    pin={selectedPin}
                    onClear={() => setSelected(null)}
                  />
                ) : (
                  <AreaSummary area={area} alerts={areaAlerts} />
                )}
              </div>
            </aside>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

// ── MapCanvas ─────────────────────────────────────────────────────────────────

function MapCanvas({
  area,
  pins,
  selectedId,
  onSelect,
}: {
  area: Area
  pins: Pin[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map())
  const onSelectRef = useRef(onSelect)
  const key = geometryKey(area.waterBodyDetails)

  // Keep onSelect ref fresh without triggering map reinit
  useEffect(() => {
    onSelectRef.current = onSelect
  })

  // Initialise map when area (bbox) or pins change
  useEffect(() => {
    if (!containerRef.current) return
    const geometryBounds = getGeometryBounds(area.waterBodyDetails)
    if (!geometryBounds) return

    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }
    markersRef.current.clear()

    const bounds: L.LatLngBoundsExpression = [
      [geometryBounds.south, geometryBounds.west],
      [geometryBounds.north, geometryBounds.east],
    ]

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    if (area.waterBodyDetails.polygon?.length && area.waterBodyDetails.polygon.length >= 3) {
      L.polygon(
        area.waterBodyDetails.polygon.map((point) => [point.lat, point.lon]),
        {
          color: BBOX_COLOR,
          weight: 2,
          dashArray: "6 4",
          fillOpacity: 0,
        },
      ).addTo(map)
    } else {
      L.rectangle(bounds, {
        color: BBOX_COLOR,
        weight: 2,
        dashArray: "6 4",
        fillOpacity: 0,
      }).addTo(map)
    }

    // Pin markers
    pins.forEach((pin) => {
      const color = SEV_COLOR[pin.severity]
      const marker = L.circleMarker([pin.lat, pin.lon], {
        radius: 8,
        fillColor: color,
        color: "#fff",
        weight: 2,
        fillOpacity: 1,
        bubblingMouseEvents: false,
      }).addTo(map)

      marker.on("click", () => onSelectRef.current(pin.id))
      marker.bindTooltip(pin.name, { direction: "top", offset: [0, -10] })
      markersRef.current.set(pin.id, marker)
    })

    map.fitBounds(bounds, { padding: [40, 40] })

    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(containerRef.current)

    mapRef.current = map

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [key, pins])

  // Update marker appearance when selection changes
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const pin = pins.find((p) => p.id === id)
      if (!pin) return
      const isSel = id === selectedId
      marker.setRadius(isSel ? 13 : 8)
      marker.setStyle({
        weight: isSel ? 3 : 2,
        color: isSel ? SEV_COLOR[pin.severity] : "#fff",
      })
    })
  }, [selectedId, pins])

  const geometryBounds = getGeometryBounds(area.waterBodyDetails)

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
      aria-label={
        geometryBounds
          ? `Map of ${geometryBounds.west},${geometryBounds.south} – ${geometryBounds.east},${geometryBounds.north}`
          : "Map"
      }
    />
  )
}

// ── AreaSummary ───────────────────────────────────────────────────────────────

function AreaSummary({
  area,
  alerts,
}: {
  area: Area
  alerts: Alert[]
}) {
  const wm = area.weeklyWaterMetrics
  const lastWm = wm[wm.length - 1] ?? null
  const prevWm = wm[wm.length - 2] ?? null
  const ndciDelta = lastWm && prevWm ? lastWm.ndci - prevWm.ndci : null
  const turbDelta = lastWm && prevWm ? lastWm.turbidity - prevWm.turbidity : null
  const ndwiDelta = lastWm && prevWm ? lastWm.ndwi - prevWm.ndwi : null
  const ndciChartData = wm.map((m) => ({
    month: new Date(m.to).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: m.ndci,
  }))

  return (
    <>
      <div>
        <h2>{area.waterBodyDetails.name}</h2>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted-foreground)",
            marginTop: 2,
          }}
        >
          {lastWm
            ? `Last satellite pass · ${new Date(lastWm.from).toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${new Date(lastWm.to).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            : "No satellite data"}
        </div>
      </div>

      {lastWm && (
        <div className="grid grid-cols-3 gap-2">
          <MetricCard
            label="NDCI"
            description="Algae & chlorophyll"
            value={lastWm.ndci.toFixed(3)}
            trend={ndciDelta === null ? "flat" : ndciDelta > 0 ? "up" : ndciDelta < 0 ? "down" : "flat"}
            trendLabel={ndciDelta !== null ? `${ndciDelta >= 0 ? "+" : ""}${ndciDelta.toFixed(3)} wow` : ""}
            improving={ndciDelta !== null && ndciDelta <= 0}
          />
          <MetricCard
            label="Turbidity"
            description="Water clarity"
            value={lastWm.turbidity.toFixed(3)}
            trend={turbDelta === null ? "flat" : turbDelta > 0 ? "up" : turbDelta < 0 ? "down" : "flat"}
            trendLabel={turbDelta !== null ? `${turbDelta >= 0 ? "+" : ""}${turbDelta.toFixed(3)} wow` : ""}
            improving={turbDelta !== null && turbDelta <= 0}
          />
          <MetricCard
            label="NDWI"
            description="Water extent"
            value={lastWm.ndwi.toFixed(3)}
            trend={ndwiDelta === null ? "flat" : ndwiDelta > 0 ? "up" : ndwiDelta < 0 ? "down" : "flat"}
            trendLabel={ndwiDelta !== null ? `${ndwiDelta >= 0 ? "+" : ""}${ndwiDelta.toFixed(3)} wow` : ""}
            improving={ndwiDelta !== null && ndwiDelta >= 0}
          />
        </div>
      )}

      <div>
        <h3>NDCI · {wm.length}-week trend</h3>
        <TrendChart data={ndciChartData} warning={0.1} critical={0.2} />
      </div>

      <div>
        <h3>Recent alerts</h3>
        {alerts.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            No alerts in this area.
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="border flex items-start gap-2"
                style={{ borderRadius: 8, padding: 10 }}
              >
                <SeverityBadge severity={a.severity} />
                <div className="flex-1 min-w-0">
                  <div
                    className="truncate"
                    style={{ fontSize: 13, fontWeight: 500 }}
                  >
                    {a.title}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--muted-foreground)" }}
                  >
                    {a.index} {a.value.toFixed(2)} · {a.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

// ── PinDetail ─────────────────────────────────────────────────────────────────

function PinDetail({ pin, onClear }: { pin: Pin; onClear: () => void }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <SeverityBadge severity={pin.severity} />
          <h2 style={{ marginTop: 8 }}>{pin.name}</h2>
          <div
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              fontFamily: "ui-monospace, monospace",
              marginTop: 2,
            }}
          >
            {pin.lat.toFixed(4)}°N, {pin.lon.toFixed(4)}°E
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Back
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MetricCard
          label="NDCI"
          description="Algae & chlorophyll"
          value={pin.ndci.toFixed(2)}
          trend={pin.ndci > 0.2 ? "up" : "flat"}
          trendLabel={
            pin.ndci > 0.2
              ? "above critical"
              : pin.ndci > 0.1
                ? "above warning"
                : "normal"
          }
          improving={pin.ndci <= 0.1}
        />
        <MetricCard
          label="NDTI"
          description="Turbidity index"
          value={pin.ndti.toFixed(2)}
          trend="flat"
          trendLabel="clear"
        />
        <MetricCard
          label="NDWI"
          description="Water extent"
          value={pin.ndwi.toFixed(2)}
          trend="down"
          trendLabel="-1% mom"
          improving={false}
        />
      </div>

      <div className="border" style={{ borderRadius: 8, padding: 12 }}>
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--muted-foreground)",
            fontWeight: 500,
            marginBottom: 6,
          }}
        >
          Latest reading
        </div>
        <div style={{ fontSize: 13 }}>{pin.lastReading}</div>
        <div
          style={{
            fontSize: 11,
            color: "var(--muted-foreground)",
            marginTop: 2,
          }}
        >
          Sentinel-2 L2A · 10m resolution
        </div>
      </div>

      <div>
        <h3>Station NDCI · 6 months</h3>
        <TrendChart data={trendNDCI} warning={0.1} critical={0.2} />
      </div>
    </>
  )
}

