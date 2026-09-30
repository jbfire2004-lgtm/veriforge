"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineSchedulingEngine = void 0;
class OfflineSchedulingEngine {
    constructor() {
        this.queue = [];
    }
    enqueue(ctx) {
        const id = `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        this.queue.push({ id, context: { ...ctx, offline: true }, queuedAt: new Date().toISOString() });
        return id;
    }
    drain() {
        const items = [...this.queue];
        this.queue = [];
        return items;
    }
    peek() {
        return [...this.queue];
    }
    applyReport(report) {
        return {
            ...report,
            context: { ...report.context, offline: false },
        };
    }
    detectConflicts(ctx) {
        const conflicts = [];
        const workers = ctx.workers ?? [];
        for (const w of workers) {
            if ((w.projectIds?.length ?? 0) > 1) {
                conflicts.push(`Offline: worker ${w.id} multi-project conflict`);
            }
        }
        return conflicts;
    }
}
exports.OfflineSchedulingEngine = OfflineSchedulingEngine;
//# sourceMappingURL=offline-scheduling.js.map