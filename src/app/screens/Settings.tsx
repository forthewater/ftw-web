import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { INDICES, DEFAULT_THRESHOLDS } from "../lib/data";

const DEFAULT_PASSES: Record<string, number> = { NDCI: 2, NDTI: 2, NDWI: 3 };
const DEFAULT_METHOD: Record<string, string> = { NDCI: "email", NDTI: "email", NDWI: "both" };

export function Settings() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1000px] mx-auto space-y-6">
      <div>
        <h1>Settings</h1>
        <div style={{ color: "var(--muted-foreground)", fontSize: 13, marginTop: 2 }}>
          Global defaults · pre-fill threshold values when a new area is created. Existing per-area thresholds are not overwritten.
        </div>
      </div>

      <div className="border bg-card overflow-x-auto" style={{ borderRadius: 12 }}>
        <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--secondary)", textAlign: "left" }}>
              {["Index", "Default warning", "Default critical", "Consecutive passes", "Notification"].map((h) => (
                <th key={h} style={{ padding: "12px 14px", fontWeight: 500, fontSize: 12, color: "var(--muted-foreground)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INDICES.map((idx) => (
              <tr key={idx} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 14px", fontWeight: 500 }}>{idx}</td>
                <td style={{ padding: "10px 14px" }}><Input defaultValue={DEFAULT_THRESHOLDS[idx].warning} type="number" step="0.01" style={{ maxWidth: 120 }} /></td>
                <td style={{ padding: "10px 14px" }}><Input defaultValue={DEFAULT_THRESHOLDS[idx].critical} type="number" step="0.01" style={{ maxWidth: 120 }} /></td>
                <td style={{ padding: "10px 14px" }}><Input defaultValue={DEFAULT_PASSES[idx]} type="number" min={1} max={10} style={{ maxWidth: 100 }} /></td>
                <td style={{ padding: "10px 14px" }}>
                  <Select defaultValue={DEFAULT_METHOD[idx]}>
                    <SelectTrigger style={{ maxWidth: 160 }}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button>Save defaults</Button>
      </div>
    </div>
  );
}
