import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { BBox, PolygonPoint } from "../lib/data"
import { geometryKey, getGeometryBounds } from "../lib/geometry"

const SHAPE_COLOR = "#185fa5"
const DEFAULT_CENTER: L.LatLngExpression = [42.7, 25.5]
const DEFAULT_ZOOM = 7

export function BBoxMap({
  bbox,
  polygon,
  point,
  height = 180,
  caption,
  interactive = false,
  onPointClick,
}: {
  bbox?: BBox
  polygon?: PolygonPoint[]
  point?: { lat: number; lng: number } | null
  height?: number
  caption?: string
  interactive?: boolean
  onPointClick?: (coords: { lat: number; lng: number }) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)
  const onPointClickRef = useRef(onPointClick)
  const key = geometryKey({ bbox: onPointClick ? undefined : bbox, polygon })
  const hasClickHandler = !!onPointClick
  const isInteractive = interactive || hasClickHandler

  useEffect(() => { onPointClickRef.current = onPointClick })

  // Initialize map and static shapes. Marker is managed in the effect below.
  useEffect(() => {
    if (!containerRef.current) return

    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    markerRef.current = null

    const map = L.map(containerRef.current, {
      zoomControl: isInteractive,
      scrollWheelZoom: isInteractive,
      dragging: isInteractive,
      touchZoom: isInteractive,
      doubleClickZoom: isInteractive,
      boxZoom: false,
      keyboard: false,
      attributionControl: isInteractive,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    if (polygon?.length && polygon.length >= 3) {
      L.polygon(
        polygon.map((p) => [p.lat, p.lon] as L.LatLngExpression),
        { color: SHAPE_COLOR, weight: 2, fillColor: SHAPE_COLOR, fillOpacity: 0.18 },
      ).addTo(map)
      const bounds = getGeometryBounds({ polygon })
      if (bounds) map.fitBounds([[bounds.south, bounds.west], [bounds.north, bounds.east]], { padding: [30, 30] })
      else map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
    } else if (bbox && !hasClickHandler) {
      L.rectangle(
        [[bbox.south, bbox.west], [bbox.north, bbox.east]],
        { color: SHAPE_COLOR, weight: 2, fillColor: SHAPE_COLOR, fillOpacity: 0.18 },
      ).addTo(map)
      map.fitBounds([[bbox.south, bbox.west], [bbox.north, bbox.east]], { padding: [30, 30] })
    } else if (bbox && hasClickHandler) {
      // Use bbox only for initial centering — no rectangle drawn
      map.fitBounds([[bbox.south, bbox.west], [bbox.north, bbox.east]], { padding: [30, 30] })
    } else {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
    }

    if (hasClickHandler) {
      map.on("click", (e) => {
        onPointClickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng })
      })
    }

    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(containerRef.current!)

    mapRef.current = map

    return () => {
      ro.disconnect()
      markerRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [key, interactive, hasClickHandler])

  // Sync the selected point marker independently — map is not rebuilt on point changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (markerRef.current) { markerRef.current.remove(); markerRef.current = null }

    if (point) {
      markerRef.current = L.circleMarker([point.lat, point.lng], {
        color: SHAPE_COLOR,
        fillColor: SHAPE_COLOR,
        fillOpacity: 0.85,
        radius: 7,
        weight: 2,
      }).addTo(map)
    }
  }, [point, key, interactive, hasClickHandler])

  return (
    <div className="border" style={{ borderRadius: 8, overflow: "hidden", isolation: "isolate" }}>
      <div
        ref={containerRef}
        style={{
          height,
          width: "100%",
          pointerEvents: isInteractive ? "auto" : "none",
          cursor: hasClickHandler ? "crosshair" : undefined,
        }}
      />
      {caption && (
        <div
          style={{
            fontSize: 11,
            padding: "6px 10px",
            color: "var(--muted-foreground)",
            borderTop: "1px solid var(--border)",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {caption}
        </div>
      )}
    </div>
  )
}
