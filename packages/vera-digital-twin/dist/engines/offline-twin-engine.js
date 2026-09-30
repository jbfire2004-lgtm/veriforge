"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineTwinEngine = void 0;
class OfflineTwinEngine {
    constructor() {
        this.queue = [];
    }
    enqueue(event, clientVersion) {
        this.queue.push({ event, clientVersion });
    }
    applyPending(twin, updater, resolver) {
        let current = twin;
        let conflicts = 0;
        const pending = [...this.queue];
        this.queue = [];
        for (const item of pending) {
            if (resolver &&
                twin.offline.serverVersion != null &&
                item.clientVersion < twin.offline.serverVersion) {
                current = resolver(current, twin);
                conflicts++;
            }
            current = updater.apply(current, item.event);
        }
        return {
            twin: updater.apply(current, {
                name: "twin.synced",
                entityType: twin.type,
                entityId: twin.id,
                occurredAt: new Date().toISOString(),
            }),
            conflicts,
        };
    }
    getQueueLength() {
        return this.queue.length;
    }
}
exports.OfflineTwinEngine = OfflineTwinEngine;
//# sourceMappingURL=offline-twin-engine.js.map