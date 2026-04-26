import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { INDICES, DEFAULT_THRESHOLDS, INDEX_DESCRIPTIONS, type Index, type Area } from "../lib/data";
import { getGeometryBounds } from "../lib/geometry";

type Idx = Index;

const DEFAULT_POINT = { lat: 42.4833, lon: 23.5517 };
const POINT_BBOX_PADDING = 0.001;

function getPointFromArea(area: Area | null) {
  const lat = area?.waterBodyDetails.lat;
  const lon = area?.waterBodyDetails.lon;
  if (typeof lat === "number" && Number.isFinite(lat) && typeof lon === "number" && Number.isFinite(lon)) {
    return { lat, lon };
  }

  const bounds = getGeometryBounds(area?.waterBodyDetails ?? {});
  if (!bounds) return DEFAULT_POINT;
  return {
    lat: (bounds.south + bounds.north) / 2,
    lon: (bounds.west + bounds.east) / 2,
  };
}

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
  onSave: (a: Area) => void | Promise<void>;
  onDelete?: (id: string) => void;
}) {
  const isNew = !area;
  const [name, setName] = useState(area?.waterBodyDetails.name ?? "");
  const [point, setPoint] = useState(getPointFromArea(area));
  const [indices, setIndices] = useState<Idx[]>((area?.indices as Idx[]) ?? ["NDCI", "NDTI", "NDWI"]);
  const [active, setActive] = useState(area?.active ?? true);
  const [notify, setNotify] = useState("email");
  const [recipients, setRecipients] = useState("");
  const [passes, setPasses] = useState(2);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(area?.waterBodyDetails.name ?? "");
      setPoint(getPointFromArea(area));
      setIndices((area?.indices as Idx[]) ?? ["NDCI", "NDTI", "NDWI"]);
      setActive(area?.active ?? true);
      setSaveError(null);
      setSaving(false);
    }
  }, [open, area]);

  const valid =
    name.trim().length > 0 &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lon) &&
    point.lat >= -90 && point.lat <= 90 &&
    point.lon >= -180 && point.lon <= 180 &&
    indices.length > 0;

  const toggleIndex = (i: Idx) =>
    setIndices((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setSaveError(null);

    const bbox = {
      west: point.lon - POINT_BBOX_PADDING,
      south: point.lat - POINT_BBOX_PADDING,
      east: point.lon + POINT_BBOX_PADDING,
      north: point.lat + POINT_BBOX_PADDING,
    };

    const nextArea: Area = {
      id: area?.id ?? `area-${Date.now()}`,
      active,
      activeAlerts: area?.activeAlerts ?? 0,
      indices,
      waterBodyDetails: {
        name: name.trim(),
        lat: point.lat,
        lon: point.lon,
        bbox,
        warning: area?.waterBodyDetails.warning ?? null,
      },
      weeklyWaterMetrics: area?.weeklyWaterMetrics ?? [],
    };

    try {
      await onSave(nextArea);
      onOpenChange(false);
    } catch {
      setSaveError("Could not save this area. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!w-full sm:!w-3/4 !max-w-[520px] sm:!max-w-[520px] overflow-auto p-0">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle style={{ fontWeight: 500, fontSize: 18 }}>
            {isNew ? "Add monitored area" : "Edit area"}
          </SheetTitle>
          <SheetDescription>
            Define a location point and the indices you want monitored. Alerts are evaluated after each Sentinel-2 pass.
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 py-5 space-y-6">
          <Field label="Area name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Язовир Искър, Black Sea Coast — Varna" />
          </Field>

          {saveError && (
            <div className="rounded-md border px-3 py-2" style={{ color: "var(--severity-critical)", fontSize: 13 }}>
              {saveError}
            </div>
          )}

          <div>
            <Label>Location point (decimal degrees)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <CoordInput label="Latitude" value={point.lat} onChange={(v) => setPoint((prev) => ({ ...prev, lat: v }))} />
              <CoordInput label="Longitude" value={point.lon} onChange={(v) => setPoint((prev) => ({ ...prev, lon: v }))} />
            </div>
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 6 }}>
              Enter the exact point you want to track; this point is used for backend outline lookup.
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
                if (confirm(`Delete "${area!.waterBodyDetails.name}"? This removes its history and alerts.`)) {
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
            <Button onClick={submit} disabled={!valid || saving}>
              {saving ? "Saving..." : "Save area"}
            </Button>
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
