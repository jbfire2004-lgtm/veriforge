import type { BrainContextInput, ContextSnapshot } from "../types";
import type { ingestAllPhases } from "../integrations/phase-integration";
export declare class EnterpriseContextEngine {
    snapshot(ctx: BrainContextInput, phases: ReturnType<typeof ingestAllPhases>): ContextSnapshot;
}
//# sourceMappingURL=enterprise-context.d.ts.map