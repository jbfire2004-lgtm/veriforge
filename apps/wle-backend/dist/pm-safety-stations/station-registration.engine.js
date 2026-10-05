"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationRegistrationEngine = void 0;
class StationRegistrationEngine {
    validateRegistration(input) {
        var _a, _b;
        const errors = [];
        if (!((_a = input.name) === null || _a === void 0 ? void 0 : _a.trim()))
            errors.push('Station name required');
        if (!((_b = input.code) === null || _b === void 0 ? void 0 : _b.trim()))
            errors.push('Station code required');
        if (!input.companyId)
            errors.push('Company required');
        if (input.stationType === 'equipment' && !input.equipmentId) {
            errors.push('Equipment station requires equipmentId');
        }
        if (input.stationType === 'muster' && !input.zoneCode) {
            errors.push('Muster station requires muster point zoneCode');
        }
        return {
            valid: errors.length === 0,
            errors,
            nextStatus: errors.length === 0 ? 'pending' : 'pending',
        };
    }
    activationTransition(current, hasHardwareId, hasProject) {
        if (current === 'deactivated')
            return 'deactivated';
        if (!hasHardwareId || !hasProject)
            return 'pending';
        return 'active';
    }
    deactivationTransition() {
        return 'deactivated';
    }
}
exports.StationRegistrationEngine = StationRegistrationEngine;
//# sourceMappingURL=station-registration.engine.js.map