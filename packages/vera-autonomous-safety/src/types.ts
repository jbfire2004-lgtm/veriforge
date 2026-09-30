import { z } from "zod";

export const EnergyTypeSchema = z.enum([
  "gravity",
  "motion",
  "mechanical",
  "electrical",
  "chemical",
  "pressure",
  "thermal",
  "radiation",
  "biological",
]);
export type EnergyType = z.infer<typeof EnergyTypeSchema>;

export const SafetyFormKindSchema = z.enum([
  "JHA",
  "FLHA",
  "SIF",
  "HECA",
  "ENERGY_WHEEL",
  "INSPECTION",
  "PERMIT_TO_WORK",
]);
export type SafetyFormKind = z.infer<typeof SafetyFormKindSchema>;

export const InterventionTypeSchema = z.enum([
  "notify_supervisor",
  "lockout_equipment",
  "restrict_worker",
  "require_training",
  "require_inspection",
  "require_jha_update",
  "escalate_management",
]);
export type InterventionType = z.infer<typeof InterventionTypeSchema>;

export type SafetyScore = {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  updatedAt: string;
};

export type SafetyFormInput = {
  id: string;
  kind: SafetyFormKind;
  title: string;
  hazardSummary?: string;
  controlMeasures?: string;
  taskSteps?: string[];
  status?: string;
  projectId?: string;
  workerId?: string;
  equipmentId?: string;
};

export type SafetyContextInput = {
  companyId?: string;
  projectId?: string;
  workerId?: string;
  equipmentId?: string;
  offline?: boolean;
  forms?: SafetyFormInput[];
  inspectionFailures?: number;
  trainingGaps?: number;
  competencyGaps?: number;
  lockedOutEquipment?: boolean;
  visionHazards?: string[];
  twinRiskScores?: {
    worker?: number;
    equipment?: number;
    project?: number;
  };
};

export type SifAnalysis = {
  riskScore: SafetyScore;
  precursors: { code: string; message: string; confidence: number }[];
  patterns: string[];
  trends: { direction: "up" | "down" | "stable"; label: string }[];
  clusters: string[];
  recommendations: string[];
  interventions: InterventionType[];
};

export type HecaAnalysis = {
  riskScore: SafetyScore;
  tasks: { id: string; label: string; risk: number }[];
  deviations: { code: string; message: string }[];
  violations: { code: string; message: string }[];
  controls: string[];
  summary: string;
};

export type EnergyWheelAnalysis = {
  classifications: { energy: EnergyType; hazards: string[]; confidence: number }[];
  missingControls: string[];
  incorrectControls: string[];
  recommendedControls: string[];
  conflicts: string[];
  summary: string;
};

export type HazardPatternAnalysis = {
  clusters: { id: string; label: string; count: number; severity: string }[];
  trends: { label: string; delta: number }[];
  correlations: string[];
  precursors: string[];
  escalations: string[];
};

export type RootCausePrediction = {
  likelyCauses: { cause: string; probability: number }[];
  contributingFactors: string[];
  systemicFailures: string[];
  correctiveActions: string[];
};

export type SafetyIntervention = {
  id: string;
  type: InterventionType;
  priority: number;
  title: string;
  reason: string;
  entityType?: string;
  entityId?: string;
  triggeredAt: string;
};

export type SafetyAutomationOutput = {
  jhaRecommendations: string[];
  flhaRecommendations: string[];
  sifReportSummary: string;
  hecaSummary: string;
  energyWheelDiagram: string;
  correctiveActions: string[];
  alerts: string[];
};

export type TwinSafetyOverlay = {
  worker?: {
    safetyRisk: SafetyScore;
    sifRisk: SafetyScore;
    hecaRisk: SafetyScore;
    energyProfile: EnergyType[];
  };
  equipment?: {
    safetyRisk: SafetyScore;
    lockoutTriggers: string[];
    inspectionRisk: SafetyScore;
  };
  project?: {
    projectSafetyScore: SafetyScore;
    hazardClusters: string[];
    sifPredictions: string[];
  };
};

export type SafetyTimelineEntry = {
  id: string;
  at: string;
  category: string;
  message: string;
  severity: SafetyScore["level"];
};

export type SafetyDashboardBundle = {
  generatedAt: string;
  sif: { avgRisk: number; precursorCount: number; alertCount: number };
  heca: { avgRisk: number; deviationCount: number };
  energyWheel: { conflictCount: number; missingControlCount: number };
  hazardClusters: number;
  interventions: SafetyIntervention[];
  trends: { label: string; value: number }[];
};

export type AutonomousSafetyReport = {
  generatedAt: string;
  context: SafetyContextInput;
  sif: SifAnalysis;
  heca: HecaAnalysis;
  energyWheel: EnergyWheelAnalysis;
  hazards: HazardPatternAnalysis;
  rootCause: RootCausePrediction;
  interventions: SafetyIntervention[];
  automation: SafetyAutomationOutput;
  twinOverlay: TwinSafetyOverlay;
  timeline: SafetyTimelineEntry[];
  dashboard: SafetyDashboardBundle;
};
