"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapaEnforcementEngine = void 0;
class CapaEnforcementEngine {
    evaluate(input) {
        const blockers = [];
        const waived = [];
        const blocks = {
            workerAccess: false,
            equipmentAccess: false,
            zoneAccess: false,
            taskStart: false,
            permitApproval: false,
            jhaApproval: false,
            pmScheduling: false,
        };
        if (input.emergencyActive) {
            blockers.push('Emergency event active — CAPA enforcement suspended for access');
            return { allowed: false, blockers, waived, blocks };
        }
        if (input.workerOverdue > 0) {
            if (this.waived(input, 'worker', 'OVERDUE'))
                waived.push('worker_overdue');
            else {
                blockers.push(`${input.workerOverdue} overdue corrective action(s) for worker`);
                blocks.workerAccess = true;
                blocks.zoneAccess = true;
                blocks.taskStart = true;
                blocks.pmScheduling = true;
            }
        }
        if (input.workerCritical > 0) {
            if (this.waived(input, 'worker', 'CRITICAL'))
                waived.push('worker_critical');
            else {
                blockers.push(`${input.workerCritical} critical open corrective action(s)`);
                blocks.workerAccess = true;
                blocks.jhaApproval = true;
                blocks.permitApproval = true;
            }
        }
        if (input.equipmentOpen > 0) {
            blockers.push(`${input.equipmentOpen} unresolved equipment corrective action(s)`);
            blocks.equipmentAccess = true;
        }
        if (input.projectCriticalOpen > 0) {
            blockers.push(`${input.projectCriticalOpen} project-critical corrective actions open`);
            blocks.taskStart = true;
            blocks.pmScheduling = true;
            blocks.permitApproval = true;
        }
        return {
            allowed: blockers.length === 0,
            blockers,
            waived,
            blocks,
        };
    }
    waived(input, type, key) {
        return input.activeOverrides.some((o) => o.ruleType === type && o.ruleKey === key);
    }
}
exports.CapaEnforcementEngine = CapaEnforcementEngine;
//# sourceMappingURL=capa-enforcement.engine.js.map