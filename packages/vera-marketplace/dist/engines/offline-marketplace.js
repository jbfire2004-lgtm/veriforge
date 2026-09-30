"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineMarketplaceEngine = void 0;
class OfflineMarketplaceEngine {
    constructor() {
        this.queue = [];
    }
    enqueue(ctx) {
        const id = `mkt-offline-${Date.now()}`;
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
exports.OfflineMarketplaceEngine = OfflineMarketplaceEngine;
//# sourceMappingURL=offline-marketplace.js.map