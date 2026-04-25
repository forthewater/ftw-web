import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { SeverityBadge } from "../components/SeverityBadge";
import { SeverityMeter } from "../components/SeverityMeter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { TrendChart } from "../components/TrendChart";
import { SatelliteImage } from "../components/SatelliteImage";
import { Textarea } from "../components/ui/textarea";
import type { Alert } from "../lib/data";
import { rawData, trendNDCI } from "../lib/data";
import { useNotes } from "../lib/hooks/useNotes";
import { Skeleton } from "../components/ui/skeleton";

export function AlertDetail({
  alert,
  onBack,
  onExport,
  onAcknowledge,
}: {
  alert: Alert;
  onBack: () => void;
  onExport: () => void;
  onAcknowledge: (id: string) => void;
}) {
  const [noteDraft, setNoteDraft] = useState("");
  const { notes, addNote, loading: notesLoading } = useNotes(alert.id);

  const submitNote = () => {
    if (!noteDraft.trim()) return;
    addNote(noteDraft.trim());
    setNoteDraft("");
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1100px] mx-auto space-y-6 sm:space-y-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5"
        style={{ fontSize: 12, color: "var(--muted-foreground)" }}
      >
        <ArrowLeft size={14} /> Back to alerts
      </button>

      <AlertHeader alert={alert} onExport={onExport} onAcknowledge={onAcknowledge} />

      <section>
        <Tabs defaultValue="trend">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <TabsList>
              <TabsTrigger value="trend">Trend chart</TabsTrigger>
              <TabsTrigger value="image">Satellite image</TabsTrigger>
              <TabsTrigger value="data">Raw data</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trend"><AlertTrendTab index={alert.index} /></TabsContent>
          <TabsContent value="image"><AlertImageTab /></TabsContent>
          <TabsContent value="data"><AlertRawDataTab /></TabsContent>
          <TabsContent value="notes">
            <AlertNotesTab
              notes={notes}
              loading={notesLoading}
              draft={noteDraft}
              onDraftChange={setNoteDraft}
              onSubmit={submitNote}
            />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AlertHeader({ alert, onExport, onAcknowledge }: {
  alert: Alert;
  onExport: () => void;
  onAcknowledge: (id: string) => void;
}) {
  return (
    <section className="bg-card border" style={{ borderRadius: 12 }}>
      <div className="p-5 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6 mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <SeverityBadge severity={alert.severity} />
              <span className="bg-secondary" style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999 }}>
                {alert.areaName}
              </span>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                · Triggered {alert.timestamp}
              </span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 500 }}>{alert.title}</h1>
            <p style={{ fontSize: 14, color: "var(--foreground)", marginTop: 10, lineHeight: 1.55, maxWidth: 720 }}>
              {alert.summary}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {alert.status === "active" && (
              <Button variant="outline" className="flex-1 lg:flex-none" onClick={() => onAcknowledge(alert.id)}>
                Acknowledge
              </Button>
            )}
            <Button className="flex-1 lg:flex-none" onClick={onExport}>Export report</Button>
          </div>
        </div>

        <div style={{ maxWidth: 560, marginTop: 18 }}>
          <SeverityMeter
            label={`${alert.index} current value vs threshold`}
            value={alert.value}
            max={alert.index === "NDCI" ? 0.30 : 0.20}
            threshold={alert.threshold}
          />
        </div>

        <div
          className="mt-6"
          style={{
            background: "var(--severity-info-bg)",
            color: "var(--severity-info)",
            padding: "12px 14px",
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <span style={{ fontWeight: 500 }}>Recommended: </span>
          {alert.recommendation}
        </div>

        {alert.acknowledgedBy && (
          <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 14 }}>
            Acknowledged by {alert.acknowledgedBy} · {alert.acknowledgedAt}
          </div>
        )}
      </div>
    </section>
  );
}

function AlertTrendTab({ index }: { index: string }) {
  return (
    <div className="border bg-card" style={{ borderRadius: 12, padding: 20 }}>
      <h3>{index} — last 6 months</h3>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12 }}>
        Dashed line = threshold. Lighter dashed line = same period last year.
      </div>
      <TrendChart data={trendNDCI} warning={0.10} critical={0.20} showLastYear />
    </div>
  );
}

function AlertImageTab() {
  return (
    <div className="border bg-card" style={{ borderRadius: 12, padding: 20 }}>
      <h3>Satellite image</h3>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 16 }}>
        NDCI overlay applied. Red areas indicate elevated chlorophyll concentration.
      </div>
      <SatelliteImage date="Apr 22, 2026" cloud={4} />
    </div>
  );
}

function AlertRawDataTab() {
  return (
    <div className="border bg-card overflow-x-auto" style={{ borderRadius: 12 }}>
      <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "var(--secondary)", textAlign: "left" }}>
            {["Date", "NDCI", "NDTI", "NDWI", "Cloud cover", "Status"].map((h) => (
              <th key={h} style={{ padding: "10px 14px", fontWeight: 500, fontSize: 12, color: "var(--muted-foreground)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rawData.map((r) => {
            const exceed = r.ndci > 0.20;
            return (
              <tr
                key={r.date}
                style={{
                  borderTop: "1px solid var(--border)",
                  background: exceed ? "var(--severity-critical-bg)" : undefined,
                }}
              >
                <td style={{ padding: "10px 14px" }}>{r.date}</td>
                <td style={{ padding: "10px 14px", fontFamily: "ui-monospace, monospace" }}>{r.ndci.toFixed(2)}</td>
                <td style={{ padding: "10px 14px", fontFamily: "ui-monospace, monospace" }}>{r.ndti.toFixed(2)}</td>
                <td style={{ padding: "10px 14px", fontFamily: "ui-monospace, monospace" }}>{r.ndwi.toFixed(2)}</td>
                <td style={{ padding: "10px 14px" }}>{r.cloud}%</td>
                <td style={{ padding: "10px 14px" }}>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background:
                        r.status === "Critical" ? "var(--severity-critical-bg)" :
                        r.status === "Warning"  ? "var(--severity-warning-bg)"  :
                        "var(--severity-ok-bg)",
                      color:
                        r.status === "Critical" ? "var(--severity-critical)" :
                        r.status === "Warning"  ? "var(--severity-warning)"  :
                        "var(--severity-ok)",
                    }}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type Note = { author: string; timestamp: string; body: string };

function AlertNotesTab({ notes, loading, draft, onDraftChange, onSubmit }: {
  notes: Note[];
  loading?: boolean;
  draft: string;
  onDraftChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="border bg-card" style={{ borderRadius: 12, padding: 20 }}>
      <h3>Investigation notes</h3>
      <div className="space-y-3 mt-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-l-2 pl-4 space-y-2" style={{ borderColor: "var(--border)" }}>
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))
          : notes.map((n, i) => (
              <div key={i} className="border-l-2 pl-4" style={{ borderColor: "var(--border)" }}>
                <div style={{ fontSize: 12 }}>
                  <span style={{ fontWeight: 500 }}>{n.author}</span>
                  <span style={{ color: "var(--muted-foreground)", marginLeft: 8 }}>{n.timestamp}</span>
                </div>
                <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{n.body}</div>
              </div>
            ))
        }
      </div>
      <div className="mt-5 space-y-2">
        <Textarea
          placeholder="Add investigation notes..."
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={onSubmit} disabled={!draft.trim()}>Add note</Button>
        </div>
      </div>
    </div>
  );
}
