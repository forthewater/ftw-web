import { useState, useMemo } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, MapPin, Layers, Pencil, Activity } from "lucide-react"
import { Button } from "./ui/button"
import { SeverityBadge, type Severity } from "./SeverityBadge"
import { MetricCard } from "./MetricCard"
import { TrendChart } from "./TrendChart"
import type { Area, Alert } from "../lib/data"
import { trendNDCI } from "../lib/data"

// ── Types ─────────────────────────────────────────────────────────────────────

type Pin = {
  id: string
  name: string
  lon: number
  lat: number
  ndci: number
  ndti: number
  ndwi: number
  severity: Severity
  lastReading: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generatePins(area: Area): Pin[] {
  const { west, south, east, north } = area.bbox
  const seed = area.id.charCodeAt(0) + area.id.length * 17
  const rand = (n: number) => {
    const x = Math.sin(seed + n) * 10000
    return x - Math.floor(x)
  }
  const stations = [
    {
      name: "North inlet",
      sev: "warning" as Severity,
      ndci: 0.18,
      ndti: -0.04,
    },
    {
      name: "Central basin",
      sev: "critical" as Severity,
      ndci: 0.21,
      ndti: -0.06,
    },
    { name: "Dam outflow", sev: "ok" as Severity, ndci: 0.05, ndti: -0.08 },
    { name: "South cove", sev: "warning" as Severity, ndci: 0.13, ndti: -0.05 },
    { name: "East shore", sev: "ok" as Severity, ndci: 0.07, ndti: -0.07 },
  ]
  return stations.map((s, i) => ({
    id: `${area.id}-pin-${i}`,
    name: s.name,
    lon: west + (east - west) * (0.15 + rand(i * 2) * 0.7),
    lat: south + (north - south) * (0.15 + rand(i * 2 + 1) * 0.7),
    ndci: s.ndci,
    ndti: s.ndti,
    ndwi: 0.66 + (rand(i + 5) - 0.5) * 0.04,
    severity: s.sev,
    lastReading: area.lastPass,
  }))
}

const sevColor: Record<Severity, string> = {
  critical: "var(--severity-critical)",
  warning: "var(--severity-warning)",
  ok: "var(--severity-ok)",
  info: "var(--severity-info)",
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
  const pins = useMemo(() => (area ? generatePins(area) : []), [area])
  const [selected, setSelected] = useState<string | null>(null)
  const [overlay, setOverlay] = useState<"none" | "ndci">("ndci")

  if (!area) return null

  const selectedPin = pins.find((p) => p.id === selected) ?? null
  const areaAlerts = alerts.filter((a) => a.areaId === area.id)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content className="fixed inset-0 z-50 bg-background flex flex-col outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0">
          <DialogPrimitive.Title className="sr-only">
            {area.name}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Detailed map view of {area.name} with sampling station data.
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
                  {area.name}
                </div>
                <div
                  className="truncate hidden sm:block"
                  style={{
                    fontSize: 11,
                    color: "var(--muted-foreground)",
                    fontFamily: "ui-monospace, monospace",
                  }}
                >
                  W {area.bbox.west} · S {area.bbox.south} · E {area.bbox.east}{" "}
                  · N {area.bbox.north}
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

          <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
            <div className="relative flex-1 min-h-[320px] lg:min-h-0 bg-secondary">
              <MapCanvas
                bbox={area.bbox}
                pins={pins}
                selectedId={selected}
                onSelect={setSelected}
                overlay={overlay}
              />
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                <div
                  className="bg-card border flex"
                  style={{ borderRadius: 8, padding: 4, gap: 2 }}
                >
                  <ToggleBtn
                    active={overlay === "ndci"}
                    onClick={() => setOverlay("ndci")}
                  >
                    <Layers size={12} /> NDCI overlay
                  </ToggleBtn>
                  <ToggleBtn
                    active={overlay === "none"}
                    onClick={() => setOverlay("none")}
                  >
                    None
                  </ToggleBtn>
                </div>
              </div>
              <div
                className="absolute bottom-3 left-3 bg-card border"
                style={{ borderRadius: 8, padding: "8px 10px", fontSize: 11 }}
              >
                <div style={{ fontWeight: 500, marginBottom: 4 }}>
                  NDCI legend
                </div>
                <div
                  className="flex gap-2 items-center"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {[
                    { c: "#1f4a72", l: "<0" },
                    { c: "#2c6e7d", l: "0.05" },
                    { c: "#c8b942", l: "0.10" },
                    { c: "#f0c14a", l: "0.20" },
                    { c: "#A32D2D", l: ">0.20" },
                  ].map((x) => (
                    <span key={x.l} className="flex items-center gap-1">
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          background: x.c,
                          borderRadius: 2,
                        }}
                      />
                      {x.l}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className="absolute bottom-3 right-3 bg-card border"
                style={{
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                }}
              >
                {pins.length} sampling stations · pass {area.lastPass}
              </div>
            </div>

            <aside className="lg:w-[360px] lg:border-l border-t lg:border-t-0 overflow-auto bg-card shrink-0">
              <div className="p-5 space-y-5">
                {selectedPin ? (
                  <PinDetail
                    pin={selectedPin}
                    onClear={() => setSelected(null)}
                  />
                ) : (
                  <AreaSummary area={area} pins={pins} alerts={areaAlerts} />
                )}
              </div>
            </aside>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

// ── MapCanvas ────────────────────────────────────────────────────────────────

function MapCanvas({
  bbox,
  pins,
  selectedId,
  onSelect,
  overlay,
}: {
  bbox: Area["bbox"]
  pins: Pin[]
  selectedId: string | null
  onSelect: (id: string) => void
  overlay: "none" | "ndci"
}) {
  const { west, south, east, north } = bbox
  const w = east - west
  const h = north - south
  const pad = 0.12
  const padX = w * pad
  const padY = h * pad
  const vbW = w + padX * 2
  const vbH = h + padY * 2
  const vbX = west - padX
  const vbY = -(north + padY)

  const projX = (lon: number) => lon
  const projY = (lat: number) => -lat

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      style={{ display: "block" }}
      role="img"
      aria-label={`Map showing sampling stations for ${bbox.west}, ${bbox.south} to ${bbox.east}, ${bbox.north}`}
    >
      <defs>
        <pattern
          id="grid"
          width={vbW / 12}
          height={vbH / 12}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${vbW / 12} 0 L 0 0 0 ${vbH / 12}`}
            fill="none"
            stroke="var(--border)"
            strokeWidth={vbW * 0.001}
          />
        </pattern>
        <radialGradient id="overlayGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#A32D2D" stopOpacity="0.55" />
          <stop offset="35%" stopColor="#f0c14a" stopOpacity="0.45" />
          <stop offset="65%" stopColor="#c8b942" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2c6e7d" stopOpacity="0.25" />
        </radialGradient>
      </defs>

      <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="var(--secondary)" />
      <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="url(#grid)" />

      {/* water body silhouette */}
      <path
        d={`
          M ${west + w * 0.1}  ${-north + h * 0.25}
          C ${west + w * 0.05} ${-north + h * 0.55},
            ${west + w * 0.25} ${-north + h * 0.95},
            ${west + w * 0.55} ${-north + h * 0.92}
          C ${west + w * 0.85} ${-north + h * 0.88},
            ${west + w * 1.0}  ${-north + h * 0.55},
            ${west + w * 0.92} ${-north + h * 0.3}
          C ${west + w * 0.78} ${-north + h * 0.05},
            ${west + w * 0.35} ${-north + h * 0.05},
            ${west + w * 0.1}  ${-north + h * 0.25} Z
        `}
        fill={overlay === "ndci" ? "url(#overlayGrad)" : "var(--accent)"}
        stroke="var(--primary)"
        strokeWidth={vbW * 0.002}
        opacity={overlay === "ndci" ? 0.92 : 0.55}
      />

      {/* bbox rectangle */}
      <rect
        x={west}
        y={-north}
        width={w}
        height={h}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={vbW * 0.0025}
        strokeDasharray={`${vbW * 0.01} ${vbW * 0.005}`}
      />

      <CornerLabel
        x={west}
        y={-north}
        text={`${west.toFixed(2)}, ${north.toFixed(2)}`}
        dx={vbW * 0.005}
        dy={-vbH * 0.01}
      />
      <CornerLabel
        x={east}
        y={-south}
        text={`${east.toFixed(2)}, ${south.toFixed(2)}`}
        dx={-vbW * 0.005}
        dy={vbH * 0.025}
        anchor="end"
      />

      {/* pins */}
      {pins.map((p) => {
        const isSel = p.id === selectedId
        const r = vbW * (isSel ? 0.018 : 0.013)
        return (
          <g
            key={p.id}
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(p.id)}
            role="button"
            aria-label={`${p.name}: ${p.severity}`}
            tabIndex={0}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && onSelect(p.id)
            }
          >
            <circle
              cx={projX(p.lon)}
              cy={projY(p.lat)}
              r={r * 1.6}
              fill={sevColor[p.severity]}
              opacity={0.18}
            />
            <circle
              cx={projX(p.lon)}
              cy={projY(p.lat)}
              r={r}
              fill={sevColor[p.severity]}
              stroke="#fff"
              strokeWidth={vbW * 0.0025}
            />
            {isSel && (
              <circle
                cx={projX(p.lon)}
                cy={projY(p.lat)}
                r={r * 2.2}
                fill="none"
                stroke={sevColor[p.severity]}
                strokeWidth={vbW * 0.0015}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── AreaSummary ───────────────────────────────────────────────────────────────

function AreaSummary({
  area,
  pins,
  alerts,
}: {
  area: Area
  pins: Pin[]
  alerts: Alert[]
}) {
  const avgNDCI = pins.reduce((s, p) => s + p.ndci, 0) / pins.length
  const worst = pins.reduce((acc, p) => (p.ndci > acc.ndci ? p : acc), pins[0])
  const sevCount = pins.reduce<Record<Severity, number>>(
    (acc, p) => ({ ...acc, [p.severity]: (acc[p.severity] ?? 0) + 1 }),
    { critical: 0, warning: 0, ok: 0, info: 0 },
  )

  return (
    <>
      <div>
        <h2>{area.name}</h2>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted-foreground)",
            marginTop: 2,
          }}
        >
          {area.active ? "Active monitoring" : "Paused"} · {pins.length}{" "}
          stations · indices {area.indices.join(" · ")}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Avg NDCI"
          value={avgNDCI.toFixed(2)}
          trend="up"
          trendLabel="across stations"
        />
        <MetricCard
          label="Active alerts"
          value={alerts.filter((a) => a.status === "active").length}
          trend="flat"
          trendLabel={`${alerts.length} total`}
        />
        <MetricCard
          label="Worst station"
          value={worst.name}
          trend="up"
          trendLabel={`NDCI ${worst.ndci.toFixed(2)}`}
          improving={false}
        />
        {/* <MetricCard label="Last pass" value={area.lastPass.replace(", 2026", "")} trend="flat" trendLabel={`Next: ${area.nextPass.replace(", 2026", "")}`} /> */}
      </div>

      <div className="border" style={{ borderRadius: 8, padding: 12 }}>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={14} />
          <h3 style={{ marginBottom: 0 }}>Station status</h3>
        </div>
        <div className="space-y-1.5" style={{ fontSize: 12 }}>
          <StatusRow
            label="Critical"
            count={sevCount.critical}
            color={sevColor.critical}
          />
          <StatusRow
            label="Warning"
            count={sevCount.warning}
            color={sevColor.warning}
          />
          <StatusRow label="OK" count={sevCount.ok} color={sevColor.ok} />
        </div>
      </div>

      <div>
        <h3>NDCI trend · 6 months</h3>
        <TrendChart data={trendNDCI} warning={0.1} critical={0.2} />
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
          value={pin.ndti.toFixed(2)}
          trend="flat"
          trendLabel="clear"
        />
        <MetricCard
          label="NDWI"
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

// ── Shared helpers ────────────────────────────────────────────────────────────

function CornerLabel({
  x,
  y,
  text,
  dx,
  dy,
  anchor = "start",
}: {
  x: number
  y: number
  text: string
  dx: number
  dy: number
  anchor?: "start" | "end"
}) {
  return (
    <text
      x={x + dx}
      y={y + dy}
      fontSize={0.012}
      fontFamily="ui-monospace, monospace"
      fill="var(--muted-foreground)"
      textAnchor={anchor}
      style={{ fontSize: "0.012em" }}
    >
      <tspan style={{ fontSize: "10px" }}>{text}</tspan>
    </text>
  )
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5"
      style={{
        padding: "5px 10px",
        borderRadius: 6,
        background: active ? "var(--accent)" : "transparent",
        color: active ? "var(--accent-foreground)" : "var(--foreground)",
        fontSize: 12,
        fontWeight: active ? 500 : 400,
      }}
    >
      {children}
    </button>
  )
}

function StatusRow({
  label,
  count,
  color,
}: {
  label: string
  count: number
  color: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <span
          style={{ width: 8, height: 8, borderRadius: 999, background: color }}
        />
        {label}
      </span>
      <span style={{ fontWeight: 500 }}>{count}</span>
    </div>
  )
}
