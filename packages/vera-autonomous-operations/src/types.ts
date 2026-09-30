import { z } from "zod";

export const ActionTypeSchema = z.enum([
  "dispatch.assign",
  "dispatch.recall",
  "dispatch.escalate",
  "assignment.worker",
  "assignment.equipment",
  "assignment.operator",
  "assignment.crew",
  "lockout.apply",
  "lockout.release",
  "restriction.apply",
  "restriction.lift",
  "roster.build",
  "roster.correct",
  "conflict.resolve",
  "readiness.correct",
  "readiness.trigger_training",
  "readiness.trigger_inspection",
  "notify.worker",
  "notify.supervisor",
  "notify.union_hall",
]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

export const ActionStatusSchema = z.enum([
  "pending",
  "executed",
  "queued",
  "failed",
  "overridden",
  "rolled_back",
]);
export type ActionStatus = z.infer<typeof ActionStatusSchema>;

export type OperationsWorkerInput = {
  id: string;
  name: string;
  companyId?: string;
  unionHallId?: string;
  projectIds?: string[];
  skills?: string[];
  isCompliant?: boolean;
  competencyValid?: boolean;
  trainingValid?: boolean;
  readinessScore?: number;
  fatigueScore?: number;
  sifRiskScore?: number;
  hecaDeviation?: boolean;
  dispatchStatus?: "available" | "dispatched" | "unavailable";
  restricted?: boolean;
  restrictionReason?: string;
};

export type OperationsEquipmentInput = {
  id: string;
  name: string;
  companyId?: string;
  projectIds?: string[];
  lockedOut?: boolean;
  inspectionPassed?: boolean;
  visionDamageDetected?: boolean;
  sifPrecursor?: boolean;
  hecaDeviation?: boolean;
  energyConflict?: boolean;
  competencyMismatch?: boolean;
  operatorId?: string;
};

export type OperationsProjectInput = {
  id: string;
  name: string;
  requiredWorkers?: number;
  assignedWorkers?: number;
  requiredEquipment?: number;
  assignedEquipment?: number;
  requiredSkills?: string[];
  readinessScore?: number;
};

export type OperationsDispatchInput = {
  id: string;
  workerId: string;
  unionHallId: string;
  companyId: string;
  projectId?: string;
  recalledAt?: string;
};

export type OperationsContextInput = {
  companyId?: string;
  unionHallId?: string;
  projectId?: string;
  offline?: boolean;
  autoExecute?: boolean;
  workers?: OperationsWorkerInput[];
  equipment?: OperationsEquipmentInput[];
  projects?: OperationsProjectInput[];
  dispatches?: OperationsDispatchInput[];
  schedulingShortages?: { projectId: string; deficit: number }[];
  safetyInterventions?: string[];
};

export type AutonomousAction = {
  id: string;
  type: ActionType;
  status: ActionStatus;
  title: string;
  reason: string;
  entityType: "worker" | "equipment" | "project" | "dispatch";
  entityId: string;
  targetId?: string;
  overrideable: boolean;
  rollbackable: boolean;
  executedAt?: string;
  metadata?: Record<string, unknown>;
};

export type AutoDispatchResult = {
  dispatches: AutonomousAction[];
  recalls: AutonomousAction[];
  escalations: AutonomousAction[];
  shortages: string[];
  conflicts: string[];
  violations: string[];
  notifications: AutonomousAction[];
};

export type AutoAssignmentResult = {
  assignments: AutonomousAction[];
  replacements: AutonomousAction[];
  conflicts: string[];
  violations: string[];
  shortages: string[];
};

export type AutoLockoutResult = {
  lockouts: AutonomousAction[];
  unlocks: AutonomousAction[];
  notifications: AutonomousAction[];
};

export type AutoRestrictionResult = {
  restrictions: AutonomousAction[];
  lifts: AutonomousAction[];
};

export type AutoRosterResult = {
  roster: { date: string; workerIds: string[]; shift: string }[];
  corrections: AutonomousAction[];
  understaffing: string[];
  overstaffing: string[];
  skillGaps: string[];
};

export type ConflictResolutionResult = {
  resolutions: AutonomousAction[];
  unresolved: string[];
};

export type AutoReadinessResult = {
  readinessByProject: { projectId: string; score: number; level: string }[];
  failures: string[];
  recommendations: string[];
  correctiveActions: AutonomousAction[];
};

export type ExecutionResult = {
  executed: AutonomousAction[];
  queued: AutonomousAction[];
  failed: AutonomousAction[];
  log: AutonomousAction[];
};

export type TwinOperationsOverlay = {
  worker?: Record<string, { restricted: boolean; dispatchStatus: string; readiness: number }>;
  equipment?: Record<string, { lockedOut: boolean; operatorId?: string }>;
  project?: Record<string, { readiness: number; autonomousActions: number }>;
};

export type OperationsDashboardBundle = {
  generatedAt: string;
  totalActions: number;
  executedCount: number;
  pendingCount: number;
  dispatch: { assign: number; recall: number; conflicts: number };
  assignment: { count: number; conflicts: number };
  lockout: { applied: number; released: number };
  restriction: { applied: number; lifted: number };
  roster: { days: number; corrections: number };
  conflicts: { resolved: number; unresolved: number };
  readiness: { failures: number; corrections: number };
  sync: { queued: number; synced: number };
};

export type AutonomousOperationsReport = {
  generatedAt: string;
  context: OperationsContextInput;
  dispatch: AutoDispatchResult;
  assignment: AutoAssignmentResult;
  lockout: AutoLockoutResult;
  restriction: AutoRestrictionResult;
  roster: AutoRosterResult;
  conflicts: ConflictResolutionResult;
  readiness: AutoReadinessResult;
  execution: ExecutionResult;
  twinOverlay: TwinOperationsOverlay;
  dashboard: OperationsDashboardBundle;
  overrides: { actionId: string; reason: string }[];
};
