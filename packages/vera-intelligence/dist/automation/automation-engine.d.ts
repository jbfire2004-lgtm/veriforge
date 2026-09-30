import type { IntelligenceModule } from "../types";
export type AutomationTaskType = "notification" | "reminder" | "lockout" | "assignment" | "escalation" | "correction" | "tagging" | "cleanup" | "sync" | "retry";
export type AutomationTask = {
    id: string;
    type: AutomationTaskType;
    module: IntelligenceModule;
    title: string;
    payload: Record<string, unknown>;
    scheduledAt: string;
    status: "pending" | "running" | "completed" | "failed";
    retries: number;
};
export type AutomationRule = {
    id: string;
    type: AutomationTaskType;
    module: IntelligenceModule;
    condition: (ctx: Record<string, unknown>) => boolean;
    build: (ctx: Record<string, unknown>) => Omit<AutomationTask, "id" | "status" | "retries" | "scheduledAt">;
};
export declare class AutomationEngine {
    private tasks;
    private rules;
    registerRule(rule: AutomationRule): void;
    registerDefaultRules(): void;
    evaluate(ctx: Record<string, unknown>): AutomationTask[];
    getPending(): AutomationTask[];
    markComplete(id: string): void;
    getAll(): AutomationTask[];
}
//# sourceMappingURL=automation-engine.d.ts.map