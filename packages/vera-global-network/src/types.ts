import { z } from "zod";

export const AlertSeveritySchema = z.enum(["critical", "high", "medium", "low"]);
export type AlertSeverity = z.infer<typeof AlertSeveritySchema>;

export type AnonymizedCompanyInput = {
  companyHash: string;
  industry?: string;
  region?: string;
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
  visionHazards?: number;
  hazardTexts?: string[];
};

export type NetworkContextInput = {
  companyId?: string;
  companyHash?: string;
  offline?: boolean;
  companies?: AnonymizedCompanyInput[];
  totalWorkers?: number;
  totalEquipment?: number;
  totalUnionHalls?: number;
  totalProviders?: number;
};

export type HazardCluster = {
  id: string;
  label: string;
  count: number;
  industries: string[];
  trend: "up" | "down" | "stable";
};

export type GlobalHazardIntelligence = {
  clusters: HazardCluster[];
  predictions: { label: string; probability: number; region?: string }[];
  alerts: string[];
  recommendedControls: string[];
};

export type GlobalSafetyIntelligence = {
  globalSafetyScore: number;
  globalRiskScore: number;
  sifPrediction: number;
  hecaPrediction: number;
  energyConflictPrediction: number;
  trends: { label: string; delta: number }[];
  recommendations: string[];
};

export type GlobalWorkforceIntelligence = {
  availabilityMap: { region: string; availability: number }[];
  shortagePredictions: { region: string; deficit: number }[];
  skillGaps: string[];
  mobilityRecommendations: string[];
  fatigueRisk: number;
};

export type GlobalEquipmentIntelligence = {
  reliabilityScore: number;
  riskScore: number;
  failurePredictions: { pattern: string; probability: number }[];
  lockoutPatterns: string[];
  recommendations: string[];
};

export type GlobalTrainingIntelligence = {
  forecast: { certification: string; demand: number }[];
  gaps: string[];
  providerPerformance: { providerHash: string; score: number }[];
  expiryClusters: string[];
};

export type GlobalComplianceIntelligence = {
  globalScore: number;
  trends: { label: string; value: number }[];
  regulatoryRisks: string[];
  recommendations: string[];
};

export type GlobalDispatchIntelligence = {
  dispatchMap: { region: string; demand: number; supply: number }[];
  conflicts: number;
  recommendations: string[];
};

export type GlobalAutomationIntelligence = {
  patternsLearned: number;
  outcomeImprovements: string[];
  failurePredictions: string[];
  recommendations: string[];
};

export type TwinFederationSignal = {
  twinType: string;
  signal: string;
  strength: number;
  anonymized: boolean;
};

export type KnowledgeGraphNode = {
  id: string;
  type: string;
  label: string;
};

export type KnowledgeGraphEdge = {
  id: string;
  from: string;
  to: string;
  relation: string;
};

export type KnowledgeGraph = {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
};

export type PrivacyEnvelope = {
  differentialPrivacyEpsilon: number;
  federatedLearningRound: number;
  anonymizationLevel: string;
  companyIsolation: boolean;
  encryptedFederation: boolean;
};

export type GlobalAlert = {
  id: string;
  severity: AlertSeverity;
  domain: string;
  title: string;
  message: string;
  at: string;
};

export type GlobalNetworkDashboard = {
  generatedAt: string;
  companiesInNetwork: number;
  hazardClusters: number;
  globalSafetyScore: number;
  globalComplianceScore: number;
  workforceShortages: number;
  equipmentRisk: number;
  dispatchDemand: number;
  alertCount: number;
  graphNodes: number;
};

export type GlobalNetworkReport = {
  generatedAt: string;
  context: NetworkContextInput;
  hazards: GlobalHazardIntelligence;
  safety: GlobalSafetyIntelligence;
  workforce: GlobalWorkforceIntelligence;
  equipment: GlobalEquipmentIntelligence;
  training: GlobalTrainingIntelligence;
  compliance: GlobalComplianceIntelligence;
  dispatch: GlobalDispatchIntelligence;
  automation: GlobalAutomationIntelligence;
  twinFederation: TwinFederationSignal[];
  knowledgeGraph: KnowledgeGraph;
  privacy: PrivacyEnvelope;
  alerts: GlobalAlert[];
  dashboard: GlobalNetworkDashboard;
};
