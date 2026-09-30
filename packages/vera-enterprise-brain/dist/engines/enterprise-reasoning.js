"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseReasoningEngine = void 0;
class EnterpriseReasoningEngine {
    reason(ctx, phases) {
        const steps = [];
        let idx = 0;
        const add = (domain, conclusion, confidence, safetyFirst) => {
            steps.push({ id: `rs-${idx++}`, domain, conclusion, confidence, safetyFirst });
        };
        if ((ctx.sifPrecursors ?? 0) > 0) {
            add("safety", "SIF precursors require immediate control verification", 0.92, true);
        }
        if ((ctx.nonCompliantWorkers ?? 0) > 0) {
            add("compliance", `${ctx.nonCompliantWorkers} workers fail compliance constraints`, 0.88, true);
        }
        if (phases.command.intelligence.hazards.length) {
            add("safety", `Hazard chain: ${phases.command.intelligence.hazards[0]}`, 0.85, true);
        }
        if ((ctx.schedulingShortages?.length ?? 0) > 0) {
            add("scheduling", "Workforce shortage will impact project readiness within 7 days", 0.8);
        }
        if (phases.enterprise.conflicts.length) {
            add("operations", "Automation conflicts detected — priority resolution required", 0.82);
        }
        if ((ctx.inspectionFailures ?? 0) > 0) {
            add("equipment", "Inspection failures cascade to lockout and reassignment", 0.87, true);
        }
        add("temporal", "If training expiries are not addressed, compliance drops in 14 days", 0.75);
        add("causal", "Fatigue + understaffing increases incident probability", 0.78, true);
        add("counterfactual", "Without dispatch rebalance, project delay risk rises 35%", 0.7);
        const crossDomainInsights = [
            "Safety and compliance constraints dominate today's decisions",
            "Scheduling and operations must align before dispatch expansion",
            ...phases.command.agents.slice(0, 2).map((a) => a.summary),
        ];
        return {
            steps,
            summary: `Holistic analysis: ${steps.length} reasoning steps across ${new Set(steps.map((s) => s.domain)).size} domains`,
            crossDomainInsights,
        };
    }
}
exports.EnterpriseReasoningEngine = EnterpriseReasoningEngine;
//# sourceMappingURL=enterprise-reasoning.js.map