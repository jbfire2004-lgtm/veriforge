"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateModelEngine = void 0;
class StateModelEngine {
    constructor() {
        this.store = new Map();
    }
    key(type, id) {
        return `${type}:${id}`;
    }
    get(type, id) {
        return this.store.get(this.key(type, id));
    }
    set(twin) {
        twin.updatedAt = new Date().toISOString();
        this.store.set(this.key(twin.type, twin.id), twin);
        return twin;
    }
    list(type) {
        return [...this.store.values()].filter((t) => !type || t.type === type);
    }
    patch(type, id, partial) {
        const existing = this.get(type, id);
        if (!existing)
            return undefined;
        return this.set({ ...existing, ...partial });
    }
}
exports.StateModelEngine = StateModelEngine;
//# sourceMappingURL=state-model-engine.js.map