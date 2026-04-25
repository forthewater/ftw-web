import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Label } from "./ui/label"
import type { Area } from "../lib/data"

export function AreaSelector({
  areas,
  value,
  onChange,
  allowAll = false,
}: {
  areas: Area[]
  value: string | null
  onChange: (id: string | null) => void
  allowAll?: boolean
}) {
  return (
    <div className="space-y-1.5 w-full sm:w-auto" style={{ minWidth: 0 }}>
      <Label>Area</Label>
      <Select
        value={value ?? "__all__"}
        onValueChange={(v) => onChange(v === "__all__" ? null : v)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allowAll && (
            <SelectItem value="__all__">All areas</SelectItem>
          )}
          {areas.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
