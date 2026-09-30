"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseMemoryEngine = void 0;
class EnterpriseMemoryEngine {
    constructor() {
        this.longTerm = [];
    }
    recall(ctx, phases) {
        const now = new Date().toISOString();
        const shortTerm = [];
        for (const alert of phases.command.alerts.slice(0, 5)) {
            shortTerm.push({
                id: `mem-st-${alert.id}`,
                category: "short_term",
                content: `${alert.severity}: ${alert.title}`,
                relevance: 0.9,
                at: now,
            });
        }
        for (const step of phases.command.timeline.slice(0, 5)) {
            shortTerm.push({
                id: `mem-st-${step.id}`,
                category: "short_term",
                content: step.summary,
                relevance: 0.7,
                at: step.at,
            });
        }
        if ((ctx.sifPrecursors ?? 0) > 1) {
            this.longTerm.push({
                id: `mem-lt-sif-${Date.now()}`,
                category: "safety",
                content: "Recurring SIF precursor pattern detected",
                relevance: 0.85,
                at: now,
            });
        }
        if ((ctx.nonCompliantWorkers ?? 0) > 5) {
            this.longTerm.push({
                id: `mem-lt-comp-${Date.now()}`,
                category: "compliance",
                content: "Enterprise compliance drift observed",
                relevance: 0.8,
                at: now,
            });
        }
        const patterns = [];
        if (ctx.schedulingShortages?.length) {
            patterns.push({
                id: "mem-pattern-staff",
                category: "pattern",
                content: "Chronic understaffing on active projects",
                relevance: 0.75,
                at: now,
            });
        }
        return [...shortTerm, ...patterns, ...this.longTerm.slice(-20)].slice(0, 30);
    }
}
exports.EnterpriseMemoryEngine = EnterpriseMemoryEngine;
//# sourceMappingURL=enterprise-memory.js.map