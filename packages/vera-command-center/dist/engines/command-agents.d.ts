import type { AgentInsight, CommandContextInput } from "../types";
import type { ingestRealtimePhases } from "../integrations/phase-realtime";
export declare class CommandAgentsEngine {
    run(ctx: CommandContextInput, phases: ReturnType<typeof ingestRealtimePhases>): AgentInsight[];
}
//# sourceMappingURL=command-agents.d.ts.map