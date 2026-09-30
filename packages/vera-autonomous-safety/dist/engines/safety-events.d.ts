import type { SafetyContextInput } from "../types";
/** Maps domain safety events into analysis context updates */
export declare class SafetyEventEngine {
    applyEvent(ctx: SafetyContextInput, event: string, data?: Record<string, unknown>): SafetyContextInput;
}
//# sourceMappingURL=safety-events.d.ts.map