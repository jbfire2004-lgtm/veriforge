import type { SimulationContext, ValidationIssue, WorkflowDefinition } from "../types";
export declare class StepValidator {
    validate(workflow: WorkflowDefinition, executedStepIds: string[]): ValidationIssue[];
    validateStepCoverage(workflow: WorkflowDefinition, visitedStates: string[]): ValidationIssue[];
    validateOfflineStep(stepId: string, ctx: SimulationContext): ValidationIssue[];
}
//# sourceMappingURL=step-validator.d.ts.map