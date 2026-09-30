import type { BrainContextInput, PredictionResult } from "../types";
import type { ingestAllPhases } from "../integrations/phase-integration";
export declare class EnterprisePredictionEngine {
    predict(ctx: BrainContextInput, phases: ReturnType<typeof ingestAllPhases>): PredictionResult[];
}
//# sourceMappingURL=enterprise-prediction.d.ts.map