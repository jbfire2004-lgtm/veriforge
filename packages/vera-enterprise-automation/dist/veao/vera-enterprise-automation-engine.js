"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraEnterpriseAutomationEngine = void 0;
const cross_module_automation_1 = require("../engines/cross-module-automation");
const multi_entity_automation_1 = require("../engines/multi-entity-automation");
const compliance_automation_1 = require("../engines/compliance-automation");
const document_automation_1 = require("../engines/document-automation");
const twin_automation_1 = require("../engines/twin-automation");
const data_automation_1 = require("../engines/data-automation");
const enterprise_rules_1 = require("../engines/enterprise-rules");
const enterprise_workflow_1 = require("../engines/enterprise-workflow");
const automation_conflicts_1 = require("../engines/automation-conflicts");
const enterprise_execution_1 = require("../engines/enterprise-execution");
const offline_enterprise_1 = require("../engines/offline-enterprise");
const automation_events_1 = require("../engines/automation-events");
const phase_bridge_1 = require("../integrations/phase-bridge");
/**
 * Vera Enterprise Automation Orchestrator (VEAO)
 */
class VeraEnterpriseAutomationEngine {
    constructor() {
        this.crossModule = new cross_module_automation_1.CrossModuleAutomationEngine();
        this.multiEntity = new multi_entity_automation_1.MultiEntityAutomationEngine();
        this.compliance = new compliance_automation_1.ComplianceAutomationEngine();
        this.document = new document_automation_1.DocumentAutomationEngine();
        this.twin = new twin_automation_1.TwinAutomationEngine();
        this.data = new data_automation_1.DataAutomationEngine();
        this.rules = new enterprise_rules_1.EnterpriseRulesEngine();
        this.workflow = new enterprise_workflow_1.EnterpriseWorkflowEngine();
        this.conflicts = new automation_conflicts_1.AutomationConflictResolver();
        this.execution = new enterprise_execution_1.EnterpriseExecutionEngine();
        this.offline = new offline_enterprise_1.OfflineEnterpriseEngine();
        this.events = new automation_events_1.AutomationEventEngine();
    }
    orchestrate(ctx) {
        const safety = (0, phase_bridge_1.runSafetyPhase)(ctx);
        const scheduling = (0, phase_bridge_1.runSchedulingPhase)(ctx);
        const operations = (0, phase_bridge_1.runOperationsPhase)(ctx);
        const compliance = this.compliance.run(ctx);
        const document = this.document.run(ctx);
        const twin = this.twin.run(ctx);
        const data = this.data.run(ctx);
        const crossModule = this.crossModule.run(ctx);
        const multiEntity = this.multiEntity.run(ctx);
        const rules = this.rules.run(ctx);
        const workflows = this.workflow.run(ctx, ctx.eventName);
        const rawActions = [
            ...safety.actions,
            ...scheduling.actions,
            ...operations.actions,
            ...compliance.actions,
            ...document.actions,
            ...twin.actions,
            ...data.actions,
            ...crossModule.actions,
            ...multiEntity.actions,
            ...rules.actions,
            ...workflows.actions,
        ];
        const { resolved, conflicts } = this.conflicts.resolve(rawActions);
        const execution = this.execution.execute({ ...ctx, autoExecute: ctx.autoExecute !== false }, resolved);
        const core = {
            generatedAt: new Date().toISOString(),
            context: ctx,
            safety,
            operations,
            scheduling,
            compliance,
            document,
            twin,
            data,
            crossModule,
            multiEntity,
            rules,
            workflows,
            conflicts,
            execution,
        };
        const dashboard = this.buildDashboard(core, rawActions);
        return {
            ...core,
            dashboard,
            overrides: [],
        };
    }
    orchestrateOffline(ctx) {
        this.offline.enqueue(ctx);
        return this.orchestrate({ ...ctx, offline: true });
    }
    syncOffline() {
        return this.offline.drain().map((item) => this.offline.markSynced(this.orchestrate({ ...item.context, offline: false })));
    }
    onEvent(ctx, event, data) {
        return this.orchestrate(this.events.applyEvent(ctx, event, data));
    }
    overrideAction(report, actionId, reason) {
        const action = report.execution.log.find((a) => a.id === actionId);
        if (!action?.overrideable)
            return report;
        const overridden = this.execution.override(action, reason);
        return {
            ...report,
            execution: {
                ...report.execution,
                log: report.execution.log.map((a) => (a.id === actionId ? overridden : a)),
            },
            overrides: [...report.overrides, { actionId, reason }],
        };
    }
    rollbackAction(report, actionId, reason) {
        const action = report.execution.log.find((a) => a.id === actionId);
        if (!action?.rollbackable)
            return report;
        const rolled = this.execution.rollback(action, reason);
        return {
            ...report,
            execution: {
                ...report.execution,
                log: report.execution.log.map((a) => (a.id === actionId ? rolled : a)),
            },
        };
    }
    buildDashboard(report, allActions) {
        const moduleCounts = {};
        for (const a of allActions) {
            moduleCounts[a.module] = (moduleCounts[a.module] ?? 0) + 1;
        }
        const healthScore = Math.max(0, Math.min(100, 100 -
            report.conflicts.length * 5 -
            (report.context.nonCompliantWorkers ?? 0) * 2 -
            (report.context.inspectionFailures ?? 0) * 8));
        return {
            generatedAt: new Date().toISOString(),
            queueSize: report.execution.queued.length,
            actionCount: allActions.length,
            executedCount: report.execution.executed.length,
            conflictCount: report.conflicts.length,
            overrideCount: 0,
            healthScore,
            modules: moduleCounts,
            trends: [
                { label: "Safety actions", value: report.safety.actions.length },
                { label: "Operations actions", value: report.operations.actions.length },
                { label: "Scheduling actions", value: report.scheduling.actions.length },
            ],
            insights: [
                ...report.safety.insights,
                ...report.compliance.insights,
                ...report.document.insights,
                ...report.data.insights,
            ].slice(0, 8),
        };
    }
}
exports.VeraEnterpriseAutomationEngine = VeraEnterpriseAutomationEngine;
//# sourceMappingURL=vera-enterprise-automation-engine.js.map