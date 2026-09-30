"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineEcosystemEngine = void 0;
class OfflineEcosystemEngine {
    constructor() {
        this.queue = [];
    }
    enqueue(ctx) {
        const id = `eco-offline-${Date.now()}`;
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
exports.OfflineEcosystemEngine = OfflineEcosystemEngine;
//# sourceMappingURL=offline-ecosystem.js.map