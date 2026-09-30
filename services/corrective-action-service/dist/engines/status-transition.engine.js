"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusTransitionEngine = exports.StatusTransitionEngine = void 0;
const TRANSITIONS = {
    draft: ['open', 'cancelled'],
    open: ['assigned', 'in_progress', 'cancelled'],
    assigned: ['in_progress', 'pending_verification', 'cancelled'],
    in_progress: ['pending_verification', 'cancelled'],
    pending_verification: ['verified', 'in_progress', 'cancelled'],
    verified: ['closed'],
    closed: [],
    cancelled: [],
};
class StatusTransitionEngine {
    canTransition(from, to) {
        return TRANSITIONS[from]?.includes(to) ?? false;
    }
    assertTransition(from, to) {
        if (!this.canTransition(from, to)) {
            throw new Error(`Invalid status transition: ${from} → ${to}`);
        }
    }
    allowedNext(from) {
        return TRANSITIONS[from] ?? [];
    }
}
exports.StatusTransitionEngine = StatusTransitionEngine;
exports.statusTransitionEngine = new StatusTransitionEngine();
