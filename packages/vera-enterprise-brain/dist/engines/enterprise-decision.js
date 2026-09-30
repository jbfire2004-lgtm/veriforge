"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseDecisionEngine = void 0;
class EnterpriseDecisionEngine {
    decide(ctx, phases, reasoning, predictions, policies) {
        const decisions = [];
        let idx = 0;
        const add = (mode, title, reason, confidence, executed) => {
            decisions.push({
                id: `dec-${idx++}`,
                mode,
                title,
                reason,
                confidence,
                executed: executed && !ctx.offline,
                overrideable: mode === "autonomous",
            });
        };
        const violations = policies.filter((p) => p.violation);
        for (const v of violations) {
            add("autonomous", `Enforce ${v.name}`, v.violation, 0.9, true);
        }
        for (const p of predictions.filter((x) => x.probability > 0.6).slice(0, 3)) {
            add("assisted", `Prevent: ${p.label}`, p.preventiveAction ?? "Review with supervisor", p.probability, false);
        }
        for (const action of phases.enterprise.execution.executed.slice(0, 5)) {
            add("autonomous", action.title, action.reason, 0.85, true);
        }
        if (reasoning.steps.some((s) => s.safetyFirst)) {
            add("escalation", "Escalate to safety leadership", "Safety-first reasoning chain", 0.88, false);
        }
        if ((ctx.sifPrecursors ?? 0) > 2) {
            add("supervisor", "Supervisor review required", "Multiple SIF precursors", 0.95, false);
        }
        return decisions;
    }
}
exports.EnterpriseDecisionEngine = EnterpriseDecisionEngine;
//# sourceMappingURL=enterprise-decision.js.map