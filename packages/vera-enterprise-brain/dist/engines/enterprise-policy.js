"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterprisePolicyEngine = void 0;
const POLICIES = [
    { id: "pol-safety-001", name: "SIF zero tolerance", domain: "safety", version: "1.0.0" },
    { id: "pol-comp-001", name: "Training current required", domain: "compliance", version: "1.0.0" },
    { id: "pol-dispatch-001", name: "Single active dispatch", domain: "dispatch", version: "1.0.0" },
    { id: "pol-sched-001", name: "Minimum crew readiness", domain: "scheduling", version: "1.0.0" },
    { id: "pol-union-001", name: "Union hall dispatch priority", domain: "union", version: "1.0.0" },
];
class EnterprisePolicyEngine {
    evaluate(ctx) {
        return POLICIES.map((p) => {
            let violation;
            if (p.id === "pol-safety-001" && (ctx.sifPrecursors ?? 0) > 0) {
                violation = "SIF precursors active";
            }
            if (p.id === "pol-comp-001" && (ctx.nonCompliantWorkers ?? 0) > 0) {
                violation = "Non-compliant workers on assignment";
            }
            if (p.id === "pol-dispatch-001" && ctx.unionHallId && (ctx.schedulingShortages?.length ?? 0) > 0) {
                violation = "Dispatch pressure with shortages";
            }
            return {
                ...p,
                enforced: true,
                violation,
            };
        });
    }
}
exports.EnterprisePolicyEngine = EnterprisePolicyEngine;
//# sourceMappingURL=enterprise-policy.js.map