"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentAssignmentEngine = void 0;
class EquipmentAssignmentEngine {
    validate(input) {
        var _a;
        const failures = [];
        const minScore = (_a = input.minConditionScore) !== null && _a !== void 0 ? _a : 50;
        if (!input.hasAuthorization) {
            failures.push('Worker lacks equipment authorization');
        }
        if (input.authorizationExpired) {
            failures.push('Equipment authorization expired');
        }
        if (!input.certificationValid) {
            failures.push('Equipment certification expired or missing');
        }
        if (!input.inspectionCurrent) {
            failures.push('Required equipment inspection overdue');
        }
        if (input.conditionScore < minScore) {
            failures.push(`Equipment condition score ${input.conditionScore} below threshold ${minScore}`);
        }
        if (input.underLoto) {
            failures.push('Equipment is under active lockout/tagout');
        }
        return { allowed: failures.length === 0, failures };
    }
}
exports.EquipmentAssignmentEngine = EquipmentAssignmentEngine;
//# sourceMappingURL=equipment-assignment.engine.js.map