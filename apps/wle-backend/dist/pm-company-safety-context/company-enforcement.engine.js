"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyEnforcementEngine = void 0;
class CompanyEnforcementEngine {
    evaluate(input) {
        const violations = [];
        const waived = [];
        if (!input.profilePublished) {
            violations.push('Company safety profile not published');
        }
        const rules = input.enforcementRules;
        if (rules.blockAccessWithoutOrientation &&
            input.workerChecks.orientation === false) {
            if (this.waived(input, 'training', 'ORIENTATION'))
                waived.push('ORIENTATION');
            else
                violations.push('Company orientation required');
        }
        if (rules.blockAccessWithoutPolicyAck && input.missingPolicyAcks > 0) {
            if (this.waived(input, 'policy', 'REQUIRED'))
                waived.push('POLICY');
            else
                violations.push(`${input.missingPolicyAcks} required policy acknowledgment(s) missing`);
        }
        for (const code of input.missingTraining) {
            if (this.waived(input, 'training', code))
                waived.push(code);
            else
                violations.push(`Missing training: ${code}`);
        }
        if (input.expiredSds > 0) {
            violations.push(`${input.expiredSds} expired SDS document(s)`);
        }
        if (input.corporateRiskLevel === 'critical' &&
            input.workerChecks.sif === false) {
            if (this.waived(input, 'zone', 'SIF'))
                waived.push('SIF');
            else
                violations.push('SIF clearance required for critical-risk company');
        }
        let action = 'block_access';
        if (violations.length === 0)
            action = 'block_access';
        else if (violations.every((v) => v.includes('training') || v.includes('orientation')) &&
            rules.requireSupervisorOverrideOnTrainingGap) {
            action = 'supervisor_override';
        }
        else if (input.corporateRiskLevel === 'critical' &&
            rules.requireSafetyOverrideOnSif) {
            action = 'safety_override';
        }
        else if (violations.length > 2 && rules.autoCapaOnRepeatDenial) {
            action = 'auto_capa';
        }
        return {
            allowed: violations.length === 0,
            action,
            violations,
            waived,
        };
    }
    waived(input, type, key) {
        return input.activeOverrides.some((o) => o.overrideType === type && o.ruleKey === key);
    }
}
exports.CompanyEnforcementEngine = CompanyEnforcementEngine;
//# sourceMappingURL=company-enforcement.engine.js.map