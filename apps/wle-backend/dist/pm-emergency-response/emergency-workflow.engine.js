"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmergencyWorkflowEngine = void 0;
const common_1 = require("@nestjs/common");
const PLAN_TRANSITIONS = {
    draft: ['review', 'archived'],
    review: ['approved', 'draft', 'archived'],
    approved: ['published', 'review', 'archived'],
    published: ['archived'],
    archived: [],
};
const EVENT_TRANSITIONS = {
    declared: ['active', 'muster_in_progress', 'cancelled'],
    active: ['muster_in_progress', 'evacuation_in_progress', 'cancelled'],
    muster_in_progress: [
        'evacuation_in_progress',
        'supervisor_review',
        'all_clear',
    ],
    evacuation_in_progress: ['supervisor_review', 'all_clear'],
    supervisor_review: ['all_clear', 'closed'],
    all_clear: ['closed'],
    closed: [],
    cancelled: [],
};
class EmergencyWorkflowEngine {
    assertPlanTransition(from, to) {
        var _a;
        const allowed = (_a = PLAN_TRANSITIONS[from]) !== null && _a !== void 0 ? _a : [];
        if (!allowed.includes(to)) {
            throw new common_1.BadRequestException(`Invalid plan transition: ${from} → ${to}`);
        }
    }
    assertEventTransition(from, to) {
        var _a;
        const allowed = (_a = EVENT_TRANSITIONS[from]) !== null && _a !== void 0 ? _a : [];
        if (!allowed.includes(to)) {
            throw new common_1.BadRequestException(`Invalid event transition: ${from} → ${to}`);
        }
    }
}
exports.EmergencyWorkflowEngine = EmergencyWorkflowEngine;
//# sourceMappingURL=emergency-workflow.engine.js.map