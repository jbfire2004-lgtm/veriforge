"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyInterventionEngine = void 0;
let interventionId = 0;
class SafetyInterventionEngine {
    constructor() {
        this.interventions = [];
    }
    evaluate(ctx, sif, heca, energy) {
        this.interventions = [];
        for (const type of sif.interventions) {
            this.add(type, 95, "SIF prevention trigger", sif.riskScore.level);
        }
        if (heca.violations.length > 0) {
            this.add("require_jha_update", 88, "HECA deviation detected", "high");
        }
        if (energy.conflicts.length > 0) {
            this.add("notify_supervisor", 85, "Energy conflict detected", "high");
        }
        if ((ctx.inspectionFailures ?? 0) >= 2) {
            this.add("require_inspection", 90, "Repeated inspection failures", "high");
            if (ctx.equipmentId)
                this.add("lockout_equipment", 92, "Equipment lockout recommended", "critical");
        }
        if ((ctx.trainingGaps ?? 0) > 0) {
            this.add("require_training", 80, "Training gap identified", "medium");
        }
        if (sif.riskScore.level === "critical") {
            this.add("escalate_management", 99, "Critical SIF risk score", "critical");
        }
        if (ctx.workerId && heca.riskScore.level === "high") {
            this.add("restrict_worker", 87, "HECA high risk for worker", "high", "worker", ctx.workerId);
        }
        return this.prioritize();
    }
    getAll() {
        return this.prioritize();
    }
    add(type, priority, reason, severity, entityType, entityId) {
        const titles = {
            notify_supervisor: "Notify supervisor",
            lockout_equipment: "Lock out equipment",
            restrict_worker: "Restrict worker assignment",
            require_training: "Require training",
            require_inspection: "Require inspection",
            require_jha_update: "Update JHA/FLHA",
            escalate_management: "Escalate to management",
        };
        this.interventions.push({
            id: `int_${++interventionId}`,
            type,
            priority,
            title: titles[type],
            reason,
            entityType,
            entityId,
            triggeredAt: new Date().toISOString(),
        });
    }
    prioritize() {
        return [...this.interventions].sort((a, b) => b.priority - a.priority);
    }
}
exports.SafetyInterventionEngine = SafetyInterventionEngine;
//# sourceMappingURL=safety-intervention.js.map