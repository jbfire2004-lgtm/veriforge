export type StarSystemId = "sol" | "alpha_centauri" | "proxima" | "trappist_1";
export type AssetKind = "colony" | "generation_ship" | "probe" | "replicating_colony" | "orbital_station" | "habitat";
export type InterstellarAsset = {
    id: string;
    name: string;
    system: StarSystemId;
    kind: AssetKind;
    crewCount?: number;
    robotCount?: number;
    lifeSupportOk?: boolean;
    powerLevel?: number;
    radiationLevel?: number;
    commDelayYears?: number;
    hazardScore?: number;
    terraformStage?: number;
};
export type InterstellarContextInput = {
    companyId?: string;
    missionId?: string;
    offline?: boolean;
    assets?: InterstellarAsset[];
    interplanetaryRiskScore?: number;
    marketplaceMatchCount?: number;
};
export type StarSystemLink = {
    id: string;
    from: string;
    to: string;
    delayYears: number;
    domains: string[];
    status: "active" | "blackout" | "generational";
};
export type StarSystemCoordination = {
    links: StarSystemLink[];
    workforceSync: string[];
    roboticsFleets: string[];
    miningOps: string[];
    scienceMissions: string[];
    safetySync: string[];
};
export type GenerationShipCoordination = {
    missionPlans: string[];
    crewSchedules: string[];
    lifeSupportPlans: string[];
    habitatMaintenance: string[];
    educationCycles: string[];
    emergencyProtocols: string[];
    resourceAllocation: string[];
};
export type ProbeCoordination = {
    navigation: string[];
    hazardAvoidance: string[];
    scienceMissions: string[];
    dataTransmission: string[];
    selfRepair: string[];
    resourceHarvesting: string[];
    replication: string[];
};
export type ReplicatingColonyCoordination = {
    replicationCycles: string[];
    resourcePipelines: string[];
    expansionPlans: string[];
    vonNeumannProbes: string[];
};
export type LightYearDelayState = {
    predictedStates: {
        assetId: string;
        horizon: string;
        prediction: string;
    }[];
    prePlannedActions: string[];
    blackoutWindows: {
        assetId: string;
        untilYears: number;
    }[];
    syncPending: number;
    autonomousMode: boolean;
    missionIntegrity: number;
};
export type InterstellarHazard = {
    id: string;
    type: string;
    system: StarSystemId;
    severity: "critical" | "high" | "medium" | "low";
    probability: number;
    assetId?: string;
};
export type InterstellarSafety = {
    hazards: InterstellarHazard[];
    cryosleepRisk: number;
    habitatRisk: number;
    recommendations: string[];
};
export type InterstellarAutomationAction = {
    id: string;
    trigger: string;
    target: string;
    autonomous: boolean;
};
export type InterstellarAutomation = {
    actions: InterstellarAutomationAction[];
    roboticsAssignments: string[];
    terraformingTasks: string[];
    miningTasks: string[];
    cryosleepCycles: string[];
    powerRedistribution: string[];
    selfRepairRoutines: string[];
};
export type InterstellarTwin = {
    twinType: string;
    assetId: string;
    health: number;
    failureRisk: number;
    predictions: string[];
};
export type GraphNode = {
    id: string;
    type: string;
    label: string;
    system?: StarSystemId;
};
export type GraphEdge = {
    id: string;
    from: string;
    to: string;
    relation: string;
};
export type InterstellarKnowledgeGraph = {
    nodes: GraphNode[];
    edges: GraphEdge[];
};
export type InterstellarPolicy = {
    id: string;
    domain: string;
    rule: string;
    enforced: boolean;
    version: string;
    violation?: boolean;
};
export type InterstellarSimulation = {
    id: string;
    scenario: string;
    impact: number;
    recommendation: string;
};
export type InterstellarDashboard = {
    generatedAt: string;
    assetCount: number;
    systemCount: number;
    hazardCount: number;
    automationCount: number;
    avgDelayYears: number;
    interstellarRiskScore: number;
    missionIntegrity: number;
};
export type InterstellarReport = {
    generatedAt: string;
    context: InterstellarContextInput;
    starSystems: StarSystemCoordination;
    generationShips: GenerationShipCoordination;
    probes: ProbeCoordination;
    replicatingColonies: ReplicatingColonyCoordination;
    lightYearDelay: LightYearDelayState;
    safety: InterstellarSafety;
    automation: InterstellarAutomation;
    twins: InterstellarTwin[];
    knowledgeGraph: InterstellarKnowledgeGraph;
    policies: InterstellarPolicy[];
    simulations: InterstellarSimulation[];
    dashboard: InterstellarDashboard;
};
//# sourceMappingURL=types.d.ts.map