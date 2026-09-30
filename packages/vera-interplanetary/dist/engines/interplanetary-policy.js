"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterplanetaryPolicyEngine = void 0;
class InterplanetaryPolicyEngine {
    evaluate(ctx) {
        const sites = ctx.sites ?? [];
        const evaRisk = sites.some((s) => s.facilityType === "orbital_station" && (s.hazardScore ?? 0) > 50);
        const lifeSupportFail = sites.some((s) => !s.lifeSupportOk);
        const highRad = sites.some((s) => (s.radiationLevel ?? 0) > 60);
        return [
            { id: "ipol-eva-1", domain: "eva_safety", rule: "EVA hold when conjunction or radiation exceeds threshold", enforced: true, version: "1.0.0", violation: evaRisk },
            { id: "ipol-hab-1", domain: "habitat_safety", rule: "Habitat breach triggers shelter protocol", enforced: true, version: "1.0.0", violation: lifeSupportFail },
            { id: "ipol-rad-1", domain: "radiation", rule: "Crew dose limits enforced per body", enforced: true, version: "1.1.0", violation: highRad },
            { id: "ipol-ls-1", domain: "life_support", rule: "O2/CO2 reserves maintained at 72h minimum", enforced: true, version: "1.0.0" },
            { id: "ipol-robot-1", domain: "robotics", rule: "Human-robot EVA deconfliction required", enforced: true, version: "1.0.0" },
            { id: "ipol-res-1", domain: "resource_allocation", rule: "Cross-body logistics require comm window", enforced: true, version: "1.0.0" },
            { id: "ipol-emer-1", domain: "emergency", rule: "Autonomous emergency response without Earth ack", enforced: true, version: "2.0.0" },
            { id: "ipol-pp-1", domain: "planetary_protection", rule: "Forward contamination controls on all transfers", enforced: true, version: "1.0.0" },
            { id: "ipol-log-1", domain: "logistics", rule: "Cargo manifest signed before inter-body transfer", enforced: true, version: "1.0.0" },
        ];
    }
}
exports.InterplanetaryPolicyEngine = InterplanetaryPolicyEngine;
//# sourceMappingURL=interplanetary-policy.js.map