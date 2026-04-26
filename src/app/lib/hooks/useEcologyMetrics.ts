import { useState } from "react"
import { mockEcologyMetrics, type EcologyMetric } from "../data"

// MOCK-ONLY: returns [] when API is live so EcologySection self-hides.
// To connect a real API: add an else branch fetching /ecology?areaId=…
const hasApi = !!(import.meta as any).env?.VITE_API_BASE_URL

export function useEcologyMetrics(areaId: string): EcologyMetric[] {
  const [metrics] = useState<EcologyMetric[]>(
    hasApi ? [] : (mockEcologyMetrics[areaId] ?? [])
  )
  return metrics
}
