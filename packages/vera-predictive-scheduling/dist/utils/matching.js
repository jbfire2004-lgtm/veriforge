"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankWorkersForProject = rankWorkersForProject;
exports.rankEquipmentForProject = rankEquipmentForProject;
const scoring_1 = require("./scoring");
function rankWorkersForProject(workers, project, requiredSkills) {
    return workers
        .map((w) => {
        const compliance = w.isCompliant ? 30 : 0;
        const readiness = (w.readinessScore ?? 50) * 0.3;
        const riskPenalty = (w.riskScore ?? 0) * 0.15;
        const safetyPenalty = (w.safetyRiskScore ?? 0) * 0.1;
        const skill = (0, scoring_1.matchScore)(w.skills, requiredSkills) * 0.25;
        const dispatch = w.dispatchStatus === "available" ? 10 : w.dispatchStatus === "dispatched" ? 0 : 5;
        const score = Math.round(compliance + readiness + skill + dispatch - riskPenalty - safetyPenalty);
        return { workerId: w.id, projectId: project.id, score: Math.max(0, score) };
    })
        .sort((a, b) => b.score - a.score);
}
function rankEquipmentForProject(equipment, project) {
    return equipment
        .map((e) => {
        let score = 70;
        if (e.lockedOut)
            score -= 50;
        if (e.overdueInspection)
            score -= 25;
        if ((e.maintenanceDueDays ?? 999) < 7)
            score -= 15;
        if (e.projectIds?.includes(project.id))
            score += 15;
        return { equipmentId: e.id, projectId: project.id, score: Math.max(0, score) };
    })
        .sort((a, b) => b.score - a.score);
}
//# sourceMappingURL=matching.js.map