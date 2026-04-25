import { useState } from "react";
import { Bell, Map, Clock, Settings, Check, ChevronDown, Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "./ui/dropdown-menu";
import type { Area } from "../lib/data";

export type Route = "alerts" | "areas" | "history" | "settings";

export function AppShell({
  route,
  onRoute,
  area,
  areas,
  onArea,
  dark,
  onDark,
  children,
  totalActiveAlerts,
}: {
  route: Route;
  onRoute: (r: Route) => void;
  area: Area | null;
  areas: Area[];
  onArea: (a: Area | null) => void;
  dark: boolean;
  onDark: () => void;
  totalActiveAlerts: number;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems: { id: Route; label: string; icon: any; badge?: number }[] = [
    { id: "alerts", label: "Alerts", icon: Bell, badge: totalActiveAlerts },
    { id: "areas", label: "Areas", icon: Map },
    { id: "history", label: "Historical view", icon: Clock },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleRoute = (r: Route) => {
    onRoute(r);
    setMobileNavOpen(false);
  };

  const navContent = (
    <>
      <div className="px-5 py-5 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5C7 1.5 2.5 6 2.5 9.2C2.5 11.5 4.5 13 7 13C9.5 13 11.5 11.5 11.5 9.2C11.5 6 7 1.5 7 1.5Z" fill="#fff" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>WaterWatch</div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Sentinel-2 monitoring</div>
          </div>
        </div>
        <button className="lg:hidden p-1" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>
      <nav className="px-2 py-3 flex-1 overflow-auto">
        {navItems.map(({ id, label, icon: Icon, badge }) => {
          const active = route === id;
          return (
            <button
              key={id}
              onClick={() => handleRoute(id)}
              className="w-full flex items-center justify-between px-3 py-2 mb-0.5 transition-colors"
              style={{
                borderRadius: 6,
                background: active ? "var(--accent)" : "transparent",
                color: active ? "var(--accent-foreground)" : "var(--foreground)",
                fontSize: 13,
                fontWeight: active ? 500 : 400,
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
            </button>
          );
        })}
      </nav>
      <div className="border-t px-3 py-3">
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onDark}>
          {dark ? <Sun size={14} /> : <Moon size={14} />}
          {dark ? "Light mode" : "Dark mode"}
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="border-r flex-col hidden lg:flex shrink-0" style={{ width: 240, background: "var(--sidebar)" }}>
        {navContent}
      </aside>

      {mobileNavOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileNavOpen(false)} />
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
            <button className="lg:hidden p-1.5 -ml-1.5 shrink-0" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
              <Menu size={18} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 min-w-0 max-w-[200px] sm:max-w-none">
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--primary)" }} className="shrink-0" />
                  <span className="truncate">{area ? area.name : "All areas"}</span>
                  <ChevronDown size={14} className="shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" style={{ minWidth: 240 }}>
                <DropdownMenuLabel>Switch monitored area</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onArea(null)}>
                  <span className="flex-1">All areas</span>
                  {!area && <Check size={14} />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {areas.map((a) => (
                  <DropdownMenuItem key={a.id} onClick={() => onArea(a)}>
                    <span className="flex-1">
                      {a.name}
                      {a.activeAlerts > 0 && (
                        <span style={{ marginLeft: 6, fontSize: 11, color: "var(--severity-critical)" }}>
                          · {a.activeAlerts}
                        </span>
                      )}
                    </span>
                    {area?.id === a.id && <Check size={14} />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="hidden md:block truncate" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            {area ? `Last pass: ${area.lastPass} · Next: ${area.nextPass}` : `${areas.filter(a => a.active).length} active areas`}
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
