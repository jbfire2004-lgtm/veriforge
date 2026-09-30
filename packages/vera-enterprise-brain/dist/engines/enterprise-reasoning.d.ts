import type { BrainContextInput, ReasoningResult } from "../types";
import type { ingestAllPhases } from "../integrations/phase-integration";
export declare class EnterpriseReasoningEngine {
    reason(ctx: BrainContextInput, phases: ReturnType<typeof ingestAllPhases>): ReasoningResult;
}
//# sourceMappingURL=enterprise-reasoning.d.ts.map