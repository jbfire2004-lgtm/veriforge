import type { SimulationContext, SimulationEvent, ValidationIssue } from "../types";
export type ConflictServerState = {
    projectStatus?: string;
    lockedOut?: boolean;
    workerAssigned?: boolean;
    trainingExpired?: boolean;
};
export declare class ConflictValidator {
    evaluate(event: SimulationEvent, ctx: SimulationContext, serverState?: ConflictServerState): ValidationIssue[];
    private inferServerState;
}
//# sourceMappingURL=conflict-validator.d.ts.map