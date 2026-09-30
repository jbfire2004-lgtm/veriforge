import type { SimulationContext, ValidationIssue, WorkflowTransition } from "../types";
export declare class ComplianceValidator {
    evaluateGuards(guards: string[] | undefined, ctx: SimulationContext): ValidationIssue[];
    validateTransition(transition: WorkflowTransition, ctx: SimulationContext): ValidationIssue[];
    validateStepChecks(checks: string[] | undefined, ctx: SimulationContext): ValidationIssue[];
    detectGaps(workflowCategory: string, ctx: SimulationContext): ValidationIssue[];
}
//# sourceMappingURL=compliance-validator.d.ts.map