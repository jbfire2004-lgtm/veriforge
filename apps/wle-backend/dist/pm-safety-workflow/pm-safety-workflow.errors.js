"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PM_SAFETY_ERROR = void 0;
exports.pmSafetyInvalidTransition = pmSafetyInvalidTransition;
const common_1 = require("@nestjs/common");
const pm_safety_workflow_types_1 = require("./pm-safety-workflow.types");
exports.PM_SAFETY_ERROR = {
    INVALID_TRANSITION: 'PM_SAFETY_INVALID_TRANSITION',
    ACTOR_FORBIDDEN: 'PM_SAFETY_ACTOR_FORBIDDEN',
};
function pmSafetyInvalidTransition(params) {
    const allowedActions = (0, pm_safety_workflow_types_1.transitionActionsFrom)(params.status);
    return new common_1.BadRequestException({
        code: exports.PM_SAFETY_ERROR.INVALID_TRANSITION,
        message: `Transition "${params.action}" is not valid from status ${params.status}`,
        status: params.status,
        action: params.action,
        allowedActions,
    });
}
//# sourceMappingURL=pm-safety-workflow.errors.js.map