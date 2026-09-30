import type { SimulationContext, ValidationIssue, WorkflowDefinition, WorkflowTransition } from "../types";
import { ComplianceValidator } from "./compliance-validator";
import { ConflictValidator } from "./conflict-validator";
import { PermissionValidator } from "./permission-validator";
import { StepValidator } from "./step-validator";
import { SyncValidator } from "./sync-validator";
export declare class WorkflowValidator {
    private stepValidator;
    private permissionValidator;
    private complianceValidator;
    private syncValidator;
    private conflictValidator;
    validateDefinition(workflow: WorkflowDefinition): ValidationIssue[];
    validateTransition(workflow: WorkflowDefinition, transition: WorkflowTransition, ctx: SimulationContext): ValidationIssue[];
    validateRun(workflow: WorkflowDefinition, visitedStates: string[], executedSteps: string[], ctx: SimulationContext): ValidationIssue[];
    validateAllDefinitions(workflows: WorkflowDefinition[]): ValidationIssue[];
    get step(): StepValidator;
    get permission(): PermissionValidator;
    get compliance(): ComplianceValidator;
    get sync(): SyncValidator;
    get conflict(): ConflictValidator;
    private computeReachable;
}
//# sourceMappingURL=workflow-validator.d.ts.map