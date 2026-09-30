"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeSyncEngine = void 0;
class RealTimeSyncEngine {
    constructor() {
        this.subscribers = new Map();
    }
    subscribe(type, id, fn) {
        const key = `${type}:${id}`;
        if (!this.subscribers.has(key))
            this.subscribers.set(key, new Set());
        this.subscribers.get(key).add(fn);
        return () => this.subscribers.get(key)?.delete(fn);
    }
    publish(twin) {
        const key = `${twin.type}:${twin.id}`;
        this.subscribers.get(key)?.forEach((fn) => fn(twin));
        this.subscribers.get(`${twin.type}:*`)?.forEach((fn) => fn(twin));
    }
}
exports.RealTimeSyncEngine = RealTimeSyncEngine;
//# sourceMappingURL=sync-engine.js.map