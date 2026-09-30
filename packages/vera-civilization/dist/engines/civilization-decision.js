"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CivilizationDecisionEngine = void 0;
let decId = 0;
class CivilizationDecisionEngine {
    decide(ctx, ethics, stability) {
        const decisions = [];
        const add = (kind, title, rationale, executed) => {
            decId += 1;
            decisions.push({ id: `cdec-${decId}`, kind, title, rationale, executed });
        };
        add("strategic", "Century growth plan", "Optimize expansion vs sustainability", true);
        add("consensus", "Multi-planet resource treaty", "Quorum reached across scopes", stability.stabilityScore > 60);
        add("autonomous", "Logistics reroute", "Autonomous interstellar supply rebalance", true);
        if (ethics.overrides.length) {
            add("ethical_override", "Halt unsafe expansion", ethics.overrides[0], true);
        }
        if (stability.stabilityScore < 55) {
            add("emergency", "Stability emergency protocol", "Stability below threshold", true);
        }
        add("assisted", "Terraforming phase gate", "Human-in-loop approval for stage 3+", false);
        return decisions;
    }
}
exports.CivilizationDecisionEngine = CivilizationDecisionEngine;
//# sourceMappingURL=civilization-decision.js.map