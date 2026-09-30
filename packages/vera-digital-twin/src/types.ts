import { z } from "zod";

export const TwinTypeSchema = z.enum([
  "worker",
  "equipment",
  "project",
  "company",
  "provider",
  "unionHall",
]);
export type TwinType = z.infer<typeof TwinTypeSchema>;

export const TwinEventSchema = z.enum([
  "worker.created",
  "worker.linked",
  "worker.unlinked",
  "worker.updated",
  "project.assigned",
  "project.removed",
  "project.closed",
  "training.uploaded",
  "training.validated",
  "training.expired",
  "inspection.completed",
  "inspection.failed",
  "equipment.created",
  "equipment.linked",
  "equipment.locked",
  "equipment.unlocked",
  "competency.evaluated",
  "provider.approved",
  "provider.rejected",
  "document.uploaded",
  "safety.form.completed",
  "dispatch.created",
  "dispatch.recalled",
  "member.added",
  "compliance.recalc",
  "sync.batch",
  "twin.offline",
  "twin.synced",
]);
export type TwinEventName = z.infer<typeof TwinEventSchema>;

export type ScoreSnapshot = {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  updatedAt: string;
};

export type PredictionSnapshot = {
  id: string;
  label: string;
  probability: number;
  horizonDays: number;
};

export type TimelineEntry = {
  id: string;
  at: string;
  event: TwinEventName | string;
  summary: string;
  delta?: Record<string, unknown>;
  aiSummary?: string;
};

export type OfflineTwinState = {
  pending: boolean;
  lastSyncedAt?: string;
  clientVersion?: number;
  serverVersion?: number;
  queuedEvents: number;
};

export type BaseTwinState = {
  id: string;
  type: TwinType;
  name: string;
  updatedAt: string;
  compliance: ScoreSnapshot;
  risk: ScoreSnapshot;
  readiness: ScoreSnapshot;
  predictions: PredictionSnapshot[];
  offline: OfflineTwinState;
  timeline: TimelineEntry[];
};

export type WorkerTwinState = BaseTwinState & {
  type: "worker";
  companyId?: string;
  unionHallId?: string;
  projectIds: string[];
  trainingCount: number;
  expiringTraining: number;
  competencyGaps: number;
  dispatchStatus: "available" | "dispatched" | "unavailable";
  walletItemCount: number;
  visionDocuments: number;
};

export type EquipmentTwinState = BaseTwinState & {
  type: "equipment";
  companyId?: string;
  projectIds: string[];
  lockedOut: boolean;
  overdueInspection: boolean;
  inspectionCount: number;
  competencyRequired: boolean;
  visionPlates: number;
};

export type ProjectTwinState = BaseTwinState & {
  type: "project";
  companyId: string;
  workerCount: number;
  equipmentCount: number;
  missingWorkers: number;
  missingEquipment: number;
  missingTraining: number;
  safetyDocumentCount: number;
};

export type CompanyTwinState = BaseTwinState & {
  type: "company";
  workerCount: number;
  equipmentCount: number;
  projectCount: number;
  providerCount: number;
  unionHallIds: string[];
};

export type ProviderTwinState = BaseTwinState & {
  type: "provider";
  approved: boolean;
  instructorCount: number;
  courseCount: number;
  trainingVolume: number;
  qualityScore: number;
};

export type UnionHallTwinState = BaseTwinState & {
  type: "unionHall";
  memberCount: number;
  dispatchQueue: number;
  readyForDispatch: number;
  missingTraining: number;
};

export type DigitalTwin =
  | WorkerTwinState
  | EquipmentTwinState
  | ProjectTwinState
  | CompanyTwinState
  | ProviderTwinState
  | UnionHallTwinState;

export type TwinDashboardBundle = {
  generatedAt: string;
  workers: { total: number; atRisk: number; avgReadiness: number };
  equipment: { total: number; lockedOut: number; avgReadiness: number };
  projects: { total: number; notReady: number; avgReadiness: number };
  companies: { total: number; avgCompliance: number };
  providers: { total: number; pendingApproval: number };
  unionHalls: { total: number; dispatchReady: number };
  anomalies: { entityType: TwinType; entityId: string; message: string }[];
  predictions: PredictionSnapshot[];
};

export type TwinEventPayload = {
  name: TwinEventName | string;
  entityType: TwinType;
  entityId: string;
  occurredAt: string;
  companyId?: string;
  projectId?: string;
  data?: Record<string, unknown>;
};
