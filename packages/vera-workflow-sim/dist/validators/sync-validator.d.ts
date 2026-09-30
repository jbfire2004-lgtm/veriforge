import type { SimulationContext, SimulationEvent, ValidationIssue } from "../types";
export declare class SyncValidator {
    validateOfflineTransition(event: SimulationEvent, ctx: SimulationContext): ValidationIssue[];
    validateQueueProcessing(events: SimulationEvent[]): ValidationIssue[];
    validateDelta(ctx: SimulationContext): ValidationIssue[];
}
//# sourceMappingURL=sync-validator.d.ts.map