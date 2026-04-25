import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { BBox, PolygonPoint } from "../lib/data"
import { geometryKey, getGeometryBounds } from "../lib/geometry"

const BBOX_COLOR = "#185fa5"

export function BBoxMap({
  bbox,
  polygon,
  height = 180,
  caption,
  interactive = false,
}: {
  bbox?: BBox
  polygon?: PolygonPoint[]
  height?: number
  caption?: string
  interactive?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const key = geometryKey({ bbox, polygon })

  useEffect(() => {
    if (!containerRef.current) return
    const geometryBounds = getGeometryBounds({ bbox, polygon })
    if (!geometryBounds) return

    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    const bounds: L.LatLngBoundsExpression = [
      [geometryBounds.south, geometryBounds.west],
      [geometryBounds.north, geometryBounds.east],
    ]

    const map = L.map(containerRef.current, {
      zoomControl: interactive,
      scrollWheelZoom: interactive,
      dragging: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: false,
      keyboard: false,
      attributionControl: interactive,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    if (polygon?.length && polygon.length >= 3) {
      L.polygon(
        polygon.map((point) => [point.lat, point.lon]),
        {
          color: BBOX_COLOR,
          weight: 2,
          fillColor: BBOX_COLOR,
          fillOpacity: 0.18,
        },
      ).addTo(map)
    } else {
      L.rectangle(bounds, {
        color: BBOX_COLOR,
        weight: 2,
        fillColor: BBOX_COLOR,
        fillOpacity: 0.18,
      }).addTo(map)
    }

    map.fitBounds(bounds, { padding: [30, 30] })

    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(containerRef.current)

    mapRef.current = map

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [key, interactive])

  return (
    <div
      className="border"
      style={{ borderRadius: 8, overflow: "hidden", isolation: "isolate" }}
    >
      <div
        ref={containerRef}
        style={{
          height,
          width: "100%",
          pointerEvents: interactive ? "auto" : "none",
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
