import { useState } from "react"
import { AlertItem } from "../components/AlertItem"
import { Skeleton } from "../components/ui/skeleton"
import { CheckCircle2 } from "lucide-react"
import type { Alert, Area } from "../lib/data"
import { AreaSelector } from "../components/AreaSelector"

const filters = ["All", "Active", "Acknowledged", "Resolved"] as const
type Filter = (typeof filters)[number]

function AlertItemSkeleton() {
  return (
    <div className="flex gap-3 border bg-card p-4 rounded-xl">
      <Skeleton className="w-1 rounded-full self-stretch shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 shrink-0" />
    </div>
  )
}

export function AlertInbox({
  alerts,
  loading,
  area,
  areas,
  onArea,
  onOpen,
  onAcknowledge,
}: {
  alerts: Alert[]
  loading?: boolean
  area: Area | null
  areas: Area[]
  onArea: (a: Area | null) => void
  onOpen: (a: Alert) => void
  onAcknowledge: (id: string) => void
}) {
  const [filter, setFilter] = useState<Filter>("All")

  const visible = alerts.filter((a) => {
    if (area && a.areaId !== area.id) return false
    if (filter === "All") return a.status !== "resolved"
    return a.status === filter.toLowerCase()
  })

  const heading = area ? `Alerts — ${area.name}` : "Alerts — All areas"

  const sorted = [...visible].sort((a, b) => {
    const order = { active: 0, acknowledged: 1, resolved: 2 } as const
    return order[a.status] - order[b.status]
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1100px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1>{heading}</h1>
          {area && (
            <div
              style={{
                color: "var(--muted-foreground)",
                fontSize: 13,
                marginTop: 4,
              }}
            >
              Last satellite pass: {area.lastPass} · Next scheduled pass:{" "}
              {area.nextPass}
            </div>
          )}
        </div>
        <AreaSelector
          areas={areas}
          value={area?.id ?? null}
          onChange={(id) => onArea(areas.find((a) => a.id === id) ?? null)}
          allowAll
        />
      </div>

      <div className="flex gap-1 border-b overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: filter === f ? 500 : 400,
              color:
                filter === f ? "var(--primary)" : "var(--muted-foreground)",
              borderBottom:
                filter === f
                  ? "2px solid var(--primary)"
                  : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <AlertItemSkeleton key={i} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="border flex flex-col items-center justify-center py-16"
          style={{ borderRadius: 12, gap: 8 }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "var(--severity-ok-bg)",
              color: "var(--severity-ok)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>No active alerts</div>
          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            Last checked {area?.lastPass ?? "Apr 22, 2026"}.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((a) => (
            <div
              key={a.id}
              onClick={() => onOpen(a)}
              style={{ cursor: "pointer" }}
            >
              <AlertItem
                severity={a.severity}
                area={a.areaName}
                title={a.title}
                detail={`${a.index} ${a.value.toFixed(2)} · threshold ${a.threshold.toFixed(2)} · active for ${a.durationDays} days`}
                timestamp={a.timestamp}
                acknowledged={a.status !== "active"}
                onAcknowledge={
                  a.status === "active" ? () => onAcknowledge(a.id) : undefined
                }
                acknowledgedBy={a.acknowledgedBy}
                acknowledgedAt={a.acknowledgedAt}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
