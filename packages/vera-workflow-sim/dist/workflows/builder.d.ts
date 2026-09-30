import type { LifecycleCategory, WorkflowDefinition, WorkflowStepDef, WorkflowTransition } from "../types";
type BuildInput = {
    id: string;
    title: string;
    category: LifecycleCategory;
    description?: string;
    initialState: string;
    terminalStates: string[];
    steps: WorkflowStepDef[];
    transitions: WorkflowTransition[];
    modules: string[];
};
export declare function buildWorkflow(input: BuildInput): WorkflowDefinition;
export {};
//# sourceMappingURL=builder.d.ts.map