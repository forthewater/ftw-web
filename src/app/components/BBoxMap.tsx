export function BBoxMap({
  bbox,
  height = 180,
  caption,
}: {
  bbox: { west: number; south: number; east: number; north: number };
  height?: number;
  caption?: string;
}) {
  const lonToX = (lon: number) => ((lon + 180) / 360) * 100;
  const latToY = (lat: number) => ((90 - lat) / 180) * 100;

  const x = lonToX(bbox.west);
  const y = latToY(bbox.north);
  const w = lonToX(bbox.east) - x;
  const h = latToY(bbox.south) - y;

  const padX = Math.max(8, w * 6);
  const padY = Math.max(6, h * 6);
  const vbX = Math.max(0, x - padX);
  const vbY = Math.max(0, y - padY);
  const vbW = Math.min(100 - vbX, w + padX * 2);
  const vbH = Math.min(100 - vbY, h + padY * 2);

  return (
    <div className="border" style={{ borderRadius: 8, overflow: "hidden", background: "var(--secondary)" }}>
      <svg viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`} width="100%" height={height} preserveAspectRatio="xMidYMid meet">
        <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="var(--secondary)" />
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1={vbX} x2={vbX + vbW} y1={vbY + (vbH * (i + 1)) / 10} y2={vbY + (vbH * (i + 1)) / 10} stroke="var(--border)" strokeWidth={0.05} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} y1={vbY} y2={vbY + vbH} x1={vbX + (vbW * (i + 1)) / 10} x2={vbX + (vbW * (i + 1)) / 10} stroke="var(--border)" strokeWidth={0.05} />
        ))}
        <rect x={x} y={y} width={w} height={h} fill="var(--primary)" fillOpacity={0.18} stroke="var(--primary)" strokeWidth={0.2} />
        <circle cx={x + w / 2} cy={y + h / 2} r={0.5} fill="var(--primary)" />
      </svg>
      {caption && (
        <div style={{ fontSize: 11, padding: "6px 10px", color: "var(--muted-foreground)", borderTop: "1px solid var(--border)", fontFamily: "ui-monospace, monospace" }}>
          {caption}
        </div>
      )}
    </div>
  );
}
