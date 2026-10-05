"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcurrencyPool = exports.TtlCache = void 0;
class TtlCache {
    constructor(defaultTtlMs, maxEntries = 500) {
        this.defaultTtlMs = defaultTtlMs;
        this.maxEntries = maxEntries;
        this.store = new Map();
    }
    get(key) {
        const hit = this.store.get(key);
        if (!hit)
            return undefined;
        if (Date.now() > hit.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return hit.value;
    }
    set(key, value, ttlMs = this.defaultTtlMs) {
        if (this.store.size >= this.maxEntries) {
            const oldest = this.store.keys().next().value;
            if (oldest != null)
                this.store.delete(oldest);
        }
        this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
    }
    delete(key) {
        this.store.delete(key);
    }
    deletePrefix(prefix) {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix))
                this.store.delete(key);
        }
    }
    async getOrSet(key, factory, ttlMs = this.defaultTtlMs) {
        const cached = this.get(key);
        if (cached !== undefined)
            return cached;
        const value = await factory();
        this.set(key, value, ttlMs);
        return value;
    }
}
exports.TtlCache = TtlCache;
class ConcurrencyPool {
    constructor(maxConcurrent) {
        this.maxConcurrent = maxConcurrent;
        this.active = 0;
        this.queue = [];
    }
    run(task) {
        return new Promise((resolve, reject) => {
            const start = () => {
                this.active += 1;
                task()
                    .then(resolve, reject)
                    .finally(() => {
                    this.active -= 1;
                    const next = this.queue.shift();
                    if (next)
                        next();
                });
            };
            if (this.active < this.maxConcurrent)
                start();
            else
                this.queue.push(start);
        });
    }
    get pending() {
        return this.queue.length;
    }
    get running() {
        return this.active;
    }
}
exports.ConcurrencyPool = ConcurrencyPool;
//# sourceMappingURL=ttl-cache.js.map