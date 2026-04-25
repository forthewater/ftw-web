import type { Severity } from "../components/SeverityBadge";

export const INDICES = ["NDCI", "NDTI", "NDWI"] as const;
export type Index = typeof INDICES[number];

export const DEFAULT_THRESHOLDS: Record<Index, { warning: number; critical: number }> = {
  NDCI: { warning: 0.10, critical: 0.20 },
  NDTI: { warning: 0.0,  critical: 0.05 },
  NDWI: { warning: 0.65, critical: 0.60 },
};

export const INDEX_DESCRIPTIONS: Record<Index, string> = {
  NDCI: "Chlorophyll / algae bloom risk",
  NDTI: "Turbidity / sediment",
  NDWI: "Water extent tracking",
};

export type Area = {
  id: string;
  name: string;
  bbox: { west: number; south: number; east: number; north: number };
  active: boolean;
  lastPass: string;
  nextPass: string;
  activeAlerts: number;
  indices: Index[];
};

export type Alert = {
  id: string;
  areaId: string;
  areaName: string;
  severity: Severity;
  title: string;
  index: Index;
  value: number;
  threshold: number;
  durationDays: number;
  timestamp: string;
  status: "active" | "acknowledged" | "resolved";
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  summary: string;
  recommendation: string;
};

export const areas: Area[] = [
  {
    id: "iskar",
    name: "Язовир Искър",
    bbox: { west: 23.52, south: 42.40, east: 23.65, north: 42.52 },
    active: true,
    lastPass: "Apr 22, 2026",
    nextPass: "Apr 27, 2026",
    activeAlerts: 1,
    indices: ["NDCI", "NDTI", "NDWI"],
  },
  {
    id: "varna",
    name: "Black Sea Coast — Varna",
    bbox: { west: 27.85, south: 43.18, east: 28.05, north: 43.28 },
    active: true,
    lastPass: "Apr 21, 2026",
    nextPass: "Apr 26, 2026",
    activeAlerts: 1,
    indices: ["NDCI", "NDTI"],
  },
  {
    id: "batak",
    name: "Язовир Батак",
    bbox: { west: 24.10, south: 41.92, east: 24.28, north: 42.04 },
    active: true,
    lastPass: "Apr 22, 2026",
    nextPass: "Apr 27, 2026",
    activeAlerts: 0,
    indices: ["NDCI", "NDWI"],
  },
  {
    id: "kardzhali",
    name: "Язовир Кърджали",
    bbox: { west: 25.30, south: 41.58, east: 25.48, north: 41.70 },
    active: false,
    lastPass: "Mar 10, 2026",
    nextPass: "Paused",
    activeAlerts: 0,
    indices: ["NDCI"],
  },
];

export const alerts: Alert[] = [
  {
    id: "a1",
    areaId: "iskar",
    areaName: "Язовир Искър",
    severity: "critical",
    title: "Algae bloom risk — elevated chlorophyll",
    index: "NDCI",
    value: 0.21,
    threshold: 0.20,
    durationDays: 12,
    timestamp: "Apr 22, 09:12",
    status: "active",
    summary:
      "Chlorophyll levels have been above the moderate threshold for 12 consecutive satellite passes. This may indicate early-stage algae bloom activity. Water treatment protocols should be reviewed.",
    recommendation:
      "Notify water treatment supervisor and increase chlorophyll sampling frequency.",
  },
  {
    id: "a2",
    areaId: "varna",
    areaName: "Black Sea Coast — Varna",
    severity: "warning",
    title: "Turbidity rising above clear-water range",
    index: "NDTI",
    value: 0.04,
    threshold: 0.0,
    durationDays: 5,
    timestamp: "Apr 21, 17:48",
    status: "active",
    summary:
      "Turbidity has crossed the clear-water threshold for 5 consecutive passes. Likely sediment runoff after recent rainfall.",
    recommendation:
      "Cross-reference with rainfall data and downstream intake stations.",
  },
  {
    id: "a3",
    areaId: "iskar",
    areaName: "Язовир Искър",
    severity: "warning",
    title: "Water extent decreasing month-over-month",
    index: "NDWI",
    value: 0.66,
    threshold: 0.68,
    durationDays: 30,
    timestamp: "Apr 18, 11:02",
    status: "acknowledged",
    acknowledgedBy: "M. Petrova",
    acknowledgedAt: "Apr 19, 08:15",
    summary:
      "Reservoir water extent has declined steadily over the past month, consistent with seasonal drawdown.",
    recommendation: "Continue monitoring; no immediate action required.",
  },
  {
    id: "a4",
    areaId: "batak",
    areaName: "Язовир Батак",
    severity: "ok",
    title: "All indices within normal range",
    index: "NDCI",
    value: 0.04,
    threshold: 0.10,
    durationDays: 0,
    timestamp: "Mar 18, 08:00",
    status: "resolved",
    summary: "Routine pass. All indices nominal.",
    recommendation: "No action required.",
  },
];

export const trendNDCI = [
  { month: "Nov", value: 0.02, lastYear: 0.03 },
  { month: "Dec", value: 0.03, lastYear: 0.04 },
  { month: "Jan", value: 0.04, lastYear: 0.05 },
  { month: "Feb", value: 0.06, lastYear: 0.06 },
  { month: "Mar", value: 0.11, lastYear: 0.08 },
  { month: "Apr", value: 0.21, lastYear: 0.09 },
];

export const trendNDTI = [
  { month: "Nov", value: -0.09 },
  { month: "Dec", value: -0.05 },
  { month: "Jan", value: -0.08 },
  { month: "Feb", value: -0.03 },
  { month: "Mar", value: -0.07 },
  { month: "Apr", value: -0.06 },
];

export const rawData = [
  { date: "Apr 22", ndci: 0.21, ndti: -0.06, ndwi: 0.66, cloud: 4, status: "Critical" },
  { date: "Apr 17", ndci: 0.18, ndti: -0.07, ndwi: 0.66, cloud: 12, status: "Warning" },
  { date: "Apr 12", ndci: 0.15, ndti: -0.08, ndwi: 0.67, cloud: 8, status: "Warning" },
  { date: "Apr 07", ndci: 0.13, ndti: -0.07, ndwi: 0.67, cloud: 18, status: "Warning" },
  { date: "Apr 02", ndci: 0.12, ndti: -0.05, ndwi: 0.67, cloud: 22, status: "Warning" },
  { date: "Mar 28", ndci: 0.11, ndti: -0.07, ndwi: 0.68, cloud: 6, status: "Warning" },
  { date: "Mar 23", ndci: 0.09, ndti: -0.06, ndwi: 0.68, cloud: 14, status: "OK" },
  { date: "Mar 18", ndci: 0.08, ndti: -0.07, ndwi: 0.68, cloud: 9, status: "OK" },
  { date: "Mar 13", ndci: 0.06, ndti: -0.07, ndwi: 0.69, cloud: 3, status: "OK" },
  { date: "Mar 08", ndci: 0.06, ndti: -0.04, ndwi: 0.69, cloud: 28, status: "OK" },
];

export const notes = [
  {
    author: "M. Petrova",
    timestamp: "Apr 22, 10:04",
    body:
      "Cross-checked with on-site sampling team. They confirm visible green tint near the northern shore. Increasing sampling frequency to daily until values normalize.",
  },
  {
    author: "I. Kolev",
    timestamp: "Apr 22, 14:30",
    body: "Notified treatment supervisor. Pre-chlorination dose adjusted by +0.2 mg/L.",
  },
];
