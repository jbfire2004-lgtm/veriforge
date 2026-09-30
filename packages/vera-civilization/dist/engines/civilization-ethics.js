"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CivilizationEthicsEngine = void 0;
const scoring_1 = require("../utils/scoring");
class CivilizationEthicsEngine {
    evaluate(ctx) {
        const risk = ctx.interstellarRiskScore ?? 30;
        const integrity = ctx.missionIntegrity ?? 80;
        const rules = [
            { id: "eth-rights", framework: "universal_rights", rule: "Protect conscious life and autonomy", priority: 1 },
            { id: "eth-ai", framework: "ai_alignment", rule: "AI actions must be auditable and reversible", priority: 1 },
            { id: "eth-species", framework: "multi_species", rule: "No species may be subordinated without consent", priority: 2 },
            { id: "eth-colony", framework: "colonization", rule: "Colonization requires ecosystem impact review", priority: 2, violation: risk > 70 },
            { id: "eth-terra", framework: "terraforming", rule: "Terraforming must preserve native biochemistry where present", priority: 2 },
            { id: "eth-mine", framework: "resource", rule: "Extract only replenishable or necessary resources", priority: 3 },
            { id: "eth-robot", framework: "robotics", rule: "Robotics must not displace essential human agency", priority: 3 },
            { id: "eth-sci", framework: "science", rule: "Scientific missions require ethics board sign-off", priority: 3 },
        ];
        const violations = rules.filter((r) => r.violation).length;
        const alignmentScore = (0, scoring_1.clamp)(integrity - violations * 12 - risk * 0.3);
        return {
            rules,
            alignmentScore,
            overrides: risk > 75 ? ["Ethical override: halt high-risk autonomous expansion"] : [],
            recommendations: [
                alignmentScore < 70 ? "Convene civilization ethics review" : "Maintain ethical alignment posture",
                "Log all governance decisions to ethical memory",
            ],
        };
    }
}
exports.CivilizationEthicsEngine = CivilizationEthicsEngine;
//# sourceMappingURL=civilization-ethics.js.map