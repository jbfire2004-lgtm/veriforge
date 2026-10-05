"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnforcementEngine = void 0;
class EnforcementEngine {
    evaluate(input) {
        var _a, _b;
        const violations = [];
        const waived = [];
        if (!input.profilePublished) {
            violations.push('Project safety profile not published');
        }
        const rules = input.enforcementRules;
        const checks = (_a = input.workerChecks) !== null && _a !== void 0 ? _a : {};
        if (rules.blockAccessWithoutFlha && checks.flha === false) {
            if (this.hasOverride(input, 'training', 'FLHA')) {
                waived.push('FLHA');
            }
            else {
                violations.push('FLHA required by project profile');
            }
        }
        if (rules.blockAccessWithoutOrientation && checks.orientation === false) {
            if (this.hasOverride(input, 'training', 'ORIENTATION')) {
                waived.push('ORIENTATION');
            }
            else {
                violations.push('Site orientation required');
            }
        }
        if (input.riskLevel === 'critical' && checks.jha === false) {
            if (this.hasOverride(input, 'zone', (_b = input.zoneCode) !== null && _b !== void 0 ? _b : 'SITE')) {
                waived.push('JHA_ZONE');
            }
            else {
                violations.push('JHA required for critical-risk project');
            }
        }
        return {
            enforced: violations.length === 0,
            violations,
            waivedByOverride: waived,
        };
    }
    hasOverride(input, ruleType, ruleKey) {
        var _a;
        return ((_a = input.activeOverrides) !== null && _a !== void 0 ? _a : []).some((o) => o.ruleType === ruleType && o.ruleKey === ruleKey);
    }
}
exports.EnforcementEngine = EnforcementEngine;
//# sourceMappingURL=enforcement.engine.js.map