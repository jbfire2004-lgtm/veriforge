import { AutoDispatchEngine } from "../engines/auto-dispatch";
import { AutoAssignmentEngine } from "../engines/auto-assignment";
import { AutoLockoutEngine } from "../engines/auto-lockout";
import { AutoRestrictionEngine } from "../engines/auto-restriction";
import { AutoRosterEngine } from "../engines/auto-roster";
import { AutoConflictResolutionEngine } from "../engines/auto-conflict-resolution";
import { AutoReadinessEngine } from "../engines/auto-readiness";
import { AutonomousExecutionEngine } from "../engines/autonomous-execution";
import { AutonomousSyncEngine } from "../engines/autonomous-sync";
import { OperationsEventEngine } from "../engines/operations-events";
import { OfflineAutonomousEngine } from "../engines/offline-autonomous";
import { buildTwinOperationsOverlay } from "../integrations/twin-integration";
import type {
  AutonomousAction,
  AutonomousOperationsReport,
  OperationsContextInput,
  OperationsDashboardBundle,
} from "../types";

/**
 * Vera Autonomous Operations Engine (VAOE)
 */
export class VeraAutonomousOperationsEngine {
  readonly dispatch = new AutoDispatchEngine();
  readonly assignment = new AutoAssignmentEngine();
  readonly lockout = new AutoLockoutEngine();
  readonly restriction = new AutoRestrictionEngine();
  readonly roster = new AutoRosterEngine();
  readonly conflicts = new AutoConflictResolutionEngine();
  readonly readiness = new AutoReadinessEngine();
  readonly execution = new AutonomousExecutionEngine();
  readonly sync = new AutonomousSyncEngine();
  readonly events = new OperationsEventEngine();
  readonly offline = new OfflineAutonomousEngine();

  run(ctx: OperationsContextInput): AutonomousOperationsReport {
    const dispatch = this.dispatch.run(ctx);
    const assignment = this.assignment.run(ctx);
    const lockout = this.lockout.run(ctx);
    const restriction = this.restriction.run(ctx);
    const roster = this.roster.run(ctx);
    const conflicts = this.conflicts.run(
      ctx,
      assignment.conflicts,
      dispatch.conflicts
    );
    const readiness = this.readiness.run(ctx);

    const allActions: AutonomousAction[] = [
      ...dispatch.dispatches,
      ...dispatch.recalls,
      ...dispatch.escalations,
      ...dispatch.notifications,
      ...assignment.assignments,
      ...assignment.replacements,
      ...lockout.lockouts,
      ...lockout.unlocks,
      ...lockout.notifications,
      ...restriction.restrictions,
      ...restriction.lifts,
      ...roster.corrections,
      ...conflicts.resolutions,
      ...readiness.correctiveActions,
    ];

    const execution = this.execution.execute(
      { ...ctx, autoExecute: ctx.autoExecute !== false },
      allActions
    );

    if (ctx.offline && execution.queued.length) {
      this.sync.enqueue(execution.queued);
    }

    const core = {
      generatedAt: new Date().toISOString(),
      context: ctx,
      dispatch,
      assignment,
      lockout,
      restriction,
      roster,
      conflicts,
      readiness,
      execution,
    };

    const twinOverlay = buildTwinOperationsOverlay(core);
    const dashboard = this.buildDashboard(core, allActions);

    return {
      ...core,
      twinOverlay,
      dashboard,
      overrides: [],
    };
  }

  runOffline(ctx: OperationsContextInput): AutonomousOperationsReport {
    const offlineConflicts = this.offline.detectOfflineConflicts(ctx);
    this.offline.enqueue(ctx);
    const report = this.run({ ...ctx, offline: true, autoExecute: true });
    if (offlineConflicts.length) {
      report.execution.log.push(
        ...offlineConflicts.map((c, i) => ({
          id: `offline-conf-${i}`,
          type: "conflict.resolve" as const,
          status: "queued" as const,
          title: c,
          reason: "Offline conflict detection",
          entityType: "worker" as const,
          entityId: "0",
          overrideable: true,
          rollbackable: false,
        }))
      );
    }
    return report;
  }

  syncOffline(runFn: (ctx: OperationsContextInput) => AutonomousOperationsReport): AutonomousOperationsReport[] {
    return this.offline.drain().map((item) => {
      const report = runFn({ ...item.context, offline: false });
      const synced = this.sync.applySynced(report.execution.queued);
      return this.offline.markSynced({
        ...report,
        execution: {
          ...report.execution,
          executed: [...report.execution.executed, ...synced],
          queued: [],
        },
      });
    });
  }

  onEvent(
    ctx: OperationsContextInput,
    event: string,
    data?: Record<string, unknown>
  ): AutonomousOperationsReport {
    return this.run(this.events.applyEvent(ctx, event, data));
  }

  overrideAction(
    report: AutonomousOperationsReport,
    actionId: string,
    reason: string
  ): AutonomousOperationsReport {
    const action = report.execution.log.find((a) => a.id === actionId);
    if (!action || !action.overrideable) return report;
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

  rollbackAction(
    report: AutonomousOperationsReport,
    actionId: string,
    reason: string
  ): AutonomousOperationsReport {
    const action = report.execution.log.find((a) => a.id === actionId);
    if (!action || !action.rollbackable) return report;
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
    report: Omit<AutonomousOperationsReport, "dashboard" | "twinOverlay" | "overrides">,
    allActions: AutonomousAction[]
  ): OperationsDashboardBundle {
    const executed = report.execution.executed.length;
    const pending = report.execution.log.filter((a) => a.status === "pending").length;

    return {
      generatedAt: new Date().toISOString(),
      totalActions: allActions.length,
      executedCount: executed,
      pendingCount: pending,
      dispatch: {
        assign: report.dispatch.dispatches.length,
        recall: report.dispatch.recalls.length,
        conflicts: report.dispatch.conflicts.length,
      },
      assignment: {
        count: report.assignment.assignments.length + report.assignment.replacements.length,
        conflicts: report.assignment.conflicts.length,
      },
      lockout: {
        applied: report.lockout.lockouts.length,
        released: report.lockout.unlocks.length,
      },
      restriction: {
        applied: report.restriction.restrictions.length,
        lifted: report.restriction.lifts.length,
      },
      roster: {
        days: report.roster.roster.length,
        corrections: report.roster.corrections.length,
      },
      conflicts: {
        resolved: report.conflicts.resolutions.length,
        unresolved: report.conflicts.unresolved.length,
      },
      readiness: {
        failures: report.readiness.failures.length,
        corrections: report.readiness.correctiveActions.length,
      },
      sync: {
        queued: report.execution.queued.length,
        synced: this.sync.pendingCount() === 0 ? executed : 0,
      },
    };
  }
}
