import type { BrainContextInput, OptimizationResult } from "../types";
import type { ingestAllPhases } from "../integrations/phase-integration";
export declare class EnterpriseOptimizationEngine {
    optimize(ctx: BrainContextInput, phases: ReturnType<typeof ingestAllPhases>): OptimizationResult[];
}
//# sourceMappingURL=enterprise-optimization.d.ts.map