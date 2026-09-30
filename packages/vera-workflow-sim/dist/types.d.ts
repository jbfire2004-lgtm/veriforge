import { z } from "zod";
export declare const LifecycleCategorySchema: z.ZodEnum<["worker", "equipment", "training", "trainingProvider", "unionHall", "company", "project", "compliance", "inspection", "competency", "offlineSync", "dashboard"]>;
export type LifecycleCategory = z.infer<typeof LifecycleCategorySchema>;
export declare const ScenarioKindSchema: z.ZodEnum<["happy", "edge", "error", "offline", "conflict", "multiUser", "multiCompany"]>;
export type ScenarioKind = z.infer<typeof ScenarioKindSchema>;
export declare const VeraRoleSchema: z.ZodEnum<["SUPER_ADMIN", "ADMIN", "COMPANY_ADMIN", "SUPERVISOR", "PROJECT_MANAGER", "WORKER", "TRAINING_PROVIDER_ADMIN", "TRAINING_INSTRUCTOR", "UNION_HALL_ADMIN"]>;
export type VeraRole = z.infer<typeof VeraRoleSchema>;
export type WorkflowStepDef = {
    id: string;
    label: string;
    required?: boolean;
    permissions?: VeraRole[];
    complianceChecks?: string[];
    offlineCapable?: boolean;
};
export type WorkflowTransition = {
    from: string;
    to: string;
    event: string;
    guards?: string[];
    permissions?: VeraRole[];
};
export type WorkflowDefinition = {
    id: string;
    title: string;
    category: LifecycleCategory;
    description?: string;
    initialState: string;
    terminalStates: string[];
    states: string[];
    steps: WorkflowStepDef[];
    transitions: WorkflowTransition[];
    modules: string[];
};
export type SimulationContext = {
    role: VeraRole;
    companyId?: string;
    projectId?: string;
    workerId?: string;
    equipmentId?: string;
    providerId?: string;
    offline?: boolean;
    serverVersion?: number;
    clientVersion?: number;
    complianceFlags?: Record<string, boolean>;
    permissions?: Record<string, boolean>;
    multiCompany?: boolean;
    actorIds?: string[];
};
export type SimulationEvent = {
    type: string;
    payload?: Record<string, unknown>;
    at?: string;
};
export type SimulationScenario = {
    id: string;
    name: string;
    workflowId: string;
    kind: ScenarioKind;
    events: SimulationEvent[];
    context: SimulationContext;
    expect?: {
        finalState?: string;
        noErrors?: boolean;
        conflictCount?: number;
        syncPending?: boolean;
    };
};
export type ValidationSeverity = "info" | "warn" | "error";
export type ValidationIssue = {
    code: string;
    message: string;
    severity: ValidationSeverity;
    stepId?: string;
    transition?: string;
    validator: string;
};
export type SimulationLogEntry = {
    timestamp: string;
    level: "debug" | "info" | "warn" | "error";
    message: string;
    state?: string;
    event?: string;
    issues?: ValidationIssue[];
};
export type StepRunResult = {
    stepId: string;
    ok: boolean;
    issues: ValidationIssue[];
};
export type SimulationRunResult = {
    scenarioId: string;
    workflowId: string;
    kind: ScenarioKind;
    success: boolean;
    initialState: string;
    finalState: string;
    visitedStates: string[];
    logs: SimulationLogEntry[];
    issues: ValidationIssue[];
    stepResults: StepRunResult[];
    durationMs: number;
};
export type WorkflowSimulationReport = {
    generatedAt: string;
    summary: {
        total: number;
        passed: number;
        failed: number;
        byCategory: Record<LifecycleCategory, {
            passed: number;
            failed: number;
        }>;
        byKind: Record<ScenarioKind, {
            passed: number;
            failed: number;
        }>;
    };
    runs: SimulationRunResult[];
    errors: ValidationIssue[];
    conflicts: ValidationIssue[];
    compliance: ValidationIssue[];
    sync: ValidationIssue[];
    mermaidDiagrams: Record<string, string>;
};
//# sourceMappingURL=types.d.ts.map