"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessDecisionEngine = void 0;
class AccessDecisionEngine {
    decide(input) {
        if (input.hasActiveOverride) {
            return {
                decision: 'granted',
                denialReasons: [],
                checks: Object.assign(Object.assign({}, input.checks), { overrideApplied: true }),
            };
        }
        if (input.denialReasons.length === 0) {
            return {
                decision: 'granted',
                denialReasons: [],
                checks: input.checks,
            };
        }
        const safetyOverrideNeeded = input.zoneHighRisk &&
            input.denialReasons.some((r) => /sif|critical|high-risk|confined|hot work/i.test(r));
        if (safetyOverrideNeeded) {
            return {
                decision: 'requires_safety_override',
                denialReasons: input.denialReasons,
                checks: input.checks,
            };
        }
        const supervisorOverrideOk = input.denialReasons.every((r) => /training|flha|orientation|meeting|policy|sds/i.test(r));
        if (supervisorOverrideOk && input.denialReasons.length <= 3) {
            return {
                decision: 'requires_supervisor_override',
                denialReasons: input.denialReasons,
                checks: input.checks,
            };
        }
        return {
            decision: input.denialReasons.length === 1 ? 'denied_with_reason' : 'denied',
            denialReasons: input.denialReasons,
            checks: input.checks,
        };
    }
}
exports.AccessDecisionEngine = AccessDecisionEngine;
//# sourceMappingURL=access-decision.engine.js.map