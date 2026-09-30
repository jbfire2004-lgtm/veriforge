"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutonomousExecutionEngine = void 0;
class AutonomousExecutionEngine {
    execute(ctx, actions) {
        const executed = [];
        const queued = [];
        const failed = [];
        const log = [];
        const now = new Date().toISOString();
        for (const action of actions) {
            const copy = { ...action };
            if (ctx.offline) {
                copy.status = "queued";
                queued.push(copy);
                log.push({ ...copy, executedAt: now });
                continue;
            }
            if (ctx.autoExecute === false) {
                copy.status = "pending";
                log.push(copy);
                continue;
            }
            try {
                copy.status = "executed";
                copy.executedAt = now;
                executed.push(copy);
                log.push(copy);
            }
            catch {
                copy.status = "failed";
                failed.push(copy);
                log.push(copy);
            }
        }
        return { executed, queued, failed, log };
    }
    rollback(action, reason) {
        return {
            ...action,
            status: "rolled_back",
            metadata: { ...action.metadata, rollbackReason: reason },
            executedAt: new Date().toISOString(),
        };
    }
    override(action, reason) {
        return {
            ...action,
            status: "overridden",
            metadata: { ...action.metadata, overrideReason: reason },
            executedAt: new Date().toISOString(),
        };
    }
}
exports.AutonomousExecutionEngine = AutonomousExecutionEngine;
//# sourceMappingURL=autonomous-execution.js.map