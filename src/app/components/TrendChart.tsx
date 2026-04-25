import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function TrendChart({
  data,
  warning,
  critical,
  showLastYear,
}: {
  data: { month: string; value: number; lastYear?: number }[];
  warning?: number;
  critical?: number;
  showLastYear?: boolean;
}) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="ndciFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
          <YAxis domain={[0, 0.3]} stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          {warning !== undefined && (
            <ReferenceLine y={warning} stroke="var(--severity-warning)" strokeDasharray="4 4" label={{ value: `Warning ${warning}`, fill: "var(--severity-warning)", fontSize: 10, position: "right" }} />
          )}
          {critical !== undefined && (
            <ReferenceLine y={critical} stroke="var(--severity-critical)" strokeDasharray="4 4" label={{ value: `Critical ${critical}`, fill: "var(--severity-critical)", fontSize: 10, position: "right" }} />
          )}
          <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#ndciFill)" name="NDCI" />
          {showLastYear && (
            <Line type="monotone" dataKey="lastYear" stroke="var(--muted-foreground)" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Last year" />
          )}
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NDTIBarChart({ data }: { data: { month: string; value: number }[] }) {
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
          <YAxis domain={[-0.2, 0.2]} stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
          <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
          <ReferenceLine y={0} stroke="var(--foreground)" strokeDasharray="4 4" />
          <Area type="monotone" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
