import type { AutomationSnapshot, CommandContextInput } from "../types";
import type { ingestRealtimePhases } from "../integrations/phase-realtime";
export declare class RealtimeAutomationEngine {
    snapshot(ctx: CommandContextInput, phases: ReturnType<typeof ingestRealtimePhases>): AutomationSnapshot;
}
//# sourceMappingURL=realtime-automation.d.ts.map