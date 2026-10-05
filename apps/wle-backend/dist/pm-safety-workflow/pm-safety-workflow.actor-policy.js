"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertActorMayPerformAction = assertActorMayPerformAction;
const common_1 = require("@nestjs/common");
const pm_safety_workflow_errors_1 = require("./pm-safety-workflow.errors");
function assertActorMayPerformAction(action, role) {
    if (role === 'ADMIN') {
        return;
    }
    const isSupervisor = role === 'SUPERVISOR';
    const isPm = role === 'PROJECT_MANAGER';
    const isWorker = role === 'WORKER';
    let allowed = false;
    switch (action) {
        case 'submit':
        case 'revise':
            allowed = isPm || isWorker;
            break;
        case 'close':
            allowed = isPm || isSupervisor;
            break;
        case 'cancel':
            allowed = isPm || isSupervisor;
            break;
        case 'start_review':
        case 'approve':
        case 'reject':
            allowed = isSupervisor;
            break;
        default:
            allowed = false;
    }
    if (!allowed) {
        throw new common_1.ForbiddenException({
            code: pm_safety_workflow_errors_1.PM_SAFETY_ERROR.ACTOR_FORBIDDEN,
            message: `Role ${role} is not permitted to perform action "${action}"`,
            action,
            role,
        });
    }
}
//# sourceMappingURL=pm-safety-workflow.actor-policy.js.map