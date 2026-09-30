/**
 * VeriPM Training Hub — competency gaps linked from incidents / inspections.
 */

export type TrainingAccessPlane = "project" | "company" | "subcontractor";

export type TrendPoint = { period: string; value: number };

export type TrainingGap = {
  id: string;
  title: string;
  reason: string;
  linkedRootCause: string;
  peopleAffected: number;
  urgency: "low" | "medium" | "high";
  href: string;
};

export type TrainingHubDashboard = {
  generatedAt: string;
  revision: number;
  plane: TrainingAccessPlane;
  scopeLabel: string;
  projectId: number;
  companyId: number;
  periodLabel: string;
  kpis: {
    complianceRate: number;
    openGaps: number;
    expiringSoon: number;
    refreshersAssigned: number;
    deltas: {
      complianceRate: number;
      openGaps: number;
    };
  };
  complianceTrend: TrendPoint[];
  gaps: TrainingGap[];
  links: {
    incidents: string;
    actions: string;
    meetings: string;
    inspections: string;
    coreTraining: string;
  };
  rules: { neverEmpty: true; planeIsolated: true };
};
