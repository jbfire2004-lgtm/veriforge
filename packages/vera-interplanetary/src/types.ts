import { z } from "zod";

export type CelestialBody = "earth" | "moon" | "mars" | "orbit" | "deep_space";
export type FacilityType = "surface_base" | "orbital_station" | "habitat" | "rover" | "lander" | "mission";

export type InterplanetarySite = {
  id: string;
  name: string;
  body: CelestialBody;
  facilityType: FacilityType;
  crewCount?: number;
  robotCount?: number;
  lifeSupportOk?: boolean;
  powerLevel?: number;
  radiationLevel?: number;
  commDelayMinutes?: number;
  hazardScore?: number;
};

export type InterplanetaryContextInput = {
  companyId?: string;
  missionId?: string;
  offline?: boolean;
  sites?: InterplanetarySite[];
  earthWorkerCount?: number;
  earthEquipmentCount?: number;
  marketplaceMatchCount?: number;
  networkRiskScore?: number;
};

export type CoordinationLink = {
  id: string;
  from: string;
  to: string;
  domains: string[];
  delayMinutes: number;
  status: "active" | "blackout" | "degraded";
};

export type PlanetaryCoordination = {
  links: CoordinationLink[];
  workforceMoves: string[];
  equipmentMoves: string[];
  logistics: string[];
  safetySync: string[];
};

export type OrbitalCoordination = {
  evaSchedule: { id: string; station: string; window: string; risk: number }[];
  dockingOps: string[];
  debrisAlerts: string[];
  cargoTransfers: string[];
  maintenanceTasks: string[];
  constructionTasks: string[];
  hazardPredictions: string[];
};

export type DeepSpaceCoordination = {
  missionPlans: string[];
  crewSchedules: string[];
  equipmentAllocation: string[];
  emergencyProtocols: string[];
  habitatManagement: string[];
  roboticsCoordination: string[];
};

export type DelayTolerantState = {
  predictedStates: { siteId: string; horizon: string; prediction: string }[];
  prePlannedActions: string[];
  blackoutWindows: { siteId: string; until: string }[];
  syncPending: number;
  autonomousMode: boolean;
};

export type InterplanetaryHazard = {
  id: string;
  type: string;
  body: CelestialBody;
  severity: "critical" | "high" | "medium" | "low";
  probability: number;
  siteId?: string;
};

export type InterplanetarySafety = {
  hazards: InterplanetaryHazard[];
  evaRiskScore: number;
  habitatRiskScore: number;
  recommendations: string[];
};

export type AutomationAction = {
  id: string;
  trigger: string;
  target: string;
  autonomous: boolean;
  executed: boolean;
};

export type InterplanetaryAutomation = {
  actions: AutomationAction[];
  evaAssignments: string[];
  roboticsAssignments: string[];
  lifeSupportAdjustments: string[];
  powerRedistribution: string[];
};

export type InterplanetaryTwin = {
  twinType: string;
  siteId: string;
  health: number;
  predictions: string[];
  failureRisk: number;
};

export type GraphNode = { id: string; type: string; label: string; body?: CelestialBody };
export type GraphEdge = { id: string; from: string; to: string; relation: string };

export type InterplanetaryKnowledgeGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type InterplanetaryPolicy = {
  id: string;
  domain: string;
  rule: string;
  enforced: boolean;
  version: string;
  violation?: boolean;
};

export type InterplanetarySimulation = {
  id: string;
  scenario: string;
  impact: number;
  recommendation: string;
};

export type InterplanetaryDashboard = {
  generatedAt: string;
  siteCount: number;
  activeLinks: number;
  hazardCount: number;
  automationCount: number;
  avgCommDelayMinutes: number;
  interplanetaryRiskScore: number;
};

export type InterplanetaryReport = {
  generatedAt: string;
  context: InterplanetaryContextInput;
  planetary: PlanetaryCoordination;
  orbital: OrbitalCoordination;
  deepSpace: DeepSpaceCoordination;
  delayTolerant: DelayTolerantState;
  safety: InterplanetarySafety;
  automation: InterplanetaryAutomation;
  twins: InterplanetaryTwin[];
  knowledgeGraph: InterplanetaryKnowledgeGraph;
  policies: InterplanetaryPolicy[];
  simulations: InterplanetarySimulation[];
  dashboard: InterplanetaryDashboard;
};
