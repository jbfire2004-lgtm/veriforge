"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineEnterpriseEngine = void 0;
class OfflineEnterpriseEngine {
    constructor() {
        this.queue = [];
    }
    enqueue(ctx) {
        const id = `ent-offline-${Date.now()}`;
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
exports.OfflineEnterpriseEngine = OfflineEnterpriseEngine;
//# sourceMappingURL=offline-enterprise.js.map