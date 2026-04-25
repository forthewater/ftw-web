import { Plus, Pencil, Trash2, Maximize2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Switch } from "../components/ui/switch"
import { BBoxMap } from "../components/BBoxMap"
import { Skeleton } from "../components/ui/skeleton"
import type { Area } from "../lib/data"
import { formatGeometryBounds } from "../lib/geometry"

function AreaCardSkeleton() {
  return (
    <div className="border bg-card rounded-xl overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
      <Skeleton className="h-[130px] w-full rounded-none" />
      <div className="p-3 flex justify-between items-center">
        <Skeleton className="h-3 w-1/4" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-7 w-14" />
        </div>
      </div>
    </div>
  )
}

export function Areas({
  areas,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  onView,
}: {
  areas: Area[]
  loading?: boolean
  onAdd: () => void
  onEdit: (a: Area) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
  onView: (a: Area) => void
}) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1100px] mx-auto space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1>Monitored areas</h1>
          <div
            style={{
              color: "var(--muted-foreground)",
              fontSize: 13,
              marginTop: 2,
            }}
          >
            {areas.length} areas · {areas.filter((a) => a.active).length} active
          </div>
        </div>
        <Button onClick={onAdd}>
          <Plus size={14} /> Add area
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <AreaCardSkeleton key={i} />
            ))
          : areas.map((a) => (
              <div
                key={a.id}
                className="border bg-card flex flex-col hover:border-[var(--primary)] transition-colors"
                style={{ borderRadius: 12, padding: 16, gap: 12 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 style={{ marginBottom: 0 }}>{a.waterBodyDetails.name}</h3>
                      {a.activeAlerts > 0 ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            padding: "1px 7px",
                            borderRadius: 999,
                            background: "var(--severity-critical-bg)",
                            color: "var(--severity-critical)",
                          }}
                        >
                          {a.activeAlerts} active
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            padding: "1px 7px",
                            borderRadius: 999,
                            background: "var(--secondary)",
                            color: "var(--muted-foreground)",
                          }}
                        >
                          0 active
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted-foreground)",
                        marginTop: 2,
                        fontFamily: "ui-monospace, monospace",
                      }}
                    >
                      {formatGeometryBounds(a)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{ fontSize: 11, color: "var(--muted-foreground)" }}
                    >
                      {a.active ? "Active" : "Paused"}
                    </span>
                    <Switch
                      checked={a.active}
                      onCheckedChange={() => onToggle(a.id)}
                    />
                  </div>
                </div>

                <button
                  onClick={() => onView(a)}
                  className="relative group block w-full text-left"
                  style={{ borderRadius: 8, overflow: "hidden" }}
                  aria-label={`Open detailed view for ${a.waterBodyDetails.name}`}
                >
                  <BBoxMap bbox={a.waterBodyDetails.bbox} polygon={a.waterBodyDetails.polygon} height={130} />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(24, 95, 165, 0.18)" }}
                  >
                    <span
                      className="inline-flex items-center gap-1.5"
                      style={{
                        background: "var(--card)",
                        color: "var(--primary)",
                        border: "1px solid var(--border)",
                        padding: "6px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      <Maximize2 size={12} /> Open detailed view
                    </span>
                  </div>
                </button>

                <div
                  className="flex items-center justify-between flex-wrap gap-2"
                  style={{ fontSize: 12 }}
                >
                  <div style={{ color: "var(--muted-foreground)" }}>
                    Last pass: {a.weeklyWaterMetrics[a.weeklyWaterMetrics.length - 1]?.to
                      ? new Date(a.weeklyWaterMetrics[a.weeklyWaterMetrics.length - 1].to).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(a)}>
                      <Maximize2 size={13} /> View
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(a)}>
                      <Pencil size={13} /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete "${a.waterBodyDetails.name}"?`)) onDelete(a.id)
                      }}
                      style={{ color: "var(--severity-critical)" }}
                    >
                      <Trash2 size={13} /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}
