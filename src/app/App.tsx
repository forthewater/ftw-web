import { lazy, Suspense, useMemo, useReducer, useState } from "react"
import { AppShell, type Route } from "./components/AppShell"
import { AlertInbox } from "./screens/AlertInbox"
import { AlertDetail } from "./screens/AlertDetail"
import { Areas } from "./screens/Areas"
import { Historical } from "./screens/Historical"
import { Settings } from "./screens/Settings"
import { useAreas } from "./lib/hooks/useAreas"
import { useAlerts } from "./lib/hooks/useAlerts"

const ExportModal = lazy(() =>
  import("./components/ExportModal").then((m) => ({ default: m.ExportModal })),
)
const AreaDrawer = lazy(() =>
  import("./components/AreaDrawer").then((m) => ({ default: m.AreaDrawer })),
)
const AreaDetailDialog = lazy(() =>
  import("./components/AreaDetailDialog").then((m) => ({
    default: m.AreaDetailDialog,
  })),
)
import type { Area, Alert } from "./lib/data"

// ── UI state ─────────────────────────────────────────────────────────────────

type UIState = {
  route: Route
  openAlert: Alert | null
  exportOpen: boolean
  drawerOpen: boolean
  drawerArea: Area | null
  detailOpen: boolean
  detailArea: Area | null
  dark: boolean
}

type UIAction =
  | { type: "navigate"; route: Route }
  | { type: "openAlert"; alert: Alert }
  | { type: "closeAlert" }
  | { type: "openExport" }
  | { type: "closeExport" }
  | { type: "openDrawer"; area: Area | null }
  | { type: "closeDrawer" }
  | { type: "openDetail"; area: Area }
  | { type: "closeDetail" }
  | { type: "toggleDark" }

const initialUI: UIState = {
  route: "alerts",
  openAlert: null,
  exportOpen: false,
  drawerOpen: false,
  drawerArea: null,
  detailOpen: false,
  detailArea: null,
  dark: false,
}

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "navigate":
      return { ...state, route: action.route, openAlert: null }
    case "openAlert":
      return { ...state, openAlert: action.alert }
    case "closeAlert":
      return { ...state, openAlert: null }
    case "openExport":
      return { ...state, exportOpen: true }
    case "closeExport":
      return { ...state, exportOpen: false }
    case "openDrawer":
      return { ...state, drawerOpen: true, drawerArea: action.area }
    case "closeDrawer":
      return { ...state, drawerOpen: false }
    case "openDetail":
      return { ...state, detailOpen: true, detailArea: action.area }
    case "closeDetail":
      return { ...state, detailOpen: false }
    case "toggleDark":
      return { ...state, dark: !state.dark }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function App() {
  const [ui, dispatch] = useReducer(uiReducer, initialUI)
  const [activeArea, setActiveArea] = useState<Area | null>(null)

  const { areas, addArea, editArea, deleteArea, toggleArea, loading: areasLoading } = useAreas()
  const { alerts, acknowledge, loading: alertsLoading } = useAlerts(activeArea?.id)

  const totalActive = useMemo(
    () => alerts.filter((a) => a.status === "active").length,
    [alerts],
  )

  return (
    <div className={ui.dark ? "dark" : ""}>
      <AppShell
        route={ui.route}
        onRoute={(r) => dispatch({ type: "navigate", route: r })}
        area={activeArea}
        dark={ui.dark}
        onDark={() => dispatch({ type: "toggleDark" })}
        totalActiveAlerts={totalActive}
      >
        {ui.route === "alerts" && !ui.openAlert && (
          <AlertInbox
            alerts={alerts}
            loading={alertsLoading}
            area={activeArea}
            areas={areas}
            onArea={setActiveArea}
            onOpen={(alert) => dispatch({ type: "openAlert", alert })}
            onAcknowledge={acknowledge}
          />
        )}

        {ui.route === "alerts" && ui.openAlert && (
          <AlertDetail
            alert={
              alerts.find((a) => a.id === ui.openAlert!.id) ?? ui.openAlert
            }
            onBack={() => dispatch({ type: "closeAlert" })}
            onExport={() => dispatch({ type: "openExport" })}
            onAcknowledge={acknowledge}
          />
        )}

        {ui.route === "areas" && (
          <Areas
            areas={areas}
            loading={areasLoading}
            onAdd={() => dispatch({ type: "openDrawer", area: null })}
            onEdit={(a) => dispatch({ type: "openDrawer", area: a })}
            onDelete={deleteArea}
            onToggle={toggleArea}
            onView={(a) => dispatch({ type: "openDetail", area: a })}
          />
        )}

        {ui.route === "history" && (
          <Historical
            initialArea={activeArea}
            onArea={setActiveArea}
            onExport={() => dispatch({ type: "openExport" })}
          />
        )}

        {ui.route === "settings" && <Settings />}
      </AppShell>

      <Suspense>
        <ExportModal
          open={ui.exportOpen}
          onOpenChange={(v) =>
            dispatch({ type: v ? "openExport" : "closeExport" })
          }
        />

        <AreaDrawer
          open={ui.drawerOpen}
          onOpenChange={(v) => {
            if (!v) dispatch({ type: "closeDrawer" })
          }}
          area={ui.drawerArea}
          onSave={(a) => {
            const exists = areas.find((x) => x.id === a.id)
            exists ? editArea(a) : addArea(a)
          }}
          onDelete={deleteArea}
        />

        <AreaDetailDialog
          area={ui.detailArea}
          alerts={alerts}
          open={ui.detailOpen}
          onOpenChange={(v) => {
            if (!v) dispatch({ type: "closeDetail" })
          }}
          onEdit={(a) => {
            dispatch({ type: "closeDetail" })
            setTimeout(() => dispatch({ type: "openDrawer", area: a }), 100)
          }}
        />
      </Suspense>
    </div>
  )
}
