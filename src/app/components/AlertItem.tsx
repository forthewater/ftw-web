import { memo } from "react";
import { SeverityBadge, type Severity } from "./SeverityBadge";
import { Button } from "./ui/button";

export const AlertItem = memo(function AlertItem({
  severity,
  area,
  title,
  detail,
  timestamp,
  acknowledged,
  onAcknowledge,
  acknowledgedBy,
  acknowledgedAt,
}: {
  severity: Severity;
  area: string;
  title: string;
  detail: string;
  timestamp: string;
  acknowledged?: boolean;
  onAcknowledge?: () => void;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}) {
  const barColor =
    severity === "critical"
      ? "var(--severity-critical)"
      : severity === "warning"
      ? "var(--severity-warning)"
      : severity === "ok"
      ? "var(--severity-ok)"
      : "var(--severity-info)";

  return (
    <div
      className="bg-card relative flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 border hover:border-[var(--primary)] transition-colors"
      style={{
        borderRadius: 12,
        padding: "14px 16px 14px 20px",
        opacity: acknowledged ? 0.55 : 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: barColor,
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <SeverityBadge severity={severity} />
          <span
            className="bg-secondary truncate"
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
              color: "var(--foreground)",
              maxWidth: "100%",
            }}
          >
            {area}
          </span>
          <span className="sm:hidden" style={{ fontSize: 11, color: "var(--muted-foreground)", marginLeft: "auto" }}>
            {timestamp}
          </span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
          {detail}
        </div>
        {acknowledgedBy && (
          <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 6 }}>
            Acknowledged by {acknowledgedBy} · {acknowledgedAt}
          </div>
        )}
      </div>
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
        <span className="hidden sm:block" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          {timestamp}
        </span>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">View details</Button>
          {onAcknowledge && (
            <Button size="sm" className="flex-1 sm:flex-none" onClick={(e) => { e.stopPropagation(); onAcknowledge(); }}>
              Acknowledge
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});
