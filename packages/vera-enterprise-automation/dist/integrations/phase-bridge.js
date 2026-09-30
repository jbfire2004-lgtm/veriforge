"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSafetyPhase = runSafetyPhase;
exports.runSchedulingPhase = runSchedulingPhase;
exports.runOperationsPhase = runOperationsPhase;
const autonomous_safety_1 = require("@vera/autonomous-safety");
const predictive_scheduling_1 = require("@vera/predictive-scheduling");
const autonomous_operations_1 = require("@vera/autonomous-operations");
const actions_1 = require("../utils/actions");
const vase = new autonomous_safety_1.VeraAutonomousSafetyEngine();
const vpse = new predictive_scheduling_1.VeraPredictiveSchedulingEngine();
const vaoe = new autonomous_operations_1.VeraAutonomousOperationsEngine();
function runSafetyPhase(ctx) {
    const report = vase.analyze({
        companyId: ctx.companyId,
        projectId: ctx.projectId,
        forms: ctx.safetyForms?.map((f) => ({
            id: f.id,
            kind: f.kind,
            title: f.title,
            hazardSummary: f.hazardSummary,
        })),
        trainingGaps: ctx.nonCompliantWorkers,
        inspectionFailures: ctx.inspectionFailures,
        competencyGaps: ctx.nonCompliantWorkers,
        lockedOutEquipment: (ctx.lockedEquipment ?? 0) > 0,
    });
    const actions = [
        ...report.interventions.map((i) => (0, actions_1.enterpriseAction)({
            module: "safety",
            phase: "VASE",
            type: `safety.${i.type}`,
            title: i.title,
            reason: i.reason,
            entityType: "project",
            entityId: ctx.projectId ?? ctx.companyId ?? "0",
            priority: (0, actions_1.priorityScore)({ safety: 90, risk: report.sif.riskScore.score }),
            overrideable: true,
            rollbackable: true,
        })),
        ...report.automation.alerts.map((a, idx) => (0, actions_1.enterpriseAction)({
            module: "safety",
            phase: "VASE",
            type: "safety.alert",
            title: a,
            reason: "Safety automation",
            entityType: "company",
            entityId: ctx.companyId ?? "0",
            priority: 70 + idx,
            overrideable: false,
            rollbackable: false,
        })),
    ];
    return {
        actions,
        insights: report.automation.alerts,
        dashboard: report.dashboard,
    };
}
function runSchedulingPhase(ctx) {
    const workers = Array.from({ length: Math.min(ctx.workerCount ?? 5, 20) }, (_, i) => ({
        id: `w${i + 1}`,
        name: `Worker ${i + 1}`,
        isCompliant: i % 3 !== 0,
        dispatchStatus: "available",
        readinessScore: 70,
    }));
    const projects = ctx.schedulingShortages?.map((s) => ({
        id: s.projectId,
        name: `Project ${s.projectId}`,
        requiredWorkers: s.deficit + 2,
        assignedWorkers: 2,
    })) ?? [{ id: "p1", name: "Default", requiredWorkers: 3, assignedWorkers: 1 }];
    const report = vpse.analyze({
        companyId: ctx.companyId,
        workers,
        projects,
        horizonDays: 14,
    });
    const actions = [
        ...report.automation.scheduleDrafts.map((s, idx) => (0, actions_1.enterpriseAction)({
            module: "scheduling",
            phase: "VPSE",
            type: "scheduling.draft",
            title: s,
            reason: "Predictive scheduling",
            entityType: "project",
            entityId: projects[0]?.id ?? "0",
            priority: (0, actions_1.priorityScore)({ readiness: 75, operational: 60 }) + idx,
            overrideable: true,
            rollbackable: true,
        })),
        ...report.staffing.workerAssignments.slice(0, 5).map((a) => (0, actions_1.enterpriseAction)({
            module: "scheduling",
            phase: "VPSE",
            type: "scheduling.assign_worker",
            title: `Schedule worker ${a.workerId}`,
            reason: "Staffing optimization",
            entityType: "worker",
            entityId: a.workerId,
            targetId: a.projectId,
            priority: (0, actions_1.priorityScore)({ readiness: 80 }),
            overrideable: true,
            rollbackable: true,
        })),
    ];
    return {
        actions,
        insights: report.automation.alerts,
        dashboard: report.dashboard,
    };
}
function runOperationsPhase(ctx) {
    const report = vaoe.run({
        companyId: ctx.companyId,
        unionHallId: ctx.unionHallId,
        autoExecute: ctx.autoExecute !== false,
        workers: Array.from({ length: Math.min(ctx.workerCount ?? 3, 10) }, (_, i) => ({
            id: `w${i + 1}`,
            name: `Worker ${i + 1}`,
            isCompliant: i % 2 === 0,
            trainingValid: i % 2 === 0,
            dispatchStatus: "available",
        })),
        projects: [{ id: "p1", name: "Site", requiredWorkers: 4, assignedWorkers: 2 }],
        equipment: [{ id: "e1", name: "Unit", inspectionPassed: ctx.inspectionFailures === 0 }],
    });
    const actions = report.execution.log.map((a) => (0, actions_1.enterpriseAction)({
        module: "operations",
        phase: "VAOE",
        type: a.type,
        title: a.title,
        reason: a.reason,
        entityType: a.entityType,
        entityId: a.entityId,
        targetId: a.targetId,
        priority: (0, actions_1.priorityScore)({ operational: 85, safety: 40 }),
        overrideable: a.overrideable,
        rollbackable: a.rollbackable,
        status: a.status === "executed" ? "executed" : "pending",
        executedAt: a.executedAt,
    }));
    return {
        actions,
        insights: [],
        dashboard: report.dashboard,
    };
}
//# sourceMappingURL=phase-bridge.js.map