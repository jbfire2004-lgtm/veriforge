import { z } from "zod";

export const AlertSeveritySchema = z.enum(["critical", "high", "medium", "low"]);
export type AlertSeverity = z.infer<typeof AlertSeveritySchema>;

export const AlertTypeSchema = z.enum([
  "safety",
  "compliance",
  "operations",
  "scheduling",
  "dispatch",
  "equipment",
  "training",
  "document",
  "automation",
]);
export type AlertType = z.infer<typeof AlertTypeSchema>;

export const TwinEntityTypeSchema = z.enum([
  "worker",
  "equipment",
  "project",
  "company",
  "provider",
  "unionHall",
]);
export type TwinEntityType = z.infer<typeof TwinEntityTypeSchema>;

export type ScoreSnapshot = {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  trend: "up" | "down" | "stable";
  updatedAt: string;
};

export type CommandEntityInput = {
  id: string;
  name: string;
  type: TwinEntityType;
  lat?: number;
  lng?: number;
  projectId?: string;
  riskScore?: number;
  readinessScore?: number;
  complianceOk?: boolean;
  metadata?: Record<string, unknown>;
};

export type CommandContextInput = {
  companyId?: string;
  unionHallId?: string;
  projectId?: string;
  offline?: boolean;
  eventName?: string;
  entities?: CommandEntityInput[];
  sifPrecursors?: number;
  hecaDeviations?: number;
  energyConflicts?: number;
  inspectionFailures?: number;
  trainingExpiries?: number;
  competencyGaps?: number;
  dispatchConflicts?: number;
  visionAnomalies?: number;
  documentFraud?: number;
  fatigueIndicators?: number;
  safetyForms?: { id: string; kind: string; title: string; hazardSummary?: string }[];
};

export type RiskAssessment = {
  entityType: TwinEntityType;
  entityId: string;
  score: ScoreSnapshot;
  factors: string[];
  prediction?: { label: string; probability: number };
  recommendedActions: string[];
};

export type ReadinessAssessment = {
  entityType: TwinEntityType | "crew" | "shift";
  entityId: string;
  score: ScoreSnapshot;
  failures: string[];
  autoCorrections: string[];
};

export type CommandAlert = {
  id: string;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  at: string;
};

export type AutomationSnapshot = {
  executed: number;
  queued: number;
  overridden: number;
  failed: number;
  synced: number;
  recent: { id: string; title: string; status: string }[];
};

export type AgentInsight = {
  agent: string;
  summary: string;
  actions: string[];
  confidence: number;
};

export type MapMarker = {
  id: string;
  type: "worker" | "equipment" | "project" | "risk_zone" | "safety_event";
  label: string;
  lat: number;
  lng: number;
  riskLevel: string;
};

export type TimelineEntry = {
  id: string;
  at: string;
  category: "event" | "risk" | "readiness" | "automation";
  summary: string;
};

export type TwinRealtimeState = {
  entityType: TwinEntityType;
  entityId: string;
  risk: number;
  readiness: number;
  predictions: { label: string; probability: number }[];
  updatedAt: string;
};

export type CommandDashboardBundle = {
  generatedAt: string;
  risk: { avg: number; critical: number };
  readiness: { avg: number; failures: number };
  compliance: { rate: number; gaps: number };
  staffing: { shortages: number };
  equipment: { lockouts: number; downtime: number };
  safety: { sifAlerts: number; hecaAlerts: number; energyAlerts: number };
  automation: AutomationSnapshot;
  documents: { pending: number; fraud: number };
  twins: { updated: number };
};

export type CommandCenterReport = {
  generatedAt: string;
  context: CommandContextInput;
  intelligence: {
    anomalies: string[];
    hazards: string[];
    conflicts: string[];
    complianceFailures: string[];
    operationalFailures: string[];
  };
  risk: RiskAssessment[];
  readiness: ReadinessAssessment[];
  automation: AutomationSnapshot;
  twins: TwinRealtimeState[];
  agents: AgentInsight[];
  alerts: CommandAlert[];
  map: MapMarker[];
  timeline: TimelineEntry[];
  dashboard: CommandDashboardBundle;
};
