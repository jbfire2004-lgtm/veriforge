"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestRealtimePhases = ingestRealtimePhases;
const autonomous_safety_1 = require("@vera/autonomous-safety");
const predictive_scheduling_1 = require("@vera/predictive-scheduling");
const enterprise_automation_1 = require("@vera/enterprise-automation");
const vase = new autonomous_safety_1.VeraAutonomousSafetyEngine();
const vpse = new predictive_scheduling_1.VeraPredictiveSchedulingEngine();
const veao = new enterprise_automation_1.VeraEnterpriseAutomationEngine();
function ingestRealtimePhases(ctx) {
    const safety = vase.analyze({
        companyId: ctx.companyId,
        projectId: ctx.projectId,
        forms: ctx.safetyForms?.map((f) => ({
            id: f.id,
            kind: f.kind,
            title: f.title,
            hazardSummary: f.hazardSummary,
        })),
        trainingGaps: ctx.trainingExpiries,
        inspectionFailures: ctx.inspectionFailures,
        competencyGaps: ctx.competencyGaps,
    });
    const scheduling = vpse.analyze({
        companyId: ctx.companyId,
        workers: (ctx.entities ?? [])
            .filter((e) => e.type === "worker")
            .map((e) => ({
            id: e.id,
            name: e.name,
            isCompliant: e.complianceOk,
            readinessScore: e.readinessScore,
            dispatchStatus: "available",
        })),
        projects: (ctx.entities ?? [])
            .filter((e) => e.type === "project")
            .map((e) => ({
            id: e.id,
            name: e.name,
            requiredWorkers: 3,
            assignedWorkers: 2,
        })),
    });
    const enterprise = veao.orchestrate({
        companyId: ctx.companyId,
        unionHallId: ctx.unionHallId,
        nonCompliantWorkers: ctx.competencyGaps,
        expiringTraining: ctx.trainingExpiries,
        inspectionFailures: ctx.inspectionFailures,
        safetyForms: ctx.safetyForms,
        autoExecute: !ctx.offline,
    });
    return { safety, scheduling, enterprise };
}
//# sourceMappingURL=phase-realtime.js.map