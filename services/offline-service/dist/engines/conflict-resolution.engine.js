"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conflictResolutionEngine = exports.ConflictResolutionEngine = void 0;
class ConflictResolutionEngine {
    resolve(input) {
        if (input.strategy === 'prefer_local')
            return { ...input.localValue };
        if (input.strategy === 'prefer_server')
            return { ...input.serverValue };
        return {
            ...input.serverValue,
            ...input.localValue,
            ...(input.merge ?? {}),
        };
    }
    isConflictError(message) {
        if (!message)
            return false;
        return /conflict|version|duplicate|already exists|stale/i.test(message);
    }
}
exports.ConflictResolutionEngine = ConflictResolutionEngine;
exports.conflictResolutionEngine = new ConflictResolutionEngine();
