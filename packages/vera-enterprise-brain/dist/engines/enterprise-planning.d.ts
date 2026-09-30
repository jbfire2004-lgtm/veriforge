import type { BrainContextInput, PlanningResult } from "../types";
import type { ingestAllPhases } from "../integrations/phase-integration";
export declare class EnterprisePlanningEngine {
    plan(ctx: BrainContextInput, phases: ReturnType<typeof ingestAllPhases>): PlanningResult;
}
//# sourceMappingURL=enterprise-planning.d.ts.map