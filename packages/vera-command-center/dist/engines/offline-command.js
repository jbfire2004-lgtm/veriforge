"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineCommandEngine = void 0;
class OfflineCommandEngine {
    constructor() {
        this.queue = [];
    }
    enqueue(ctx) {
        const id = `cc-offline-${Date.now()}`;
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
exports.OfflineCommandEngine = OfflineCommandEngine;
//# sourceMappingURL=offline-command.js.map