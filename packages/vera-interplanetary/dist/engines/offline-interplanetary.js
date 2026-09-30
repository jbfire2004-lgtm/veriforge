"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineInterplanetaryEngine = void 0;
class OfflineInterplanetaryEngine {
    constructor() {
        this.queue = [];
    }
    enqueue(ctx) {
        const id = `ip-offline-${Date.now()}`;
        this.queue.push({ id, context: { ...ctx, offline: true }, queuedAt: new Date().toISOString() });
        return id;
    }
    drain() {
        const items = [...this.queue];
        this.queue = [];
        return items;
    }
    markSynced(report) {
        return { ...report, context: { ...report.context, offline: false } };
    }
}
exports.OfflineInterplanetaryEngine = OfflineInterplanetaryEngine;
//# sourceMappingURL=offline-interplanetary.js.map