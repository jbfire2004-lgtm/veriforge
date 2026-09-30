"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectStaffingEngine = void 0;
const matching_1 = require("../utils/matching");
class ProjectStaffingEngine {
    analyze(ctx) {
        const workers = ctx.workers ?? [];
        const equipment = ctx.equipment ?? [];
        const projects = ctx.projects ?? [];
        const dailyWorkerNeed = projects.map((p) => ({
            projectId: p.id,
            workers: p.requiredWorkers ?? Math.max(1, p.assignedWorkers ?? 1),
        }));
        const dailyEquipmentNeed = projects.map((p) => ({
            projectId: p.id,
            equipment: p.requiredEquipment ?? Math.max(0, p.assignedEquipment ?? 0),
        }));
        const skillGaps = [];
        const trainingGaps = [];
        const complianceGaps = [];
        for (const w of workers) {
            if ((w.competencyGaps ?? 0) > 0)
                skillGaps.push(`Worker ${w.name}: competency gaps`);
            if ((w.expiringTraining ?? 0) > 0)
                trainingGaps.push(`Worker ${w.name}: training expiring`);
            if (!w.isCompliant)
                complianceGaps.push(`Worker ${w.name}: non-compliant`);
        }
        const workerAssignments = [];
        const equipmentAssignments = [];
        for (const p of projects) {
            const rankedW = (0, matching_1.rankWorkersForProject)(workers, p);
            const deficit = Math.max(0, (p.requiredWorkers ?? 0) - (p.assignedWorkers ?? 0));
            for (const r of rankedW.slice(0, Math.max(deficit, 3))) {
                workerAssignments.push({
                    workerId: r.workerId,
                    projectId: p.id,
                    score: r.score,
                });
            }
            const rankedE = (0, matching_1.rankEquipmentForProject)(equipment, p);
            const eqDeficit = Math.max(0, (p.requiredEquipment ?? 0) - (p.assignedEquipment ?? 0));
            for (const r of rankedE.slice(0, Math.max(eqDeficit, 2))) {
                equipmentAssignments.push({
                    equipmentId: r.equipmentId,
                    projectId: p.id,
                    score: r.score,
                });
            }
        }
        const delayRisk = projects
            .map((p) => {
            const workerGap = Math.max(0, (p.requiredWorkers ?? 0) - (p.assignedWorkers ?? 0));
            const trainGap = p.missingTraining ?? 0;
            const readiness = p.readiness ?? 100;
            if (workerGap === 0 && trainGap === 0 && readiness >= 70)
                return null;
            const probability = Math.min(0.95, workerGap * 0.15 + trainGap * 0.1 + (100 - readiness) / 100);
            return {
                projectId: p.id,
                probability,
                reason: workerGap > 0
                    ? "Understaffed"
                    : trainGap > 0
                        ? "Training gaps"
                        : "Low readiness",
            };
        })
            .filter((d) => d !== null);
        const recommendedLevels = projects.map((p) => ({
            projectId: p.id,
            workers: Math.max(p.requiredWorkers ?? 0, p.assignedWorkers ?? 0) + 1,
            equipment: Math.max(p.requiredEquipment ?? 0, p.assignedEquipment ?? 0),
        }));
        return {
            dailyWorkerNeed,
            dailyEquipmentNeed,
            skillGaps: skillGaps.slice(0, 10),
            trainingGaps: trainingGaps.slice(0, 10),
            complianceGaps: complianceGaps.slice(0, 10),
            delayRisk,
            workerAssignments,
            equipmentAssignments,
            recommendedLevels,
        };
    }
}
exports.ProjectStaffingEngine = ProjectStaffingEngine;
//# sourceMappingURL=project-staffing.js.map