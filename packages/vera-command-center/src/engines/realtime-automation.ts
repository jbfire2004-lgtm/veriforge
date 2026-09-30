import type { AutomationSnapshot, CommandContextInput } from "../types";
import type { ingestRealtimePhases } from "../integrations/phase-realtime";

export class RealtimeAutomationEngine {
  snapshot(
    ctx: CommandContextInput,
    phases: ReturnType<typeof ingestRealtimePhases>
  ): AutomationSnapshot {
    const log = phases.enterprise.execution.log;
    return {
      executed: phases.enterprise.execution.executed.length,
      queued: phases.enterprise.execution.queued.length,
      overridden: phases.enterprise.overrides.length,
      failed: phases.enterprise.execution.failed.length,
      synced: ctx.offline ? 0 : phases.enterprise.execution.executed.length,
      recent: log.slice(0, 8).map((a) => ({
        id: a.id,
        title: a.title,
        status: a.status,
      })),
    };
  }
}
