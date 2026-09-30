/**
 * Demo / assembly fixtures for VeriSuite SMS dashboards (Step 1 layouts).
 * Live hubs may replace with AggregateClient payloads of the same shape.
 */

import type { InsightItem } from "@/components/verisuite-intelligence-ui";
import type { InspectionGridRow } from "@/components/verisuite-intelligence-ui";
import type { MeetingTopicCardItem } from "@/components/verisuite-intelligence-ui";
import type { ErpScenarioCardItem } from "@/components/verisuite-intelligence-ui";
import type { JhaHazardBlockItem } from "@/components/verisuite-intelligence-ui";
import type { FlhaEnergyItem } from "@/components/verisuite-intelligence-ui";
import type { BubblePoint } from "@/components/verisuite-intelligence-ui";

export const TREND_RATE = [1.8, 1.7, 1.9, 1.6, 1.5, 1.55, 1.4, 1.35, 1.42, 1.3, 1.28, 1.22];

export const TREND_PTS = TREND_RATE.map((value, i) => ({
  period: `M${i + 1}`,
  value,
}));

export function heatGrid(
  rowLabels: string[],
  colLabels: string[],
  seed = 1,
) {
  const cells = rowLabels.flatMap((row, ri) =>
    colLabels.map((col, ci) => {
      const value = 40 + ((ri * 7 + ci * 11 + seed * 3) % 55);
      return { row, col, value, intensity: value / 100 };
    }),
  );
  return { rows: rowLabels, cols: colLabels, cells };
}

export const LEADING_HEAT = heatGrid(
  ["FLHA", "Meetings", "BBO", "Actions", "Competency", "ERP"],
  ["W1", "W2", "W3", "W4"],
  2,
);

export const COMPETENCY_HEAT = heatGrid(
  ["Ironworkers", "Electricians", "Operators", "Riggers", "Supervisors", "Apprentices"],
  ["Core", "Task", "Auth", "Medical"],
  5,
);

export const AGING_BINS = [
  { bucket: "0–7d", corrective: 4, preventive: 2 },
  { bucket: "8–14d", corrective: 3, preventive: 2 },
  { bucket: "15–30d", corrective: 2, preventive: 2 },
  { bucket: "30d+", corrective: 2, preventive: 1 },
];

export const HOME_INSIGHTS: InsightItem[] = [
  {
    id: "h1",
    tone: "alert",
    headline: "ERP drill overdue · muster accountability gap",
    body: "Link site logs + toolbox sign-ins before next high-risk lift window.",
    confidence: 0.88,
    href: "/pm/emergency-response",
    hrefLabel: "Open Emergency Response →",
  },
  {
    id: "h2",
    tone: "caution",
    headline: "JHA → FLHA energy mismatch on Crew B",
    body: "Mechanical + gravity energies under-controlled on temporary access tasks.",
    confidence: 0.83,
    href: "/pm/jha-flha",
    hrefLabel: "Open JHA / FLHA →",
  },
];

export const FLHA_ENERGIES: FlhaEnergyItem[] = [
  { key: "gravity", label: "Gravity", score: 92 },
  { key: "motion", label: "Motion", score: 78 },
  { key: "mechanical", label: "Mechanical", score: 65 },
  { key: "electrical", label: "Electrical", score: 88 },
  { key: "pressure", label: "Pressure", score: 54, flagged: true },
  { key: "chemical", label: "Chemical", score: 71 },
];

export const JHA_HAZARDS: JhaHazardBlockItem[] = [
  {
    id: "h1",
    label: "Fall from height",
    severity: "critical",
    energyTypes: ["Gravity"],
    controls: ["100% tie-off", "Guardrails at leading edge"],
    ppe: ["Full-body harness", "Hard hat"],
    source: "ai",
    confidence: 0.91,
    selected: true,
  },
  {
    id: "h2",
    label: "Struck-by suspended load",
    severity: "elevated",
    energyTypes: ["Motion", "Mechanical"],
    controls: ["Exclusion zone", "Tag lines"],
    ppe: ["Hi-vis vest"],
    source: "template",
    confidence: 0.88,
  },
];

export const ERP_SCENARIOS: ErpScenarioCardItem[] = [
  {
    id: "fall",
    title: "Fall emergency — structural steel",
    scenario: "fall",
    regionCode: "CA-AB",
    qualityScore: 86,
    drillReadinessPct: 72,
    status: "active",
    selected: true,
  },
  {
    id: "elec",
    title: "Electrical contact",
    scenario: "electrical",
    regionCode: "CA-AB",
    qualityScore: 79,
    drillReadinessPct: 60,
    status: "draft",
  },
  {
    id: "trench",
    title: "Trench collapse",
    scenario: "trench",
    regionCode: "CA-AB",
    qualityScore: 81,
    drillReadinessPct: 55,
    status: "active",
  },
];

export const INSPECTION_ROWS: InspectionGridRow[] = [
  {
    id: "i1",
    date: "2026-07-14",
    type: "bbo",
    location: "Fab bay",
    findingsOpen: 1,
    qualityScore: 88,
    status: "complete",
  },
  {
    id: "i2",
    date: "2026-07-11",
    type: "focus",
    location: "Temporary access",
    findingsOpen: 4,
    qualityScore: 72,
    status: "in_review",
  },
  {
    id: "i3",
    date: "2026-07-09",
    type: "standard",
    location: "Staging",
    findingsOpen: 0,
    qualityScore: 91,
    status: "complete",
  },
];

export const FINDING_BUBBLES: BubblePoint[] = [
  { id: "f1", label: "Access", x: 14, y: 62, r: 30, tone: "caution" },
  { id: "f2", label: "PPE", x: 9, y: 40, r: 18, tone: "info" },
  { id: "f3", label: "LOTO", x: 5, y: 88, r: 26, tone: "critical" },
];

export const MEETING_TOPICS: MeetingTopicCardItem[] = [
  {
    id: "1",
    title: "Machine guarding & LOTO jam clears",
    rationale: "From incident pattern match",
    sourceModule: "incidents",
    confidence: 0.86,
  },
  {
    id: "2",
    title: "Lift exclusion zones — corridor B",
    rationale: "Near-miss cluster",
    sourceModule: "near_miss",
    confidence: 0.81,
  },
  {
    id: "3",
    title: "Temporary access overnight installs",
    rationale: "Inspection focus pack",
    sourceModule: "inspections",
    confidence: 0.78,
  },
];

export const REGION_BREADCRUMBS = [
  { code: "GL", label: "Global" },
  { code: "NA", label: "North America" },
  { code: "CA", label: "Canada" },
  { code: "CA-AB", label: "Alberta" },
];

export const REGION_CHILDREN = [
  { code: "YYC", label: "Calgary", level: "city", hotspotScore: 72 },
  { code: "YEG", label: "Edmonton", level: "city", hotspotScore: 41 },
  { code: "FTM", label: "Fort McMurray", level: "city", hotspotScore: 88 },
  { code: "SITE-12", label: "Site 12", level: "site", available: true, hotspotScore: 65 },
  { code: "SITE-19", label: "Site 19", level: "site", available: false },
];

export const ROOT_CAUSE_FLOWS = [
  {
    rootCauseLabel: "Guarding / LOTO",
    correctiveCount: 5,
    preventiveCount: 3,
    avgEffectiveness: 72,
  },
  {
    rootCauseLabel: "Exclusion zones",
    correctiveCount: 3,
    preventiveCount: 4,
    avgEffectiveness: 68,
  },
  {
    rootCauseLabel: "Housekeeping",
    correctiveCount: 4,
    preventiveCount: 2,
    avgEffectiveness: 81,
  },
];
