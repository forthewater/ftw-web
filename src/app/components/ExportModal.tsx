import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FileText, FileSpreadsheet, Check, Download } from "lucide-react";

type Format = "csv" | "pdf";

export function ExportModal({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const [format, setFormat] = useState<Format>("pdf");
  const [range, setRange] = useState("6m");
  const [index, setIndex] = useState("all");
  const [generated, setGenerated] = useState<{ name: string; size: string } | null>(null);

  const generate = () => {
    const ext = format === "csv" ? "csv" : "pdf";
    setGenerated({
      name: `iskar-${range}-${index}-${new Date().toISOString().slice(0, 10)}.${ext}`,
      size: format === "csv" ? "42 KB" : "1.2 MB",
    });
  };

  const close = () => {
    setGenerated(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[560px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Export report</DialogTitle>
          <DialogDescription>
            Choose the format suited to your audience. Both contain the same time range and indices selected below.
          </DialogDescription>
        </DialogHeader>

        {generated ? (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ padding: "32px 16px", gap: 10 }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 999, background: "var(--severity-ok-bg)", color: "var(--severity-ok)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={22} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>Report generated</div>
            <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
              {generated.name} · {generated.size}
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" onClick={close}>Close</Button>
              <Button>
                <Download size={14} /> Download
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <FormatCard
                selected={format === "csv"}
                onSelect={() => setFormat("csv")}
                icon={<FileSpreadsheet size={18} />}
                label="Raw data export"
                sub="For further analysis in Excel or Python"
                ext="CSV"
              />
              <FormatCard
                selected={format === "pdf"}
                onSelect={() => setFormat("pdf")}
                icon={<FileText size={18} />}
                label="Summary report"
                sub="For sharing with supervisors or external stakeholders"
                ext="PDF"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="space-y-1.5">
                <Label>Date range</Label>
                <Select value={range} onValueChange={setRange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">Last month</SelectItem>
                    <SelectItem value="3m">Last 3 months</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                    <SelectItem value="1y">Last 12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Indices</Label>
                <Select value={index} onValueChange={setIndex}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All indices</SelectItem>
                    <SelectItem value="ndci">NDCI only</SelectItem>
                    <SelectItem value="ndti">NDTI only</SelectItem>
                    <SelectItem value="ndwi">NDWI only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={generate}>Generate</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FormatCard({
  selected,
  onSelect,
  icon,
  label,
  sub,
  ext,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
  ext: string;
}) {
  return (
    <button
      onClick={onSelect}
      className="text-left transition-colors"
      style={{
        border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
        background: selected ? "var(--severity-info-bg)" : "var(--card)",
        borderRadius: 8,
        padding: 14,
      }}
    >
      <div className="flex items-center justify-between mb-2" style={{ color: selected ? "var(--primary)" : "var(--foreground)" }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 4, background: "var(--secondary)", color: "var(--muted-foreground)" }}>
          {ext}
        </span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{sub}</div>
    </button>
  );
}
