import { useState } from "react"
import { Button } from "../components/ui/button"
import { MetricCard } from "../components/MetricCard"
import { TrendChart, NDTIBarChart } from "../components/TrendChart"
import { BBoxMap } from "../components/BBoxMap"
import { Skeleton } from "../components/ui/skeleton"
import { FileSpreadsheet, FileText } from "lucide-react"
import type { Area } from "../lib/data"
import { useAreas } from "../lib/hooks/useAreas"
import { useTrend } from "../lib/hooks/useTrend"
import { AreaSelector } from "../components/AreaSelector"
import { formatGeometryBounds } from "../lib/geometry"

export function Historical({
  initialArea,
  onArea,
  onExport,
}: {
  initialArea: Area | null
  onArea: (a: Area | null) => void
  onExport: () => void
}) {
  const { areas: allAreas } = useAreas()
  const [areaId, setAreaId] = useState<string | null>(
    initialArea?.id ?? allAreas[0]?.id ?? null,
  )
  const area = allAreas.find((a) => a.id === areaId) ?? allAreas[0]

  const handleAreaChange = (id: string | null) => {
    setAreaId(id)
    onArea(allAreas.find((a) => a.id === id) ?? null)
  }

  const { data: trendNDCI, loading: trendLoading } = useTrend(
    areaId ?? "",
    "NDCI",
  )
  const { data: trendNDTI } = useTrend(areaId ?? "", "NDTI")

  if (!area) return null

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1100px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1>{area.name}</h1>
          <div
            style={{
              color: "var(--muted-foreground)",
              fontSize: 13,
              marginTop: 4,
              fontFamily: "ui-monospace, monospace",
            }}
          >
            {formatGeometryBounds(area)}
          </div>
        </div>
        <AreaSelector areas={allAreas} value={areaId} onChange={handleAreaChange} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="NDCI current"
          value="0.21"
          trend="up"
          trendLabel="+0.15 vs Nov"
          improving={false}
        />
        <MetricCard
          label="NDTI current"
          value="-0.06"
          trend="flat"
          trendLabel="stable"
        />
        <MetricCard
          label="Water extent"
          value="66"
          unit="%"
          trend="down"
          trendLabel="-5% vs Nov"
          improving={false}
        />
        <MetricCard
          label="Last / next pass"
          value={area.lastPass.replace(", 2026", "")}
          trend="flat"
          trendLabel={`Next: ${area.nextPass.replace(", 2026", "")}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="border bg-card"
          style={{ borderRadius: 12, padding: 20 }}
        >
          <h3>NDCI — Chlorophyll</h3>
          <div
            style={{
              fontSize: 12,
              color: "var(--muted-foreground)",
              marginBottom: 8,
            }}
          >
            6-month trend with thresholds
          </div>
          {trendLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <TrendChart data={trendNDCI} warning={0.1} critical={0.2} />
          )}
        </div>
        <div
          className="border bg-card"
          style={{ borderRadius: 12, padding: 20 }}
        >
          <h3>NDTI — Turbidity</h3>
          <div
            style={{
              fontSize: 12,
              color: "var(--muted-foreground)",
              marginBottom: 8,
            }}
          >
            Negative = clear water · Positive = turbid
          </div>
          {trendLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <NDTIBarChart data={trendNDTI} />
          )}
        </div>
      </div>

      <div className="border bg-card" style={{ borderRadius: 12, padding: 20 }}>
        <div className="flex items-center justify-between mb-3">
          <h3>Bounding box & latest NDCI overlay</h3>
          {/* <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            Last pass: {area.lastPass}
          </span> */}
        </div>
        <BBoxMap
          bbox={area.bbox}
          polygon={area.polygon}
          height={260}
          interactive
        />
      </div>

      <div
        className="border bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        style={{ borderRadius: 12, padding: 20 }}
      >
        <div>
          <h3>Export historical data</h3>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            CSV for analysts · PDF for decision makers
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExport}>
            <FileSpreadsheet size={14} /> CSV
          </Button>
          <Button onClick={onExport}>
            <FileText size={14} /> PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
