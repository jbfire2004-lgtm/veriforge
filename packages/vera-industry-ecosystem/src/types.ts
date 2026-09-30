import { z } from "zod";

export const AlertSeveritySchema = z.enum(["critical", "high", "medium", "low"]);
export type AlertSeverity = z.infer<typeof AlertSeveritySchema>;

export type IndustryParticipant = {
  companyHash: string;
  industry: string;
  region: string;
  workerCount?: number;
  equipmentCount?: number;
  projectCount?: number;
  sifForms?: number;
  hecaForms?: number;
  energyWheelForms?: number;
  inspectionFailures?: number;
  nonCompliantWorkers?: number;
  expiringTraining?: number;
  dispatchConflicts?: number;
  schedulingShortages?: number;
  automationFailures?: number;
};

export type IndustryContextInput = {
  companyId?: string;
  industry?: string;
  region?: string;
  offline?: boolean;
  participants?: IndustryParticipant[];
  totalWorkers?: number;
  totalEquipment?: number;
  totalProviders?: number;
  totalUnionHalls?: number;
  networkRiskScore?: number;
  networkSafetyScore?: number;
};

export type CoordinationAction = {
  id: string;
  domain: string;
  action: string;
  priority: "critical" | "high" | "medium" | "low";
  anonymized: boolean;
};

export type IndustryCoordination = {
  actions: CoordinationAction[];
  workforceSharing: string[];
  equipmentSharing: string[];
  dispatchCoordination: string[];
  trainingCoordination: string[];
  safetyCoordination: string[];
  complianceCoordination: string[];
};

export type IndustryForecast = {
  label: string;
  probability: number;
  horizon: string;
  region?: string;
};

export type IndustryPrediction = {
  forecasts: IndustryForecast[];
  alerts: string[];
  recommendations: string[];
};

export type OptimizationAllocation = {
  region: string;
  resource: string;
  fromSurplus: number;
  toDeficit: number;
};

export type IndustryOptimization = {
  allocations: OptimizationAllocation[];
  workforceDistribution: string[];
  equipmentDistribution: string[];
  trainingDistribution: string[];
  dispatchDistribution: string[];
  safetyResourceMoves: string[];
  efficiencyGain: number;
};

export type IndustryRiskRegion = {
  region: string;
  score: number;
  hazards: string[];
};

export type IndustryRisk = {
  industryScore: number;
  sifRisk: number;
  hecaRisk: number;
  energyWheelRisk: number;
  complianceRisk: number;
  operationalRisk: number;
  riskMap: IndustryRiskRegion[];
  predictions: IndustryForecast[];
  recommendations: string[];
};

export type ReadinessDimension = {
  dimension: string;
  score: number;
  trend: "up" | "down" | "stable";
};

export type IndustryReadiness = {
  industryReadinessScore: number;
  dimensions: ReadinessDimension[];
  predictions: IndustryForecast[];
  recommendations: string[];
};

export type IndustryAutomationAction = {
  id: string;
  trigger: string;
  scope: string;
  enabled: boolean;
  privacySafe: boolean;
};

export type IndustryAutomation = {
  actions: IndustryAutomationAction[];
  patternsLearned: number;
  outcomeImprovements: string[];
};

export type IndustryTwinSignal = {
  twinType: string;
  signal: string;
  strength: number;
  anonymized: boolean;
};

export type IndustryGraphNode = { id: string; type: string; label: string };
export type IndustryGraphEdge = { id: string; from: string; to: string; relation: string };

export type IndustryKnowledgeGraph = {
  nodes: IndustryGraphNode[];
  edges: IndustryGraphEdge[];
};

export type IndustryPolicy = {
  id: string;
  domain: string;
  rule: string;
  enforced: boolean;
  version: string;
  violation?: boolean;
};

export type IndustrySimulation = {
  id: string;
  scenario: string;
  impact: number;
  recommendation: string;
};

export type IndustryAlert = {
  id: string;
  severity: AlertSeverity;
  domain: string;
  title: string;
  message: string;
  at: string;
};

export type IndustryDashboard = {
  generatedAt: string;
  participantCount: number;
  industryRiskScore: number;
  industryReadinessScore: number;
  coordinationActions: number;
  forecastCount: number;
  automationActions: number;
  alertCount: number;
  graphNodes: number;
};

export type IndustryEcosystemReport = {
  generatedAt: string;
  context: IndustryContextInput;
  coordination: IndustryCoordination;
  prediction: IndustryPrediction;
  optimization: IndustryOptimization;
  risk: IndustryRisk;
  readiness: IndustryReadiness;
  automation: IndustryAutomation;
  twinFederation: IndustryTwinSignal[];
  knowledgeGraph: IndustryKnowledgeGraph;
  policies: IndustryPolicy[];
  simulations: IndustrySimulation[];
  alerts: IndustryAlert[];
  dashboard: IndustryDashboard;
};
