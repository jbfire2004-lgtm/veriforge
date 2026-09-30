import { z } from "zod";

export type CivilizationScope = {
  id: string;
  name: string;
  type: "planet" | "system" | "colony" | "generation_ship" | "species_enclave";
  population?: number;
  stability?: number;
  growthRate?: number;
  resourceIndex?: number;
};

export type CivilizationContextInput = {
  companyId?: string;
  offline?: boolean;
  scopes?: CivilizationScope[];
  interstellarRiskScore?: number;
  missionIntegrity?: number;
  assetCount?: number;
  systemCount?: number;
};

export type GovernanceDecision = {
  id: string;
  domain: string;
  decision: string;
  auditable: boolean;
  enforced: boolean;
};

export type CivilizationGovernance = {
  decisions: GovernanceDecision[];
  multiPlanetPolicies: string[];
  resourceAllocation: string[];
  conflictResolution: string[];
  rightsProtections: string[];
};

export type EthicalRule = {
  id: string;
  framework: string;
  rule: string;
  priority: number;
  violation?: boolean;
};

export type CivilizationEthics = {
  rules: EthicalRule[];
  alignmentScore: number;
  overrides: string[];
  recommendations: string[];
};

export type StabilityForecast = {
  label: string;
  probability: number;
  horizon: string;
};

export type CivilizationStability = {
  stabilityScore: number;
  forecasts: StabilityForecast[];
  interventions: string[];
};

export type GrowthForecast = {
  domain: string;
  rate: number;
  horizon: string;
};

export type CivilizationGrowth = {
  forecasts: GrowthForecast[];
  optimizationPlans: string[];
};

export type CivilizationSustainability = {
  sustainabilityScore: number;
  predictions: StabilityForecast[];
  recommendations: string[];
};

export type KnowledgeEntry = {
  id: string;
  type: string;
  label: string;
  preserved: boolean;
};

export type CivilizationKnowledge = {
  graphNodes: number;
  graphEdges: number;
  entries: KnowledgeEntry[];
  scientificDiscoveries: string[];
  culturalPreservation: string[];
};

export type CivilizationCoordination = {
  logistics: string[];
  workforce: string[];
  resources: string[];
  science: string[];
  terraforming: string[];
  defense: string[];
};

export type CivilizationSimulation = {
  id: string;
  scenario: string;
  impact: number;
  recommendation: string;
};

export type CivilizationDecision = {
  id: string;
  kind: "autonomous" | "assisted" | "consensus" | "ethical_override" | "emergency" | "strategic";
  title: string;
  rationale: string;
  executed: boolean;
};

export type MemoryRecord = {
  id: string;
  era: string;
  domain: string;
  summary: string;
};

export type CivilizationMemory = {
  records: MemoryRecord[];
  centurySpan: number;
};

export type CivilizationDashboard = {
  generatedAt: string;
  scopeCount: number;
  stabilityScore: number;
  sustainabilityScore: number;
  ethicsAlignment: number;
  decisionCount: number;
  simulationCount: number;
  memoryRecords: number;
};

export type CivilizationReport = {
  generatedAt: string;
  context: CivilizationContextInput;
  governance: CivilizationGovernance;
  ethics: CivilizationEthics;
  stability: CivilizationStability;
  growth: CivilizationGrowth;
  sustainability: CivilizationSustainability;
  knowledge: CivilizationKnowledge;
  coordination: CivilizationCoordination;
  simulations: CivilizationSimulation[];
  decisions: CivilizationDecision[];
  memory: CivilizationMemory;
  dashboard: CivilizationDashboard;
};
