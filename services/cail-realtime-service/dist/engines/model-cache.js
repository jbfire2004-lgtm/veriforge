"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelCache = void 0;
const env_1 = require("../config/env");
const cache = new Map();
exports.modelCache = {
    key(modelId, version) {
        return `${modelId}:v${version}`;
    },
    get(modelId, version) {
        const entry = cache.get(this.key(modelId, version));
        if (!entry)
            return undefined;
        if (Date.now() - entry.loadedAt > env_1.env.modelCacheTtlMs) {
            cache.delete(this.key(modelId, version));
            return undefined;
        }
        return entry;
    },
    load(modelId, version) {
        const id = modelId ?? env_1.env.defaultModelId;
        const ver = version ?? env_1.env.defaultModelVersion;
        const existing = this.get(id, ver);
        if (existing)
            return existing;
        const entry = {
            modelId: id,
            version: ver,
            algorithm: 'deterministic_rules_v1',
            loadedAt: Date.now(),
        };
        cache.set(this.key(id, ver), entry);
        return entry;
    },
    clear() {
        cache.clear();
    },
    size() {
        return cache.size;
    },
};
