/**
 * Action Management (CAM)
 * Terminology (mandatory in UI): Corrective Actions, Preventive Actions, Action Management.
 * Do not surface “CAPA” in VeriSuite / VeriPM copy.
 */

export type ActionPlane = "project" | "company";

export type ActionKind = "corrective" | "preventive";

export type ActionStatus =
  | "open"
  | "in_progress"
  | "pending_verification"
  | "closed"
  | "overdue";

export type CloseOutStage =
  | "assigned"
  | "implemented"
  | "verified"
  | "effectiveness_reviewed"
  | "closed";

export type AgingBucket = "0-7d" | "8-30d" | "31-60d" | "61-90d" | "90d+";

export type CamSelectors = {
  plane: ActionPlane;
  industry: "mining" | "construction" | "manufacturing" | "utilities";
  period: string;
  regionCode: string;
  projectToken?: string;
  companyToken?: string;
};

export type RootCauseLink = {
  rootCauseToken: string;
  rootCauseLabel: string;
  pathway: string;
  weight: number;
};

export type ManagedAction = {
  actionToken: string;
  title: string;
  description: string;
  kind: ActionKind;
  status: ActionStatus;
  closeOutStage: CloseOutStage;
  owner: string | null;
  progressPct: number;
  ageDays: number;
  dueAt: string | null;
  effectivenessScore: number | null;
  severityBand: "low" | "moderate" | "elevated" | "critical";
  source: "incident" | "near_miss" | "audit" | "inspection" | "risk_assessment" | "heca";
  sourceLabel: string;
  rootCauses: RootCauseLink[];
  plane: ActionPlane;
  entityToken: string;
  regionCode: string;
  industry: CamSelectors["industry"];
  period: string;
  openedAt: string;
  closedAt: string | null;
};

export type AgingHistogramBin = {
  bucket: AgingBucket;
  corrective: number;
  preventive: number;
  sharePct: number;
  ratePer200k: number;
};

export type ActionAgingSummary = {
  openCorrective: number;
  openPreventive: number;
  openTotal: number;
  overdue: number;
  avgAgeDays: number;
  medianAgeDays: number;
  onTimeClosurePct: number;
  histogram: AgingHistogramBin[];
};

export type EffectivenessSummary = {
  reviewedCount: number;
  avgScore: number | null;
  effectivePct: number | null;
  recurringPct: number | null;
  suppressed: boolean;
};

export type CloseOutFunnel = {
  stage: CloseOutStage;
  count: number;
  sharePct: number;
};

export type RootCauseActionFlow = {
  rootCauseLabel: string;
  correctiveCount: number;
  preventiveCount: number;
  avgEffectiveness: number | null;
};

export type SmartActionSuggestion = {
  id: string;
  kind: ActionKind;
  title: string;
  detail: string;
  confidence: number;
  basedOn: "incident_root_cause" | "inspection_finding" | "near_miss" | "recurring_cause";
  sourceLabel: string;
  rootCauseLabel: string;
  suggestedOwnerRole: string;
  hrefCreate: string;
};

export type ActionInsight = {
  id: string;
  category: "overdue" | "recurring_root_cause" | "high_risk_area";
  tone: "neutral" | "positive" | "caution" | "alert";
  headline: string;
  body: string;
  metric?: string;
  href?: string;
};

export type PlaneActionDashboard = {
  plane: ActionPlane;
  entityToken: string | null;
  rates: {
    openRatePer200k: number | null;
    overdueRatePer200k: number | null;
    closureVelocityDays: number | null;
    suppressed: boolean;
    entityCount: number | null;
  };
  aging: ActionAgingSummary;
  effectiveness: EffectivenessSummary;
  closeOut: CloseOutFunnel[];
  rootCauseFlows: RootCauseActionFlow[];
  actions: ManagedAction[];
};

export type CamDashboard = {
  generatedAt: string;
  revision: number;
  selectors: CamSelectors;
  project: PlaneActionDashboard;
  company: PlaneActionDashboard;
  industryBenchmark: {
    avgAgeDays: number | null;
    medianAgeDays: number | null;
    onTimeClosurePct: number | null;
    effectivenessAvg: number | null;
    suppressed: boolean;
    entityCount: number | null;
  };
  smartSuggestions: SmartActionSuggestion[];
  insights: ActionInsight[];
  narratives: Array<{
    id: string;
    tone: "neutral" | "positive" | "caution" | "alert";
    headline: string;
    body: string;
  }>;
  workflow: {
    stages: CloseOutStage[];
    openQueue: ManagedAction[];
  };
  links: {
    incidents: string;
    inspections: string;
    meetings: string;
    training: string;
  };
  rules: {
    hoursDenominator: 200000;
    minSample: 5;
    planesIsolated: true;
    idsTokenized: true;
    terminology: {
      corrective: "Corrective Actions";
      preventive: "Preventive Actions";
      program: "Action Management";
    };
  };
};

export type CreateActionInput = {
  title: string;
  description?: string;
  kind: ActionKind;
  owner?: string;
  source?: ManagedAction["source"];
  sourceLabel?: string;
  rootCauseLabel?: string;
  severityBand?: ManagedAction["severityBand"];
  industry?: CamSelectors["industry"];
  regionCode?: string;
  period?: string;
  plane?: ActionPlane;
};

export type MutateActionInput = {
  actionToken: string;
  owner?: string | null;
  progressPct?: number;
  closeOutStage?: CloseOutStage;
  status?: ActionStatus;
  effectivenessScore?: number | null;
  close?: boolean;
};
