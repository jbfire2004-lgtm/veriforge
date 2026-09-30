"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineInterstellarEngine = void 0;
class OfflineInterstellarEngine {
    constructor() {
        this.queue = [];
    }
    enqueue(ctx) {
        const id = `is-offline-${Date.now()}`;
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
exports.OfflineInterstellarEngine = OfflineInterstellarEngine;
//# sourceMappingURL=offline-interstellar.js.map