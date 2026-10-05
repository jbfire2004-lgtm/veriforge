"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LotoWorkflowEngine = void 0;
const common_1 = require("@nestjs/common");
const TRANSITIONS = {
    active: ['verified', 'cancelled'],
    verified: ['removed', 'cancelled'],
    removed: [],
    cancelled: [],
};
class LotoWorkflowEngine {
    assertTransition(from, to) {
        var _a;
        const allowed = (_a = TRANSITIONS[from]) !== null && _a !== void 0 ? _a : [];
        if (!allowed.includes(to)) {
            throw new common_1.BadRequestException(`Invalid LOTO transition: ${from} → ${to}`);
        }
    }
}
exports.LotoWorkflowEngine = LotoWorkflowEngine;
//# sourceMappingURL=loto-workflow.engine.js.map