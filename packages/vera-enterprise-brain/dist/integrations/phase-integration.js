"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCommandContext = toCommandContext;
exports.toEnterpriseContext = toEnterpriseContext;
exports.ingestAllPhases = ingestAllPhases;
const command_center_1 = require("@vera/command-center");
const enterprise_automation_1 = require("@vera/enterprise-automation");
const vcc = new command_center_1.VeraCommandCenterEngine();
const veao = new enterprise_automation_1.VeraEnterpriseAutomationEngine();
function toCommandContext(ctx) {
    return {
        companyId: ctx.companyId,
        unionHallId: ctx.unionHallId,
        projectId: ctx.projectId,
        offline: ctx.offline,
        eventName: ctx.eventName,
        sifPrecursors: ctx.sifPrecursors,
        trainingExpiries: ctx.expiringTraining,
        competencyGaps: ctx.nonCompliantWorkers,
        inspectionFailures: ctx.inspectionFailures,
        fatigueIndicators: Math.min(10, ctx.nonCompliantWorkers ?? 0),
    };
}
function toEnterpriseContext(ctx) {
    return {
        companyId: ctx.companyId,
        unionHallId: ctx.unionHallId,
        projectId: ctx.projectId,
        offline: ctx.offline,
        autoExecute: !ctx.offline,
        nonCompliantWorkers: ctx.nonCompliantWorkers,
        expiringTraining: ctx.expiringTraining,
        inspectionFailures: ctx.inspectionFailures,
        schedulingShortages: ctx.schedulingShortages,
    };
}
function ingestAllPhases(ctx) {
    const command = vcc.refresh(toCommandContext(ctx));
    const enterprise = veao.orchestrate(toEnterpriseContext(ctx));
    return { command, enterprise };
}
//# sourceMappingURL=phase-integration.js.map