import { useEcologyMetrics } from "../lib/hooks/useEcologyMetrics"
import { MetricCard } from "./MetricCard"
import { SeverityBadge } from "./SeverityBadge"
import type { Severity } from "./SeverityBadge"
import type { DaphniaState } from "../lib/data"

const DAPHNIA_SEVERITY: Record<DaphniaState, Severity> = {
  good:     "ok",
  stressed: "warning",
  critical: "critical",
}

const DAPHNIA_LABEL: Record<DaphniaState, string> = {
  good:     "Healthy population",
  stressed: "Under stress",
  critical: "Collapse risk",
}

export function EcologySection({ areaId }: { areaId: string }) {
  const metrics = useEcologyMetrics(areaId)
  if (metrics.length === 0) return null

  const latest = metrics[metrics.length - 1]
  const prev   = metrics[metrics.length - 2] ?? null

  const tempDelta = prev !== null ? latest.temperatureC - prev.temperatureC : null
  const o2Delta   = prev !== null ? latest.dissolvedOxygenMgL - prev.dissolvedOxygenMgL : null

  const fmt = (d: number | null) =>
    d === null ? "" : `${d >= 0 ? "+" : ""}${d.toFixed(1)} wow`

  return (
    <div>
      <h3 style={{ marginBottom: 10 }}>In-situ conditions</h3>

      <div className="grid grid-cols-2 gap-2" style={{ marginBottom: 8 }}>
        <MetricCard
          label="Temperature"
          description="Water temperature"
          value={latest.temperatureC.toFixed(1)}
          unit="°C"
          trend={tempDelta === null ? "flat" : tempDelta > 0 ? "up" : "down"}
          trendLabel={fmt(tempDelta)}
          improving={tempDelta !== null && tempDelta <= 0}
        />
        <MetricCard
          label="Dissolved O₂"
          description="Oxygen saturation"
          value={latest.dissolvedOxygenMgL.toFixed(1)}
          unit="mg/L"
          trend={o2Delta === null ? "flat" : o2Delta > 0 ? "up" : "down"}
          trendLabel={fmt(o2Delta)}
          improving={o2Delta !== null && o2Delta >= 0}
        />
      </div>

      <div
        className="bg-secondary flex items-center justify-between gap-3"
        style={{ borderRadius: 8, padding: "10px 14px" }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "var(--muted-foreground)",
              fontWeight: 500,
            }}
          >
            Daphnia health
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--muted-foreground)",
              marginTop: 1,
              opacity: 0.75,
            }}
          >
            Zooplankton indicator
          </div>
        </div>
        <SeverityBadge
          severity={DAPHNIA_SEVERITY[latest.daphniaHealth]}
          label={DAPHNIA_LABEL[latest.daphniaHealth]}
        />
      </div>
    </div>
  )
}
