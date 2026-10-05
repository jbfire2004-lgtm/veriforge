"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailureWorkflowEngine = void 0;
const common_1 = require("@nestjs/common");
const TRANSITIONS = {
    reported: ['supervisor_review', 'locked_out'],
    supervisor_review: ['owner_review', 'locked_out', 'capa_open'],
    owner_review: ['capa_open', 'locked_out'],
    locked_out: ['capa_open'],
    capa_open: ['verified'],
    verified: ['closed'],
    closed: [],
};
class FailureWorkflowEngine {
    assertTransition(from, to) {
        var _a;
        const allowed = (_a = TRANSITIONS[from]) !== null && _a !== void 0 ? _a : [];
        if (!allowed.includes(to)) {
            throw new common_1.BadRequestException(`Invalid failure transition: ${from} → ${to}`);
        }
    }
    requiresSupervisorReview(severity) {
        return severity !== 'low';
    }
}
exports.FailureWorkflowEngine = FailureWorkflowEngine;
//# sourceMappingURL=failure-workflow.engine.js.map