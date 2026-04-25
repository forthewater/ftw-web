import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

export type Severity = "critical" | "warning" | "ok" | "info";

const config: Record<Severity, { label: string; icon: any; cls: string }> = {
  critical: {
    label: "Critical",
    icon: AlertCircle,
    cls: "bg-[var(--severity-critical-bg)] text-[var(--severity-critical)]",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    cls: "bg-[var(--severity-warning-bg)] text-[var(--severity-warning)]",
  },
  ok: {
    label: "OK",
    icon: CheckCircle2,
    cls: "bg-[var(--severity-ok-bg)] text-[var(--severity-ok)]",
  },
  info: {
    label: "Info",
    icon: Info,
    cls: "bg-[var(--severity-info-bg)] text-[var(--severity-info)]",
  },
};

export function SeverityBadge({ severity, label }: { severity: Severity; label?: string }) {
  const c = config[severity];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${c.cls}`}>
      <Icon size={12} />
      {label ?? c.label}
    </span>
  );
}
