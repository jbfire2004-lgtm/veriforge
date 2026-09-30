"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseSimulationEngine = void 0;
class EnterpriseSimulationEngine {
    run(ctx) {
        const scenarios = [];
        let idx = 0;
        const add = (name, outcome, riskDelta, recommendedAction) => {
            scenarios.push({
                id: `sim-${idx++}`,
                name,
                outcome,
                riskDelta,
                recommendedAction,
            });
        };
        add("Remove 2 workers from Project A", "Project A readiness drops 25%; Project B improves 10%", 15, "Do not remove — backfill instead");
        add("Delay training renewals 30 days", "Compliance failures increase 40%", 35, "Accelerate training schedule");
        add("Equipment failure on crane", "Project delay 3 days; lockout cascade", 50, "Pre-stage substitute equipment");
        if ((ctx.sifPrecursors ?? 0) > 0) {
            add("Ignore SIF precursor", "Incident probability rises 3x", 60, "Apply immediate controls");
        }
        add("Union hall surge dispatch", "Staffing gaps close in 48h; overtime +12%", -10, "Execute optimized dispatch plan");
        return scenarios;
    }
}
exports.EnterpriseSimulationEngine = EnterpriseSimulationEngine;
//# sourceMappingURL=enterprise-simulation.js.map