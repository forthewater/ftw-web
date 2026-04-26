import { memo } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

type Trend = "up" | "down" | "flat";

export const MetricCard = memo(function MetricCard({
  label,
  description,
  value,
  unit,
  trend,
  trendLabel,
  improving,
}: {
  label: string;
  description?: string;
  value: string | number;
  unit?: string;
  trend?: Trend;
  trendLabel?: string;
  improving?: boolean;
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor =
    trend === "flat"
      ? "var(--muted-foreground)"
      : improving
      ? "var(--severity-ok)"
      : "var(--severity-critical)";

  return (
    <div
      className="bg-secondary"
      style={{ borderRadius: 8, padding: "12px 14px" }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "var(--muted-foreground)",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      {description && (
        <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 1, opacity: 0.75 }}>
          {description}
        </div>
      )}
      <div
        style={{ fontSize: 22, fontWeight: 500, color: "var(--foreground)", marginTop: 4 }}
      >
        {value}
        {unit && (
          <span style={{ fontSize: 13, color: "var(--muted-foreground)", marginLeft: 4 }}>
            {unit}
          </span>
        )}
      </div>
      {trendLabel && (
        <div
          className="inline-flex items-center gap-1"
          style={{ fontSize: 11, color: trendColor, marginTop: 4 }}
        >
          <TrendIcon size={12} />
          {trendLabel}
        </div>
      )}
    </div>
  );
});
