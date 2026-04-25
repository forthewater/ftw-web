export function SatelliteImage({ date, cloud }: { date: string; cloud: number }) {
  return (
    <div className="space-y-3">
      <div
        className="relative overflow-hidden border"
        style={{
          width: "100%",
          maxWidth: 512,
          aspectRatio: "1 / 1",
          borderRadius: 8,
          background:
            "radial-gradient(circle at 35% 40%, #f0c14a 0%, #f0c14a 8%, #c8b942 16%, #5d8f5a 28%, #2c6e7d 50%, #1f4a72 75%, #14304a 100%)",
        }}
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.6 }}>
          <path d="M40,80 C60,40 110,30 150,55 C175,72 180,120 155,150 C125,180 70,175 50,140 C30,110 30,100 40,80 Z" fill="none" stroke="#000" strokeWidth="0.5" />
          <path d="M80,90 C95,75 115,80 125,100 C130,115 120,135 100,135 C82,135 70,115 80,90 Z" fill="#A32D2D" fillOpacity="0.5" />
          <path d="M70,60 C85,50 115,55 130,75" fill="none" stroke="#fff" strokeWidth="0.4" strokeDasharray="2,2" />
        </svg>
        <div
          className="absolute"
          style={{
            top: 8,
            left: 8,
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 11,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          Sentinel-2 · NDCI overlay
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
        Pass: {date} · Cloud cover: {cloud}% · Source: Copernicus Sentinel-2 L2A
      </div>
      <div className="flex gap-3 flex-wrap" style={{ fontSize: 11 }}>
        {[
          { c: "#1f4a72", l: "Clean (< 0.0)" },
          { c: "#2c6e7d", l: "Low (0.0–0.05)" },
          { c: "#c8b942", l: "Moderate (0.05–0.10)" },
          { c: "#f0c14a", l: "Elevated (0.10–0.20)" },
          { c: "#A32D2D", l: "High (> 0.20)" },
        ].map((x) => (
          <div key={x.l} className="flex items-center gap-1.5">
            <span style={{ width: 10, height: 10, background: x.c, borderRadius: 2, display: "inline-block" }} />
            <span style={{ color: "var(--muted-foreground)" }}>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
