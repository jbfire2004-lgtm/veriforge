"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeAutomationEngine = void 0;
class RealtimeAutomationEngine {
    snapshot(ctx, phases) {
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
exports.RealtimeAutomationEngine = RealtimeAutomationEngine;
//# sourceMappingURL=realtime-automation.js.map