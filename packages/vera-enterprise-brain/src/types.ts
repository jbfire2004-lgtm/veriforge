import { z } from "zod";

export const BrainHorizonSchema = z.enum(["daily", "weekly", "monthly"]);
export type BrainHorizon = z.infer<typeof BrainHorizonSchema>;

export const DecisionModeSchema = z.enum(["autonomous", "assisted", "supervisor", "override", "escalation"]);
export type DecisionMode = z.infer<typeof DecisionModeSchema>;

export type BrainContextInput = {
  companyId?: string;
  unionHallId?: string;
  projectId?: string;
  offline?: boolean;
  eventName?: string;
  workerCount?: number;
  equipmentCount?: number;
  projectCount?: number;
  nonCompliantWorkers?: number;
  expiringTraining?: number;
  inspectionFailures?: number;
  sifPrecursors?: number;
  schedulingShortages?: { projectId: string; deficit: number }[];
  goals?: Partial<EnterpriseGoals>;
};

export type EnterpriseGoals = {
  safety: number;
  compliance: number;
  readiness: number;
  productivity: number;
  cost: number;
};

export type ReasoningStep = {
  id: string;
  domain: string;
  conclusion: string;
  confidence: number;
  safetyFirst?: boolean;
};

export type ReasoningResult = {
  steps: ReasoningStep[];
  summary: string;
  crossDomainInsights: string[];
};

export type PlanItem = {
  id: string;
  horizon: BrainHorizon;
  domain: string;
  action: string;
  priority: number;
  resource?: string;
};

export type PlanningResult = {
  daily: PlanItem[];
  weekly: PlanItem[];
  monthly: PlanItem[];
  summary: string;
};

export type OptimizationResult = {
  domain: string;
  score: number;
  recommendations: string[];
  allocations: { entityId: string; targetId: string; priority: number }[];
};

export type PredictionResult = {
  id: string;
  label: string;
  probability: number;
  horizonDays: number;
  domain: string;
  preventiveAction?: string;
};

export type MemoryEntry = {
  id: string;
  category: "long_term" | "short_term" | "pattern" | "safety" | "compliance";
  content: string;
  relevance: number;
  at: string;
};

export type ContextSnapshot = {
  enterprise: Record<string, unknown>;
  safety: Record<string, unknown>;
  operations: Record<string, unknown>;
  compliance: Record<string, unknown>;
  workforce: Record<string, unknown>;
  equipment: Record<string, unknown>;
};

export type PolicyRule = {
  id: string;
  name: string;
  domain: string;
  version: string;
  enforced: boolean;
  violation?: string;
};

export type SimulationScenario = {
  id: string;
  name: string;
  outcome: string;
  riskDelta: number;
  recommendedAction: string;
};

export type BrainDecision = {
  id: string;
  mode: DecisionMode;
  title: string;
  reason: string;
  confidence: number;
  executed: boolean;
  overrideable: boolean;
};

export type BrainDashboardBundle = {
  generatedAt: string;
  healthScore: number;
  reasoningSteps: number;
  planCount: number;
  predictionCount: number;
  decisionCount: number;
  policyViolations: number;
  simulationCount: number;
  memoryEntries: number;
};

export type EnterpriseBrainReport = {
  generatedAt: string;
  context: BrainContextInput;
  reasoning: ReasoningResult;
  planning: PlanningResult;
  optimization: OptimizationResult[];
  predictions: PredictionResult[];
  memory: MemoryEntry[];
  contextSnapshot: ContextSnapshot;
  goals: EnterpriseGoals;
  policies: PolicyRule[];
  simulations: SimulationScenario[];
  decisions: BrainDecision[];
  commandCenterRef?: Record<string, unknown>;
  dashboard: BrainDashboardBundle;
};
