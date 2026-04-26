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

export type BBox = { west: number; south: number; east: number; north: number };

export type PolygonPoint = {
  lat: number;
  lon: number;
};

export type WaterBodyDetails = {
  name: string;
  lat?: number;
  lon?: number;
  bbox?: BBox;
  polygon?: PolygonPoint[];
  warning?: string | null;
};

export type WeeklyWaterMetric = {
  from: string;
  to: string;
  ndci: number;
  ndwi: number;
  turbidity: number;
};

export type Area = {
  id: string;
  active: boolean;
  activeAlerts: number;
  indices: Index[];
  waterBodyDetails: WaterBodyDetails;
  weeklyWaterMetrics: WeeklyWaterMetric[];
};

export type Pin = {
  id: string;
  areaId: string;
  name: string;
  lon: number;
  lat: number;
  ndci: number;
  ndti: number;
  ndwi: number;
  severity: Severity;
  lastReading: string;
  // Physical sensor readings
  temperature?: number;
  ph?: number;
  // Motion / behaviour metrics
  activity?: number;
  speedPxS?: number;
  immobility?: number;
  dispersionPx?: number;
  anomalyScore?: number;
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
    active: true,
    activeAlerts: 1,
    indices: ["NDCI", "NDTI", "NDWI"],
    waterBodyDetails: {
      name: "Pancharevo Lake",
      polygon: [
        { lat: 42.5880169, lon: 23.4243249 },
        { lat: 42.588404,  lon: 23.4238873 },
        { lat: 42.5886897, lon: 23.4234302 },
        { lat: 42.5935212, lon: 23.4165597 },
        { lat: 42.5937448, lon: 23.4161776 },
        { lat: 42.594069,  lon: 23.4158756 },
        { lat: 42.6050656, lon: 23.4067836 },
        { lat: 42.6033041, lon: 23.4085558 },
        { lat: 42.5880169, lon: 23.4243249 },
      ],
      warning: null,
    },
    weeklyWaterMetrics: [
      { from: "2026-02-22T18:17:38Z", to: "2026-03-01T18:17:38Z", ndci: 0.013253757404240897, ndwi: 0.07496732024721033, turbidity: 0.10329367460525897 },
      { from: "2026-03-01T18:17:38Z", to: "2026-03-08T18:17:38Z", ndci: -0.07645749126016130, ndwi: 0.5348607571264764, turbidity: 0.020136487354030393 },
      { from: "2026-03-08T18:17:38Z", to: "2026-03-15T18:17:38Z", ndci: 0.002486708379072319, ndwi: 0.01155732132658018, turbidity: 0.9014880056630342 },
      { from: "2026-03-15T18:17:38Z", to: "2026-03-22T18:17:38Z", ndci: 0.015356270038734368, ndwi: -0.016965181624630205, turbidity: 0.6652010290310463 },
      { from: "2026-03-22T18:17:38Z", to: "2026-03-29T18:17:38Z", ndci: 0.033149722212513326, ndwi: -0.04292591968274154, turbidity: 0.4960633673402198 },
      { from: "2026-03-29T18:17:38Z", to: "2026-04-05T18:17:38Z", ndci: -0.06183710115093628, ndwi: 0.46904153856305436, turbidity: 0.025665517306260228 },
      { from: "2026-04-05T18:17:38Z", to: "2026-04-12T18:17:38Z", ndci: -0.014123830425896261, ndwi: 0.42578033965426304, turbidity: 0.022962899947396514 },
      { from: "2026-04-12T18:17:38Z", to: "2026-04-19T18:17:38Z", ndci: 0.021551229524069827, ndwi: 0.02179901035030263, turbidity: 0.7110555880499129 },
      { from: "2026-04-19T18:17:38Z", to: "2026-04-26T18:17:38Z", ndci: 0.02809975753229118, ndwi: -0.02836746719619536, turbidity: 0.7565368296207859 },
    ],
  },
  {
    id: "varna",
    active: true,
    activeAlerts: 1,
    indices: ["NDCI", "NDTI"],
    waterBodyDetails: {
      name: "Black Sea Coast — Varna",
      bbox: { west: 27.85, south: 43.18, east: 28.05, north: 43.28 },
    },
    weeklyWaterMetrics: [
      { from: "2026-03-22T18:17:38Z", to: "2026-03-29T18:17:38Z", ndci: 0.05, ndwi: 0.11, turbidity: 0.09 },
      { from: "2026-03-29T18:17:38Z", to: "2026-04-05T18:17:38Z", ndci: 0.06, ndwi: 0.13, turbidity: 0.05 },
      { from: "2026-04-05T18:17:38Z", to: "2026-04-12T18:17:38Z", ndci: 0.07, ndwi: 0.16, turbidity: 0.04 },
      { from: "2026-04-12T18:17:38Z", to: "2026-04-19T18:17:38Z", ndci: 0.08, ndwi: 0.11, turbidity: 0.06 },
      { from: "2026-04-19T18:17:38Z", to: "2026-04-26T18:17:38Z", ndci: 0.08, ndwi: 0.09, turbidity: 0.04 },
    ],
  },
  {
    id: "batak",
    active: true,
    activeAlerts: 0,
    indices: ["NDCI", "NDWI"],
    waterBodyDetails: {
      name: "Batak Reservoir",
      bbox: { west: 24.10, south: 41.92, east: 24.28, north: 42.04 },
    },
    weeklyWaterMetrics: [
      { from: "2026-03-22T18:17:38Z", to: "2026-03-29T18:17:38Z", ndci: 0.02, ndwi: 0.72, turbidity: 0.03 },
      { from: "2026-03-29T18:17:38Z", to: "2026-04-05T18:17:38Z", ndci: 0.03, ndwi: 0.74, turbidity: 0.05 },
      { from: "2026-04-05T18:17:38Z", to: "2026-04-12T18:17:38Z", ndci: 0.02, ndwi: 0.75, turbidity: 0.03 },
      { from: "2026-04-12T18:17:38Z", to: "2026-04-19T18:17:38Z", ndci: 0.03, ndwi: 0.73, turbidity: 0.04 },
      { from: "2026-04-19T18:17:38Z", to: "2026-04-26T18:17:38Z", ndci: 0.04, ndwi: 0.71, turbidity: 0.02 },
    ],
  },
  {
    id: "kardzhali",
    active: false,
    activeAlerts: 0,
    indices: ["NDCI"],
    waterBodyDetails: {
      name: "Kardzhali Reservoir",
      bbox: { west: 25.30, south: 41.58, east: 25.48, north: 41.70 },
    },
    weeklyWaterMetrics: [
      { from: "2026-02-15T18:17:38Z", to: "2026-02-22T18:17:38Z", ndci: 0.03, ndwi: 0.60, turbidity: 0.05 },
      { from: "2026-02-22T18:17:38Z", to: "2026-03-01T18:17:38Z", ndci: 0.02, ndwi: 0.57, turbidity: 0.03 },
      { from: "2026-03-01T18:17:38Z", to: "2026-03-08T18:17:38Z", ndci: 0.03, ndwi: 0.63, turbidity: 0.06 },
    ],
  },
];

export const alerts: Alert[] = [
  {
    id: "a1",
    areaId: "iskar",
    areaName: "Pancharevo Lake",
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
    areaName: "Pancharevo Lake",
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
    areaName: "Batak Reservoir",
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

export const pins: Pin[] = [
  { id: "iskar-pin-0",     areaId: "iskar",     name: "North inlet",   lon: 23.629844, lat: 42.425181, ndci: 0.18, ndti: -0.04, ndwi: 0.6619, severity: "warning",  lastReading: "Apr 22, 2026" },
  { id: "iskar-pin-1",     areaId: "iskar",     name: "Central basin", lon: 23.595595, lat: 42.454477, ndci: 0.21, ndti: -0.06, ndwi: 0.6520, severity: "critical", lastReading: "Apr 22, 2026" },
  { id: "iskar-pin-2",     areaId: "iskar",     name: "Dam outflow",   lon: 23.551940, lat: 42.463921, ndci: 0.05, ndti: -0.08, ndwi: 0.6423, severity: "ok",       lastReading: "Apr 22, 2026" },
  { id: "iskar-pin-3",     areaId: "iskar",     name: "South cove",    lon: 23.566851, lat: 42.422908, ndci: 0.13, ndti: -0.05, ndwi: 0.6486, severity: "warning",  lastReading: "Apr 22, 2026" },
  { id: "iskar-pin-4",     areaId: "iskar",     name: "East shore",    lon: 23.558982, lat: 42.418978, ndci: 0.07, ndti: -0.07, ndwi: 0.6405, severity: "ok",       lastReading: "Apr 22, 2026" },

  { id: "varna-pin-0",     areaId: "varna",     name: "North inlet",   lon: 27.893580, lat: 43.209252, ndci: 0.18, ndti: -0.04, ndwi: 0.6672, severity: "warning",  lastReading: "Apr 21, 2026" },
  { id: "varna-pin-1",     areaId: "varna",     name: "Central basin", lon: 27.883489, lat: 43.235668, ndci: 0.21, ndti: -0.06, ndwi: 0.6667, severity: "critical", lastReading: "Apr 21, 2026" },
  { id: "varna-pin-2",     areaId: "varna",     name: "Dam outflow",   lon: 28.012961, lat: 43.242551, ndci: 0.05, ndti: -0.08, ndwi: 0.6474, severity: "ok",       lastReading: "Apr 21, 2026" },
  { id: "varna-pin-3",     areaId: "varna",     name: "South cove",    lon: 27.973298, lat: 43.207963, ndci: 0.13, ndti: -0.05, ndwi: 0.6609, severity: "warning",  lastReading: "Apr 21, 2026" },
  { id: "varna-pin-4",     areaId: "varna",     name: "East shore",    lon: 27.953005, lat: 43.232034, ndci: 0.07, ndti: -0.07, ndwi: 0.6612, severity: "ok",       lastReading: "Apr 21, 2026" },

  { id: "batak-pin-0",     areaId: "batak",     name: "North inlet",   lon: 24.228314, lat: 42.008882, ndci: 0.18, ndti: -0.04, ndwi: 0.6705, severity: "warning",  lastReading: "Apr 22, 2026" },
  { id: "batak-pin-1",     areaId: "batak",     name: "Central basin", lon: 24.153687, lat: 42.001892, ndci: 0.21, ndti: -0.06, ndwi: 0.6472, severity: "critical", lastReading: "Apr 22, 2026" },
  { id: "batak-pin-2",     areaId: "batak",     name: "Dam outflow",   lon: 24.163511, lat: 42.002118, ndci: 0.05, ndti: -0.08, ndwi: 0.6797, severity: "ok",       lastReading: "Apr 22, 2026" },
  { id: "batak-pin-3",     areaId: "batak",     name: "South cove",    lon: 24.149622, lat: 42.021394, ndci: 0.13, ndti: -0.05, ndwi: 0.6434, severity: "warning",  lastReading: "Apr 22, 2026" },
  { id: "batak-pin-4",     areaId: "batak",     name: "East shore",    lon: 24.137771, lat: 41.989780, ndci: 0.07, ndti: -0.07, ndwi: 0.6647, severity: "ok",       lastReading: "Apr 22, 2026" },

  { id: "kardzhali-pin-0", areaId: "kardzhali", name: "North inlet",   lon: 25.377027, lat: 41.613784, ndci: 0.18, ndti: -0.04, ndwi: 0.6441, severity: "warning",  lastReading: "Mar 10, 2026" },
  { id: "kardzhali-pin-1", areaId: "kardzhali", name: "Central basin", lon: 25.337446, lat: 41.642364, ndci: 0.21, ndti: -0.06, ndwi: 0.6616, severity: "critical", lastReading: "Mar 10, 2026" },
  { id: "kardzhali-pin-2", areaId: "kardzhali", name: "Dam outflow",   lon: 25.349033, lat: 41.606543, ndci: 0.05, ndti: -0.08, ndwi: 0.6673, severity: "ok",       lastReading: "Mar 10, 2026" },
  { id: "kardzhali-pin-3", areaId: "kardzhali", name: "South cove",    lon: 25.395073, lat: 41.655269, ndci: 0.13, ndti: -0.05, ndwi: 0.6660, severity: "warning",  lastReading: "Mar 10, 2026" },
  { id: "kardzhali-pin-4", areaId: "kardzhali", name: "East shore",    lon: 25.408886, lat: 41.642621, ndci: 0.07, ndti: -0.07, ndwi: 0.6612, severity: "ok",       lastReading: "Mar 10, 2026" },
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

// ── In-situ ecology metrics (mock-only until API supports /ecology) ────────────

export type DaphniaState = "good" | "stressed" | "critical"

export type EcologyMetric = {
  week: string
  temperatureC: number
  dissolvedOxygenMgL: number
  daphniaHealth: DaphniaState
}

export const mockEcologyMetrics: Record<string, EcologyMetric[]> = {
  iskar: [
    { week: "2026-02-23", temperatureC: 4.8,  dissolvedOxygenMgL: 11.2, daphniaHealth: "good" },
    { week: "2026-03-02", temperatureC: 5.4,  dissolvedOxygenMgL: 10.9, daphniaHealth: "good" },
    { week: "2026-03-09", temperatureC: 6.1,  dissolvedOxygenMgL: 10.5, daphniaHealth: "good" },
    { week: "2026-03-16", temperatureC: 7.3,  dissolvedOxygenMgL: 10.1, daphniaHealth: "good" },
    { week: "2026-03-23", temperatureC: 8.9,  dissolvedOxygenMgL:  9.4, daphniaHealth: "good" },
    { week: "2026-03-30", temperatureC: 10.2, dissolvedOxygenMgL:  8.8, daphniaHealth: "stressed" },
    { week: "2026-04-06", temperatureC: 11.8, dissolvedOxygenMgL:  8.1, daphniaHealth: "stressed" },
    { week: "2026-04-13", temperatureC: 13.1, dissolvedOxygenMgL:  7.3, daphniaHealth: "critical" },
    { week: "2026-04-20", temperatureC: 14.2, dissolvedOxygenMgL:  6.8, daphniaHealth: "critical" },
  ],
  varna: [
    { week: "2026-03-23", temperatureC: 8.2,  dissolvedOxygenMgL:  9.8, daphniaHealth: "good" },
    { week: "2026-03-30", temperatureC: 9.5,  dissolvedOxygenMgL:  9.1, daphniaHealth: "stressed" },
    { week: "2026-04-06", temperatureC: 11.1, dissolvedOxygenMgL:  8.5, daphniaHealth: "stressed" },
    { week: "2026-04-13", temperatureC: 13.4, dissolvedOxygenMgL:  7.8, daphniaHealth: "good" },
    { week: "2026-04-20", temperatureC: 15.6, dissolvedOxygenMgL:  7.0, daphniaHealth: "good" },
  ],
  batak: [
    { week: "2026-03-23", temperatureC: 5.2,  dissolvedOxygenMgL: 11.0, daphniaHealth: "good" },
    { week: "2026-03-30", temperatureC: 6.0,  dissolvedOxygenMgL: 10.6, daphniaHealth: "good" },
    { week: "2026-04-06", temperatureC: 7.1,  dissolvedOxygenMgL: 10.1, daphniaHealth: "good" },
    { week: "2026-04-13", temperatureC: 8.5,  dissolvedOxygenMgL:  9.7, daphniaHealth: "good" },
    { week: "2026-04-20", temperatureC: 9.8,  dissolvedOxygenMgL:  9.2, daphniaHealth: "good" },
  ],
  kardzhali: [
    { week: "2026-02-16", temperatureC: 5.9,  dissolvedOxygenMgL: 10.8, daphniaHealth: "good" },
    { week: "2026-02-23", temperatureC: 6.5,  dissolvedOxygenMgL: 10.3, daphniaHealth: "good" },
    { week: "2026-03-02", temperatureC: 7.8,  dissolvedOxygenMgL:  9.7, daphniaHealth: "stressed" },
  ],
}
