"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandAlertingEngine = void 0;
let alertId = 0;
class CommandAlertingEngine {
    generate(ctx, risks, intelligence) {
        const alerts = [];
        const now = new Date().toISOString();
        const push = (severity, type, title, message, entityType, entityId) => {
            alertId += 1;
            alerts.push({
                id: `alert-${alertId}`,
                severity,
                type,
                title,
                message,
                entityType,
                entityId,
                at: now,
            });
        };
        if ((ctx.sifPrecursors ?? 0) > 0) {
            push("critical", "safety", "SIF precursor alert", `${ctx.sifPrecursors} SIF precursor(s) active`);
        }
        if ((ctx.hecaDeviations ?? 0) > 0) {
            push("high", "safety", "HECA deviation", `${ctx.hecaDeviations} HECA deviation(s)`);
        }
        if ((ctx.energyConflicts ?? 0) > 0) {
            push("high", "safety", "Energy Wheel conflict", `${ctx.energyConflicts} energy conflict(s)`);
        }
        for (const h of intelligence.hazards.slice(0, 3)) {
            push("medium", "safety", "Hazard detected", h);
        }
        for (const c of intelligence.complianceFailures) {
            push("high", "compliance", "Compliance failure", c);
        }
        for (const o of intelligence.operationalFailures.slice(0, 3)) {
            push("medium", "operations", "Operational issue", o);
        }
        if ((ctx.dispatchConflicts ?? 0) > 0) {
            push("high", "dispatch", "Dispatch conflict", `${ctx.dispatchConflicts} conflict(s)`);
        }
        if ((ctx.trainingExpiries ?? 0) > 0) {
            push("medium", "training", "Training expiry", `${ctx.trainingExpiries} expiring soon`);
        }
        if ((ctx.documentFraud ?? 0) > 0) {
            push("critical", "document", "Document fraud", `${ctx.documentFraud} flagged document(s)`);
        }
        for (const r of risks.filter((x) => x.score.level === "critical").slice(0, 5)) {
            push("critical", "safety", `${r.entityType} critical risk`, r.factors.join(", "), r.entityType, r.entityId);
        }
        return alerts.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
    }
}
exports.CommandAlertingEngine = CommandAlertingEngine;
function severityRank(s) {
    return { critical: 4, high: 3, medium: 2, low: 1 }[s];
}
//# sourceMappingURL=alerting.js.map