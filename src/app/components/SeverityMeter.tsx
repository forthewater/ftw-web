export function SeverityMeter({
  value,
  max,
  threshold,
  label,
}: {
  value: number;
  max: number;
  threshold: number;
  label?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const tPct = Math.min(100, (threshold / max) * 100);
  const exceeds = value > threshold;
  const fill = exceeds ? "var(--severity-critical)" : "var(--severity-ok)";

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between" style={{ fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
          <span style={{ fontWeight: 500 }}>
            {value.toFixed(2)} / threshold {threshold.toFixed(2)}
          </span>
        </div>
      )}
      <div
        className="relative w-full bg-secondary"
        style={{ height: 8, borderRadius: 4 }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: fill,
            borderRadius: 4,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -2,
            bottom: -2,
            left: `${tPct}%`,
            width: 1,
            background: "var(--foreground)",
            opacity: 0.7,
          }}
        />
      </div>
    </div>
  );
}
