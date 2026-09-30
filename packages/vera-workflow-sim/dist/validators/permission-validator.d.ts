import type { SimulationContext, ValidationIssue, WorkflowDefinition, WorkflowTransition } from "../types";
export declare class PermissionValidator {
    validateTransition(transition: WorkflowTransition, ctx: SimulationContext): ValidationIssue[];
    validateStepPermission(permissionKey: string, ctx: SimulationContext): ValidationIssue[];
    validateWorkflowAccess(workflow: WorkflowDefinition, ctx: SimulationContext): ValidationIssue[];
    private hasImplicitElevated;
}
//# sourceMappingURL=permission-validator.d.ts.map