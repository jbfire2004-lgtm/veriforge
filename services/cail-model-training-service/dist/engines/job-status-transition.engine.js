"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobStatusTransitionEngine = exports.JobStatusTransitionEngine = void 0;
const errors_1 = require("../utils/errors");
const TRANSITIONS = {
    queued: ['running', 'failed'],
    running: ['completed', 'failed'],
    completed: [],
    failed: ['queued'],
};
class JobStatusTransitionEngine {
    canTransition(from, to) {
        return TRANSITIONS[from]?.includes(to) ?? false;
    }
    assertTransition(from, to) {
        if (!this.canTransition(from, to)) {
            throw new errors_1.BadRequestError(`Invalid status transition from ${from} to ${to}`);
        }
    }
    allowedNext(from) {
        return TRANSITIONS[from] ?? [];
    }
}
exports.JobStatusTransitionEngine = JobStatusTransitionEngine;
exports.jobStatusTransitionEngine = new JobStatusTransitionEngine();
