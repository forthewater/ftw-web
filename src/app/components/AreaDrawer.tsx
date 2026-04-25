import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { BBoxMap } from "./BBoxMap";
import { INDICES, DEFAULT_THRESHOLDS, INDEX_DESCRIPTIONS, type Index, type Area } from "../lib/data";

type Idx = Index;

export function AreaDrawer({
  open,
  onOpenChange,
  area,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  area: Area | null;
  onSave: (a: Area) => void;
  onDelete?: (id: string) => void;
}) {
  const isNew = !area;
  const [name, setName] = useState(area?.name ?? "");
  const [bbox, setBbox] = useState(area?.bbox ?? { west: 23.52, south: 42.40, east: 23.65, north: 42.52 });
  const [indices, setIndices] = useState<Idx[]>((area?.indices as Idx[]) ?? ["NDCI", "NDTI", "NDWI"]);
  const [active, setActive] = useState(area?.active ?? true);
  const [notify, setNotify] = useState("email");
  const [recipients, setRecipients] = useState("");
  const [passes, setPasses] = useState(2);

  useEffect(() => {
    if (open) {
      setName(area?.name ?? "");
      setBbox(area?.bbox ?? { west: 23.52, south: 42.40, east: 23.65, north: 42.52 });
      setIndices((area?.indices as Idx[]) ?? ["NDCI", "NDTI", "NDWI"]);
      setActive(area?.active ?? true);
    }
  }, [open, area]);

  const valid =
    name.trim().length > 0 &&
    bbox.west < bbox.east &&
    bbox.south < bbox.north &&
    bbox.west >= -180 && bbox.east <= 180 &&
    bbox.south >= -90 && bbox.north <= 90 &&
    indices.length > 0;

  const toggleIndex = (i: Idx) =>
    setIndices((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const submit = () => {
    if (!valid) return;
    onSave({
      id: area?.id ?? `area-${Date.now()}`,
      name: name.trim(),
      bbox,
      active,
      lastPass: area?.lastPass ?? "—",
      nextPass: area?.nextPass ?? "—",
      activeAlerts: area?.activeAlerts ?? 0,
      indices,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-full sm:!w-3/4 !max-w-[520px] sm:!max-w-[520px] overflow-auto p-0">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle style={{ fontWeight: 500, fontSize: 18 }}>
            {isNew ? "Add monitored area" : "Edit area"}
          </SheetTitle>
          <SheetDescription>
            Define a bounding box and the indices you want monitored. Alerts are evaluated after each Sentinel-2 pass.
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-5 space-y-6">
          <Field label="Area name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Язовир Искър, Black Sea Coast — Varna" />
          </Field>

          <div>
            <Label>Bounding box (decimal degrees)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <CoordInput label="West longitude" value={bbox.west} onChange={(v) => setBbox({ ...bbox, west: v })} />
              <CoordInput label="East longitude" value={bbox.east} onChange={(v) => setBbox({ ...bbox, east: v })} />
              <CoordInput label="South latitude" value={bbox.south} onChange={(v) => setBbox({ ...bbox, south: v })} />
              <CoordInput label="North latitude" value={bbox.north} onChange={(v) => setBbox({ ...bbox, north: v })} />
            </div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 6 }}>
              Tip: use Google Maps to find coordinates. Right-click any point on the map to copy its latitude and longitude.
            </div>
            <div className="mt-3">
              <BBoxMap bbox={bbox} caption={`west ${bbox.west} · south ${bbox.south} · east ${bbox.east} · north ${bbox.north}`} />
            </div>
          </div>

          <div>
            <Label>Indices to monitor</Label>
            <div className="space-y-2 mt-2">
              {INDICES.map((i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Checkbox id={i} checked={indices.includes(i)} onCheckedChange={() => toggleIndex(i)} />
                  <div style={{ fontSize: 13 }}>
                    <Label htmlFor={i} style={{ fontWeight: 500 }}>{i}</Label>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      {INDEX_DESCRIPTIONS[i]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {indices.length > 0 && (
            <div>
              <Label>Alert thresholds</Label>
              <div className="space-y-2 mt-2">
                {indices.map((i) => (
                  <div key={i} className="grid grid-cols-3 items-center gap-2">
                    <span style={{ fontSize: 12 }}>{i}</span>
                    <Input defaultValue={DEFAULT_THRESHOLDS[i].warning} type="number" step="0.01" />
                    <Input defaultValue={DEFAULT_THRESHOLDS[i].critical} type="number" step="0.01" />
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                  <span /><span>Warning</span><span>Critical</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Notifications</Label>
            <RadioGroup value={notify} onValueChange={setNotify} className="flex gap-4">
              <RadioOption value="email" label="Email" />
              <RadioOption value="sms" label="SMS" />
              <RadioOption value="both" label="Both" />
            </RadioGroup>
            <Field label="Recipients">
              <Input
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="analyst@water.bg, +359 88 1234567"
              />
            </Field>
            <Field label="Consecutive passes before alert fires">
              <Input type="number" value={passes} onChange={(e) => setPasses(Number(e.target.value))} min={1} max={10} />
            </Field>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Label>Status</Label>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{active ? "Active" : "Paused"}</span>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </div>
        </div>

        <SheetFooter className="border-t px-6 py-4 flex-row !justify-between !gap-3">
          {!isNew && onDelete ? (
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm(`Delete "${area!.name}"? This removes its history and alerts.`)) {
                  onDelete(area!.id);
                  onOpenChange(false);
                }
              }}
              style={{ color: "var(--severity-critical)" }}
            >
              Delete area
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={submit} disabled={!valid}>Save area</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function CoordInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{label}</span>
      <Input type="number" step="0.001" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function RadioOption({ value, label }: { value: string; label: string }) {
  return (
    <label className="flex items-center gap-2" style={{ fontSize: 13 }}>
      <RadioGroupItem value={value} id={value} />
      {label}
    </label>
  );
}
