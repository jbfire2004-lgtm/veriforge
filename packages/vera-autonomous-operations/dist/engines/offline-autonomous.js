"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineAutonomousEngine = void 0;
class OfflineAutonomousEngine {
    constructor() {
        this.queue = [];
    }
    enqueue(ctx) {
        const id = `offline-op-${Date.now()}`;
        this.queue.push({
            id,
            context: { ...ctx, offline: true },
            queuedAt: new Date().toISOString(),
        });
        return id;
    }
    drain() {
        const items = [...this.queue];
        this.queue = [];
        return items;
    }
    detectOfflineConflicts(ctx) {
        const conflicts = [];
        for (const w of ctx.workers ?? []) {
            if ((w.projectIds?.length ?? 0) > 1) {
                conflicts.push(`Offline: ${w.name} multi-project`);
            }
        }
        return conflicts;
    }
    markSynced(report) {
        return {
            ...report,
            context: { ...report.context, offline: false },
        };
    }
}
exports.OfflineAutonomousEngine = OfflineAutonomousEngine;
//# sourceMappingURL=offline-autonomous.js.map