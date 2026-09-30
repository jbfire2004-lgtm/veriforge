"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceValidator = void 0;
const DEFAULT_FLAGS = {
    "training.valid": true,
    "competency.valid": true,
    "inspection.pass": true,
    "inspection.fail": false,
    "csa.valid": true,
    "ohs.valid": true,
    "provider.approved": true,
    "provider.reviewed": true,
    "project.readiness": true,
};
class ComplianceValidator {
    evaluateGuards(guards, ctx) {
        if (!guards?.length)
            return [];
        const flags = { ...DEFAULT_FLAGS, ...ctx.complianceFlags };
        const issues = [];
        for (const guard of guards) {
            if (!flags[guard]) {
                issues.push({
                    code: "COMPLIANCE_GUARD_FAIL",
                    message: `Compliance guard failed: ${guard}`,
                    severity: "error",
                    validator: "ComplianceValidator",
                });
            }
        }
        return issues;
    }
    validateTransition(transition, ctx) {
        return this.evaluateGuards(transition.guards, ctx);
    }
    validateStepChecks(checks, ctx) {
        return this.evaluateGuards(checks, ctx);
    }
    detectGaps(workflowCategory, ctx) {
        const issues = [];
        const flags = { ...DEFAULT_FLAGS, ...ctx.complianceFlags };
        if (workflowCategory === "training" && !flags["provider.approved"]) {
            issues.push({
                code: "PROVIDER_NOT_APPROVED",
                message: "Training cannot be validated: provider not approved",
                severity: "error",
                validator: "ComplianceValidator",
            });
        }
        if (workflowCategory === "project" && !flags["project.readiness"]) {
            issues.push({
                code: "PROJECT_NOT_READY",
                message: "Project readiness check failed",
                severity: "error",
                validator: "ComplianceValidator",
            });
        }
        return issues;
    }
}
exports.ComplianceValidator = ComplianceValidator;
//# sourceMappingURL=compliance-validator.js.map