import { lazy, Suspense, useEffect, useMemo, useReducer, useState } from "react"
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router"
import { AppShell } from "./components/AppShell"
import { AlertInbox } from "./screens/AlertInbox"
import { AlertDetail } from "./screens/AlertDetail"
import { Areas } from "./screens/Areas"
import { Historical } from "./screens/Historical"
import { Settings } from "./screens/Settings"
import { useAreas } from "./lib/hooks/useAreas"
import { useAlerts } from "./lib/hooks/useAlerts"
import type { Area, Alert } from "./lib/data"

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

// ── UI state ─────────────────────────────────────────────────────────────────

type UIState = {
  exportOpen: boolean
  drawerOpen: boolean
  drawerArea: Area | null
  detailOpen: boolean
  detailArea: Area | null
  dark: boolean
}

type UIAction =
  | { type: "openExport" }
  | { type: "closeExport" }
  | { type: "openDrawer"; area: Area | null }
  | { type: "closeDrawer" }
  | { type: "openDetail"; area: Area }
  | { type: "closeDetail" }
  | { type: "toggleDark" }
  | { type: "setDark"; dark: boolean }

const initialUI: UIState = {
  exportOpen: false,
  drawerOpen: false,
  drawerArea: null,
  detailOpen: false,
  detailArea: null,
  dark: false,
}

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
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
    case "setDark":
      return { ...state, dark: action.dark }
  }
}

// ── AlertDetail route wrapper ─────────────────────────────────────────────────

function AlertDetailRoute({
  alerts,
  onExport,
  onAcknowledge,
}: {
  alerts: Alert[]
  onExport: () => void
  onAcknowledge: (id: string) => void
}) {
  const { alertId } = useParams<{ alertId: string }>()
  const navigate = useNavigate()
  const alert = alerts.find((a) => a.id === alertId)
  if (!alert) return <Navigate to="/alerts" replace />
  return (
    <AlertDetail
      alert={alert}
      onBack={() => navigate("/alerts")}
      onExport={onExport}
      onAcknowledge={onAcknowledge}
    />
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function App() {
  const [ui, dispatch] = useReducer(uiReducer, undefined, (): UIState => {
    const stored = localStorage.getItem("theme")
    const dark =
      stored === "dark" ? true
      : stored === "light" ? false
      : window.matchMedia("(prefers-color-scheme: dark)").matches
    return { ...initialUI, dark }
  })
  const [activeArea, setActiveArea] = useState<Area | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const {
    areas,
    addArea,
    editArea,
    deleteArea,
    toggleArea,
    loading: areasLoading,
    refetch: refetchAreas,
  } = useAreas()
  const {
    alerts,
    acknowledge,
    loading: alertsLoading,
    refetch: refetchAlerts,
  } = useAlerts(activeArea?.id)

  // Sync dark class to <html> and persist to localStorage
  useEffect(() => {
    document.documentElement.classList.toggle("dark", ui.dark)
    localStorage.setItem("theme", ui.dark ? "dark" : "light")
  }, [ui.dark])

  // Follow system preference changes when no manual override is stored
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        dispatch({ type: "setDark", dark: e.matches })
      }
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  // Refetch data on every route change
  useEffect(() => {
    refetchAreas()
    refetchAlerts()
  }, [location.pathname])

  const totalActive = useMemo(
    () => alerts.filter((a) => a.status === "active").length,
    [alerts],
  )

  return (
    <div>
      <AppShell
        area={activeArea}
        dark={ui.dark}
        onDark={() => dispatch({ type: "toggleDark" })}
        totalActiveAlerts={totalActive}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/alerts" replace />} />

          <Route
            path="/alerts"
            element={
              <AlertInbox
                alerts={alerts}
                loading={alertsLoading}
                area={activeArea}
                areas={areas}
                onArea={setActiveArea}
                onOpen={(alert) => navigate(`/alerts/${alert.id}`)}
                onAcknowledge={acknowledge}
              />
            }
          />

          <Route
            path="/alerts/:alertId"
            element={
              <AlertDetailRoute
                alerts={alerts}
                onExport={() => dispatch({ type: "openExport" })}
                onAcknowledge={acknowledge}
              />
            }
          />

          <Route
            path="/areas"
            element={
              <Areas
                areas={areas}
                loading={areasLoading}
                onAdd={() => dispatch({ type: "openDrawer", area: null })}
                onEdit={(a) => dispatch({ type: "openDrawer", area: a })}
                onDelete={deleteArea}
                onToggle={toggleArea}
                onView={(a) => dispatch({ type: "openDetail", area: a })}
              />
            }
          />

          <Route
            path="/history"
            element={
              <Historical
                initialArea={activeArea}
                onArea={setActiveArea}
                onExport={() => dispatch({ type: "openExport" })}
              />
            }
          />

          <Route path="/settings" element={<Settings />} />
        </Routes>
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
          onSave={async (a) => {
            const exists = areas.find((x) => x.id === a.id)
            await (exists ? editArea(a) : addArea(a))
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
