import { CrossModuleAutomationEngine } from "../engines/cross-module-automation";
import { MultiEntityAutomationEngine } from "../engines/multi-entity-automation";
import { ComplianceAutomationEngine } from "../engines/compliance-automation";
import { DocumentAutomationEngine } from "../engines/document-automation";
import { TwinAutomationEngine } from "../engines/twin-automation";
import { DataAutomationEngine } from "../engines/data-automation";
import { EnterpriseRulesEngine } from "../engines/enterprise-rules";
import { EnterpriseWorkflowEngine } from "../engines/enterprise-workflow";
import { AutomationConflictResolver } from "../engines/automation-conflicts";
import { EnterpriseExecutionEngine } from "../engines/enterprise-execution";
import { OfflineEnterpriseEngine } from "../engines/offline-enterprise";
import { AutomationEventEngine } from "../engines/automation-events";
import {
  runOperationsPhase,
  runSafetyPhase,
  runSchedulingPhase,
} from "../integrations/phase-bridge";
import type {
  EnterpriseAction,
  EnterpriseAutomationReport,
  EnterpriseContextInput,
  EnterpriseDashboardBundle,
} from "../types";

/**
 * Vera Enterprise Automation Orchestrator (VEAO)
 */
export class VeraEnterpriseAutomationEngine {
  readonly crossModule = new CrossModuleAutomationEngine();
  readonly multiEntity = new MultiEntityAutomationEngine();
  readonly compliance = new ComplianceAutomationEngine();
  readonly document = new DocumentAutomationEngine();
  readonly twin = new TwinAutomationEngine();
  readonly data = new DataAutomationEngine();
  readonly rules = new EnterpriseRulesEngine();
  readonly workflow = new EnterpriseWorkflowEngine();
  readonly conflicts = new AutomationConflictResolver();
  readonly execution = new EnterpriseExecutionEngine();
  readonly offline = new OfflineEnterpriseEngine();
  readonly events = new AutomationEventEngine();

  orchestrate(ctx: EnterpriseContextInput): EnterpriseAutomationReport {
    const safety = runSafetyPhase(ctx);
    const scheduling = runSchedulingPhase(ctx);
    const operations = runOperationsPhase(ctx);
    const compliance = this.compliance.run(ctx);
    const document = this.document.run(ctx);
    const twin = this.twin.run(ctx);
    const data = this.data.run(ctx);
    const crossModule = this.crossModule.run(ctx);
    const multiEntity = this.multiEntity.run(ctx);
    const rules = this.rules.run(ctx);
    const workflows = this.workflow.run(ctx, ctx.eventName);

    const rawActions: EnterpriseAction[] = [
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
    const execution = this.execution.execute(
      { ...ctx, autoExecute: ctx.autoExecute !== false },
      resolved
    );

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

  orchestrateOffline(ctx: EnterpriseContextInput): EnterpriseAutomationReport {
    this.offline.enqueue(ctx);
    return this.orchestrate({ ...ctx, offline: true });
  }

  syncOffline(): EnterpriseAutomationReport[] {
    return this.offline.drain().map((item) =>
      this.offline.markSynced(this.orchestrate({ ...item.context, offline: false }))
    );
  }

  onEvent(
    ctx: EnterpriseContextInput,
    event: string,
    data?: Record<string, unknown>
  ): EnterpriseAutomationReport {
    return this.orchestrate(this.events.applyEvent(ctx, event, data));
  }

  overrideAction(report: EnterpriseAutomationReport, actionId: string, reason: string) {
    const action = report.execution.log.find((a) => a.id === actionId);
    if (!action?.overrideable) return report;
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

  rollbackAction(report: EnterpriseAutomationReport, actionId: string, reason: string) {
    const action = report.execution.log.find((a) => a.id === actionId);
    if (!action?.rollbackable) return report;
    const rolled = this.execution.rollback(action, reason);
    return {
      ...report,
      execution: {
        ...report.execution,
        log: report.execution.log.map((a) => (a.id === actionId ? rolled : a)),
      },
    };
  }

  private buildDashboard(
    report: Omit<EnterpriseAutomationReport, "dashboard" | "overrides">,
    allActions: EnterpriseAction[]
  ): EnterpriseDashboardBundle {
    const moduleCounts: Record<string, number> = {};
    for (const a of allActions) {
      moduleCounts[a.module] = (moduleCounts[a.module] ?? 0) + 1;
    }

    const healthScore = Math.max(
      0,
      Math.min(
        100,
        100 -
          report.conflicts.length * 5 -
          (report.context.nonCompliantWorkers ?? 0) * 2 -
          (report.context.inspectionFailures ?? 0) * 8
      )
    );

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
