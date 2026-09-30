import type { BrainContextInput, BrainDecision, PolicyRule, PredictionResult, ReasoningResult } from "../types";
import type { ingestAllPhases } from "../integrations/phase-integration";
export declare class EnterpriseDecisionEngine {
    decide(ctx: BrainContextInput, phases: ReturnType<typeof ingestAllPhases>, reasoning: ReasoningResult, predictions: PredictionResult[], policies: PolicyRule[]): BrainDecision[];
}
//# sourceMappingURL=enterprise-decision.d.ts.map