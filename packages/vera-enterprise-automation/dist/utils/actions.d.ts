import type { AutomationModule, EnterpriseAction, EnterpriseActionStatus } from "../types";
export declare function enterpriseAction(partial: Omit<EnterpriseAction, "id" | "status"> & {
    status?: EnterpriseActionStatus;
}): EnterpriseAction;
export declare function priorityScore(factors: {
    safety?: number;
    compliance?: number;
    readiness?: number;
    operational?: number;
    cost?: number;
    risk?: number;
}): number;
export declare function mapModuleActions(module: AutomationModule, phase: string, items: {
    type: string;
    title: string;
    reason: string;
    entityType: string;
    entityId: string;
    targetId?: string;
    priority?: number;
}[]): EnterpriseAction[];
//# sourceMappingURL=actions.d.ts.map