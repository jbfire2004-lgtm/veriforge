"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterstellarPolicyEngine = void 0;
class InterstellarPolicyEngine {
    evaluate(ctx) {
        const assets = ctx.assets ?? [];
        const lifeFail = assets.some((a) => !a.lifeSupportOk);
        const highRad = assets.some((a) => (a.radiationLevel ?? 0) > 70);
        return [
            { id: "ispol-safety-1", domain: "interstellar_safety", rule: "Critical habitat breach triggers autonomous shelter", enforced: true, version: "1.0.0", violation: lifeFail },
            { id: "ispol-cryo-1", domain: "cryosleep", rule: "Cryosleep rotation max 50 years per cycle", enforced: true, version: "1.0.0" },
            { id: "ispol-terra-1", domain: "terraforming", rule: "Terraforming stages require planetary protection review", enforced: true, version: "1.0.0" },
            { id: "ispol-rad-1", domain: "radiation", rule: "Crew dose limits per star system", enforced: true, version: "1.1.0", violation: highRad },
            { id: "ispol-robot-1", domain: "robotics", rule: "Von Neumann replication requires containment protocol", enforced: true, version: "1.0.0" },
            { id: "ispol-res-1", domain: "resource_allocation", rule: "Cross-system logistics require generational comm plan", enforced: true, version: "1.0.0" },
            { id: "ispol-emer-1", domain: "emergency", rule: "Autonomous emergency response without Earth ack", enforced: true, version: "2.0.0" },
            { id: "ispol-pp-1", domain: "planetary_protection", rule: "No forward contamination on habitable worlds", enforced: true, version: "1.0.0" },
            { id: "ispol-log-1", domain: "interstellar_logistics", rule: "Generation ship manifest signed before departure", enforced: true, version: "1.0.0" },
            { id: "ispol-sci-1", domain: "science", rule: "Scientific mission priorities preserved across generations", enforced: true, version: "1.0.0" },
        ];
    }
}
exports.InterstellarPolicyEngine = InterstellarPolicyEngine;
//# sourceMappingURL=interstellar-policy.js.map