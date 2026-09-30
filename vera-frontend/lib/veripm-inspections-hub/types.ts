/**
 * VeriPM Inspections Hub — completion, BBO, focus audits, quality, AI focus.
 */

export type InspectionAccessPlane = "project" | "company" | "subcontractor";

export type TrendPoint = { period: string; value: number };

export type InspectionFocusArea = {
  id: string;
  title: string;
  reason: string;
  source: "incident" | "meeting" | "action" | "ai" | "industry" | "jha";
  priority: number;
  relatedIncidents: number;
  href: string;
};

export type OpenInspectionRow = {
  id: string;
  title: string;
  status: "scheduled" | "in_progress" | "completed" | "overdue";
  focusArea: string;
  dueDate: string;
  assignee: string;
  findingsOpen: number;
  href: string;
};

export type FindingRow = {
  id: string;
  title: string;
  count: number;
  severity: "low" | "moderate" | "elevated" | "critical";
  recurring: boolean;
  linkedActionHref: string;
  linkedMeetingHref: string;
  linkedJhaHref: string;
};

export type InspectionsHubDashboard = {
  generatedAt: string;
  revision: number;
  plane: InspectionAccessPlane;
  scopeLabel: string;
  projectId: number;
  companyId: number;
  periodLabel: string;
  kpis: {
    completionRate: number;
    findingsOpen: number;
    focusAuditsDue: number;
    leadingCoverage: number;
    bboCount: number;
    qualityScore: number;
    deltas: {
      completionRate: number;
      findingsOpen: number;
      leadingCoverage: number;
      bboCount: number;
    };
  };
  completionTrend: TrendPoint[];
  findingsTrend: TrendPoint[];
  bboTrend: TrendPoint[];
  focusAuditTrend: TrendPoint[];
  focusAreas: InspectionFocusArea[];
  openQueue: OpenInspectionRow[];
  topFindingsThisWeek: FindingRow[];
  recurringFindings: FindingRow[];
  quality: {
    overall: number;
    coverage: number;
    evidenceCompleteness: number;
    narrative: string;
  };
  links: {
    incidents: string;
    actions: string;
    meetings: string;
    training: string;
    jhaFlha: string;
    focusAudits: string;
    bbo: string;
    bboNew: string;
    smartSite: string;
    equipment: string;
    equipmentSafety: string;
    ppe: string;
    ppeSpotCheck?: string;
    safetyDevices: string;
    newInspection: string;
  };
  rules: { neverEmpty: true; planeIsolated: true };
};
