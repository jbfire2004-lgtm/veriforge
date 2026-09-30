"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndustrySimulationEngine = void 0;
let simId = 0;
class IndustrySimulationEngine {
    run(ctx) {
        const p = ctx.participants ?? [];
        const workers = p.reduce((s, x) => s + (x.workerCount ?? 0), 0);
        const gaps = p.reduce((s, x) => s + (x.nonCompliantWorkers ?? 0), 0);
        const mk = (scenario, impact, recommendation) => {
            simId += 1;
            return { id: `sim-${simId}`, scenario, impact, recommendation };
        };
        return [
            mk("Workforce shortage shock", Math.min(100, gaps * 3), "Activate federated workforce pools"),
            mk("Equipment inspection cascade", p.reduce((s, x) => s + (x.inspectionFailures ?? 0), 0) * 5, "Surge maintenance across regions"),
            mk("Training expiry wave", p.reduce((s, x) => s + (x.expiringTraining ?? 0), 0) * 2, "Expand provider seat capacity"),
            mk("SIF incident cluster", p.reduce((s, x) => s + (x.sifForms ?? 0), 0) * 12, "Industry safety stand-down protocol"),
            mk("Compliance failure spike", gaps * 4, "Federated compliance campaign"),
            mk("Dispatch conflict surge", p.reduce((s, x) => s + (x.dispatchConflicts ?? 0), 0) * 15, "Union hall coordination playbook"),
            mk("Project delay cascade", p.reduce((s, x) => s + (x.schedulingShortages ?? 0), 0) * 8, "Cross-contractor re-staffing"),
            mk("Automation failure ripple", p.reduce((s, x) => s + (x.automationFailures ?? 0), 0) * 10, "Rollback to manual coordination mode"),
        ].filter((s) => s.impact > 0 || workers > 0);
    }
}
exports.IndustrySimulationEngine = IndustrySimulationEngine;
//# sourceMappingURL=industry-simulation.js.map