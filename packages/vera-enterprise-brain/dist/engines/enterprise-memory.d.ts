import type { BrainContextInput, MemoryEntry } from "../types";
import type { ingestAllPhases } from "../integrations/phase-integration";
export declare class EnterpriseMemoryEngine {
    private longTerm;
    recall(ctx: BrainContextInput, phases: ReturnType<typeof ingestAllPhases>): MemoryEntry[];
}
//# sourceMappingURL=enterprise-memory.d.ts.map