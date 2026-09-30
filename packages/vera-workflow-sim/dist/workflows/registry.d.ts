import type { LifecycleCategory, WorkflowDefinition } from "../types";
export declare const ALL_WORKFLOWS: WorkflowDefinition[];
export declare const WORKFLOW_BY_ID: Record<string, WorkflowDefinition>;
export declare function getWorkflow(id: string): WorkflowDefinition | undefined;
export declare function workflowsByCategory(category: LifecycleCategory): WorkflowDefinition[];
//# sourceMappingURL=registry.d.ts.map