import { z } from "zod";

export const AutomationModuleSchema = z.enum([
  "safety",
  "operations",
  "scheduling",
  "compliance",
  "document",
  "twin",
  "data",
  "cross_module",
  "multi_entity",
  "workflow",
  "rules",
]);
export type AutomationModule = z.infer<typeof AutomationModuleSchema>;

export const EnterpriseActionStatusSchema = z.enum([
  "pending",
  "executed",
  "queued",
  "failed",
  "overridden",
  "rolled_back",
  "superseded",
]);
export type EnterpriseActionStatus = z.infer<typeof EnterpriseActionStatusSchema>;

export type EnterpriseAction = {
  id: string;
  module: AutomationModule;
  phase?: string;
  type: string;
  status: EnterpriseActionStatus;
  title: string;
  reason: string;
  priority: number;
  entityType: string;
  entityId: string;
  targetId?: string;
  overrideable: boolean;
  rollbackable: boolean;
  executedAt?: string;
  metadata?: Record<string, unknown>;
};

export type EnterpriseContextInput = {
  companyId?: string;
  unionHallId?: string;
  projectId?: string;
  offline?: boolean;
  autoExecute?: boolean;
  eventName?: string;
  workerCount?: number;
  equipmentCount?: number;
  projectCount?: number;
  nonCompliantWorkers?: number;
  expiringTraining?: number;
  inspectionFailures?: number;
  lockedEquipment?: number;
  safetyForms?: { id: string; kind: string; title: string; hazardSummary?: string }[];
  documents?: { id: string; text?: string; fraudScore?: number }[];
  schedulingShortages?: { projectId: string; deficit: number }[];
};

export type CrossModuleAutomation = {
  chains: { id: string; trigger: string; steps: string[] }[];
  actions: EnterpriseAction[];
};

export type MultiEntityAutomation = {
  balances: { domain: string; action: string; count: number }[];
  actions: EnterpriseAction[];
};

export type PhaseAutomationBundle = {
  actions: EnterpriseAction[];
  insights: string[];
  dashboard?: Record<string, unknown>;
};

export type EnterpriseRulesResult = {
  evaluated: number;
  triggered: number;
  rules: { id: string; name: string; domain: string; version: string; triggered: boolean }[];
  actions: EnterpriseAction[];
};

export type EnterpriseWorkflowResult = {
  workflows: { id: string; name: string; steps: string[]; status: string }[];
  actions: EnterpriseAction[];
};

export type AutomationConflict = {
  id: string;
  actions: string[];
  resolution: string;
  winnerId?: string;
};

export type EnterpriseExecutionResult = {
  executed: EnterpriseAction[];
  queued: EnterpriseAction[];
  failed: EnterpriseAction[];
  log: EnterpriseAction[];
};

export type TwinEnterpriseOverlay = {
  updated: { type: string; id: string; fields: string[] }[];
  predictions: { entityId: string; label: string; probability: number }[];
};

export type EnterpriseDashboardBundle = {
  generatedAt: string;
  queueSize: number;
  actionCount: number;
  executedCount: number;
  conflictCount: number;
  overrideCount: number;
  healthScore: number;
  modules: Record<string, number>;
  trends: { label: string; value: number }[];
  insights: string[];
};

export type EnterpriseAutomationReport = {
  generatedAt: string;
  context: EnterpriseContextInput;
  safety: PhaseAutomationBundle;
  operations: PhaseAutomationBundle;
  scheduling: PhaseAutomationBundle;
  compliance: PhaseAutomationBundle;
  document: PhaseAutomationBundle;
  twin: PhaseAutomationBundle & { overlay: TwinEnterpriseOverlay };
  data: PhaseAutomationBundle;
  crossModule: CrossModuleAutomation;
  multiEntity: MultiEntityAutomation;
  rules: EnterpriseRulesResult;
  workflows: EnterpriseWorkflowResult;
  conflicts: AutomationConflict[];
  execution: EnterpriseExecutionResult;
  dashboard: EnterpriseDashboardBundle;
  overrides: { actionId: string; reason: string }[];
};
