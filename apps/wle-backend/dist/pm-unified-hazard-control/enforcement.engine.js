"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnforcementEngine = void 0;
class EnforcementEngine {
    evaluate(input) {
        const blockers = [];
        const waived = [];
        const actions = [];
        if (input.emergencyLocked) {
            blockers.push('Emergency lock active');
            actions.push('block_worker', 'block_task', 'block_zone');
        }
        if (input.unmappedPublishedHazards > 0) {
            if (this.waived(input, 'hazard', 'MAPPING'))
                waived.push('mapping');
            else {
                blockers.push(`${input.unmappedPublishedHazards} published hazard(s) without controls`);
                actions.push('block_task');
            }
        }
        if (input.sdsAckRequired && !input.sdsAcknowledged) {
            if (this.waived(input, 'sds', 'ACK'))
                waived.push('sds');
            else {
                blockers.push('SDS acknowledgment required for chemical hazards');
                actions.push('block_zone', 'block_worker');
            }
        }
        if (!input.trainingComplete) {
            blockers.push('Required hazard training incomplete');
            actions.push('block_worker', 'block_task');
        }
        if (!input.controlsVerified) {
            blockers.push('Required controls not verified');
            actions.push('block_task', 'block_equipment');
        }
        return {
            allowed: blockers.length === 0,
            blockers,
            waived,
            actions,
        };
    }
    waived(input, type, key) {
        return input.activeOverrides.some((o) => o.ruleType === type && o.ruleKey === key);
    }
}
exports.EnforcementEngine = EnforcementEngine;
//# sourceMappingURL=enforcement.engine.js.map