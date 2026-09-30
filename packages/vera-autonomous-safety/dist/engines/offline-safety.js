"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineSafetyEngine = void 0;
class OfflineSafetyEngine {
    constructor() {
        this.queue = [];
    }
    enqueue(ctx) {
        this.queue.push({ context: { ...ctx, offline: true }, queuedAt: new Date().toISOString() });
    }
    drain() {
        const items = [...this.queue];
        this.queue = [];
        return items;
    }
    applyReport(report) {
        return {
            ...report,
            context: { ...report.context, offline: false },
        };
    }
    getQueueLength() {
        return this.queue.length;
    }
}
exports.OfflineSafetyEngine = OfflineSafetyEngine;
//# sourceMappingURL=offline-safety.js.map