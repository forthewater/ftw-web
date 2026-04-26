import { useState } from "react"
import { Link, useLocation } from "react-router"
import { Bell, Map, Clock, Settings, Moon, Sun, Menu, X } from "lucide-react"
import { Button } from "./ui/button"
import type { Area } from "../lib/data"

type NavRoute = "alerts" | "areas" | "history" | "settings"

export function AppShell({
  area,
  dark,
  onDark,
  children,
  totalActiveAlerts,
}: {
  area: Area | null
  dark: boolean
  onDark: () => void
  totalActiveAlerts: number
  children: React.ReactNode
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { pathname } = useLocation()

  const navItems: { id: NavRoute; label: string; icon: any; badge?: number }[] =
    [
      { id: "alerts", label: "Alerts", icon: Bell, badge: totalActiveAlerts },
      { id: "areas", label: "Areas", icon: Map },
      { id: "history", label: "Historical view", icon: Clock },
      { id: "settings", label: "Settings", icon: Settings },
    ]

  const navContent = (
    <>
      <div className="px-5 py-5 border-b flex items-center justify-between">
        <div className="flex flex-col items-start gap-4">
          {/* <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1.5C7 1.5 2.5 6 2.5 9.2C2.5 11.5 4.5 13 7 13C9.5 13 11.5 11.5 11.5 9.2C11.5 6 7 1.5 7 1.5Z"
                fill="#fff"
              />
            </svg>
          </div> */}
          <div
            style={{
              padding: "0.75rem",
            }}
            className="bg-white rounded-lg flex items-center justify-center max-w-1/2"
          >
            <img src="/logo.png" alt="Finora" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Finora</div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
              Predict • Protect • Preserve
            </div>
          </div>
        </div>
        <button
          className="lg:hidden p-1"
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="px-2 py-3 flex-1 overflow-auto">
        {navItems.map(({ id, label, icon: Icon, badge }) => {
          const active = pathname.startsWith(`/${id}`)
          return (
            <Link
              key={id}
              to={`/${id}`}
              onClick={() => setMobileNavOpen(false)}
              className="w-full flex items-center justify-between px-3 py-2 mb-0.5 transition-colors"
              style={{
                borderRadius: 6,
                background: active ? "var(--accent)" : "transparent",
                color: active
                  ? "var(--accent-foreground)"
                  : "var(--foreground)",
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                textDecoration: "none",
              }}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={15} />
                {label}
              </span>
              {badge !== undefined && badge > 0 && (
                <span
                  style={{
                    background: "var(--severity-critical-bg)",
                    color: "var(--severity-critical)",
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "1px 7px",
                    borderRadius: 999,
                  }}
                >
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="border-t px-3 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onDark}
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
          {dark ? "Light mode" : "Dark mode"}
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside
        className="border-r flex-col hidden lg:flex shrink-0"
        style={{ width: 240, background: "var(--sidebar)" }}
      >
        {navContent}
      </aside>

      {mobileNavOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 border-r flex flex-col lg:hidden"
            style={{ width: 260, background: "var(--sidebar)" }}
          >
            {navContent}
          </aside>
        </>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="border-b px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              className="lg:hidden p-1.5 -ml-1.5 shrink-0"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "var(--primary)",
                  flexShrink: 0,
                }}
              />
              <span
                className="truncate"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                {area ? area.waterBodyDetails.name : "All areas"}
              </span>
            </div>
          </div>

          <div
            className="hidden md:block truncate"
            style={{ fontSize: 12, color: "var(--muted-foreground)" }}
          >
            {area
              ? `Last pass: ${area.weeklyWaterMetrics.length ? new Date(area.weeklyWaterMetrics[area.weeklyWaterMetrics.length - 1].to).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"} · Next: —`
              : null}
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
