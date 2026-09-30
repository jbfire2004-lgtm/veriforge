"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineCivilizationEngine = void 0;
class OfflineCivilizationEngine {
    constructor() {
        this.queue = [];
    }
    enqueue(ctx) {
        const id = `civ-offline-${Date.now()}`;
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
exports.OfflineCivilizationEngine = OfflineCivilizationEngine;
//# sourceMappingURL=offline-civilization.js.map