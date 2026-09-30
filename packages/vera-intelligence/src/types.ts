import { z } from "zod";

export const IntelligenceModuleSchema = z.enum([
  "worker",
  "equipment",
  "training",
  "provider",
  "unionHall",
  "company",
  "project",
  "compliance",
  "inspection",
  "competency",
  "dashboard",
  "offline",
]);
export type IntelligenceModule = z.infer<typeof IntelligenceModuleSchema>;

export const RiskLevelSchema = z.enum(["low", "medium", "high", "critical"]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export type ScoreResult = {
  score: number;
  level: RiskLevel;
  factors: { id: string; label: string; weight: number; contribution: number }[];
  confidence: number;
};

export type PredictionResult = {
  id: string;
  label: string;
  probability: number;
  horizonDays: number;
  predictedAt: string;
  metadata?: Record<string, unknown>;
};

export type Recommendation = {
  id: string;
  module: IntelligenceModule;
  priority: number;
  title: string;
  description: string;
  actionType: string;
  actionHref?: string;
  entityType?: string;
  entityId?: string;
};

export type Anomaly = {
  id: string;
  module: IntelligenceModule;
  severity: RiskLevel;
  code: string;
  message: string;
  detectedAt: string;
  entityType?: string;
  entityId?: string;
  evidence?: Record<string, unknown>;
};

export type SummaryResult = {
  text: string;
  bullets: string[];
  generatedAt: string;
};

export type ClassificationResult = {
  category: string;
  tags: string[];
  confidence: number;
  standards?: string[];
};

export type NlpIntent =
  | "worker.query"
  | "training.query"
  | "compliance.query"
  | "project.readiness"
  | "equipment.query"
  | "report.summary"
  | "recommendations"
  | "unknown";

export type NlpQuery = { text: string; intent: NlpIntent; entities: Record<string, string> };

export type NlpResponse = {
  intent: NlpIntent;
  answer: string;
  data?: unknown;
  followUps?: string[];
};

export type IntelligenceContext = {
  companyId?: string | number;
  projectId?: string | number;
  workerId?: string | number;
  equipmentId?: string | number;
  offline?: boolean;
  locale?: string;
};

export type WorkerIntelInput = {
  id: string;
  name: string;
  isCompliant: boolean;
  expiringSoon: boolean;
  expiredTraining: number;
  failedInspections: number;
  competencyGaps: number;
  daysToNextExpiry?: number;
  recentComplianceDrop?: boolean;
  repeatedFailures?: number;
  trainingMismatch?: boolean;
  projectIds?: string[];
};

export type EquipmentIntelInput = {
  id: string;
  name: string;
  isCompliant: boolean;
  lockedOut: boolean;
  overdueInspection: boolean;
  daysToInspection?: number;
  failedInspections: number;
  lockoutCount: number;
  competencyGaps: number;
  usageAnomaly?: boolean;
};

export type TrainingIntelInput = {
  id: string;
  title: string;
  providerId?: string;
  expiryDate?: string;
  isValid: boolean;
  standardCodes?: string[];
  certificateHash?: string;
  fraudSignals?: string[];
};

export type ProjectIntelInput = {
  id: string;
  name: string;
  readiness: number;
  missingWorkers: number;
  missingEquipment: number;
  missingTraining: number;
  workerCount: number;
  equipmentCount: number;
};

export type CompanyIntelInput = {
  id: string;
  name: string;
  complianceRate: number;
  highRiskWorkers: number;
  highRiskEquipment: number;
  expiringTraining: number;
};

export type IntelligenceBundle = {
  generatedAt: string;
  context: IntelligenceContext;
  worker?: Record<string, unknown>;
  equipment?: Record<string, unknown>;
  training?: Record<string, unknown>;
  project?: Record<string, unknown>;
  company?: Record<string, unknown>;
  compliance?: Record<string, unknown>;
  dashboard?: {
    widgets: Record<string, unknown>;
    summary: SummaryResult;
  };
  recommendations: Recommendation[];
  anomalies: Anomaly[];
  automationTasks?: { id: string; type: string; scheduledAt: string }[];
};
