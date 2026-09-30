"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraAutonomousOperationsEngine = void 0;
const auto_dispatch_1 = require("../engines/auto-dispatch");
const auto_assignment_1 = require("../engines/auto-assignment");
const auto_lockout_1 = require("../engines/auto-lockout");
const auto_restriction_1 = require("../engines/auto-restriction");
const auto_roster_1 = require("../engines/auto-roster");
const auto_conflict_resolution_1 = require("../engines/auto-conflict-resolution");
const auto_readiness_1 = require("../engines/auto-readiness");
const autonomous_execution_1 = require("../engines/autonomous-execution");
const autonomous_sync_1 = require("../engines/autonomous-sync");
const operations_events_1 = require("../engines/operations-events");
const offline_autonomous_1 = require("../engines/offline-autonomous");
const twin_integration_1 = require("../integrations/twin-integration");
/**
 * Vera Autonomous Operations Engine (VAOE)
 */
class VeraAutonomousOperationsEngine {
    constructor() {
        this.dispatch = new auto_dispatch_1.AutoDispatchEngine();
        this.assignment = new auto_assignment_1.AutoAssignmentEngine();
        this.lockout = new auto_lockout_1.AutoLockoutEngine();
        this.restriction = new auto_restriction_1.AutoRestrictionEngine();
        this.roster = new auto_roster_1.AutoRosterEngine();
        this.conflicts = new auto_conflict_resolution_1.AutoConflictResolutionEngine();
        this.readiness = new auto_readiness_1.AutoReadinessEngine();
        this.execution = new autonomous_execution_1.AutonomousExecutionEngine();
        this.sync = new autonomous_sync_1.AutonomousSyncEngine();
        this.events = new operations_events_1.OperationsEventEngine();
        this.offline = new offline_autonomous_1.OfflineAutonomousEngine();
    }
    run(ctx) {
        const dispatch = this.dispatch.run(ctx);
        const assignment = this.assignment.run(ctx);
        const lockout = this.lockout.run(ctx);
        const restriction = this.restriction.run(ctx);
        const roster = this.roster.run(ctx);
        const conflicts = this.conflicts.run(ctx, assignment.conflicts, dispatch.conflicts);
        const readiness = this.readiness.run(ctx);
        const allActions = [
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
        const execution = this.execution.execute({ ...ctx, autoExecute: ctx.autoExecute !== false }, allActions);
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
        const twinOverlay = (0, twin_integration_1.buildTwinOperationsOverlay)(core);
        const dashboard = this.buildDashboard(core, allActions);
        return {
            ...core,
            twinOverlay,
            dashboard,
            overrides: [],
        };
    }
    runOffline(ctx) {
        const offlineConflicts = this.offline.detectOfflineConflicts(ctx);
        this.offline.enqueue(ctx);
        const report = this.run({ ...ctx, offline: true, autoExecute: true });
        if (offlineConflicts.length) {
            report.execution.log.push(...offlineConflicts.map((c, i) => ({
                id: `offline-conf-${i}`,
                type: "conflict.resolve",
                status: "queued",
                title: c,
                reason: "Offline conflict detection",
                entityType: "worker",
                entityId: "0",
                overrideable: true,
                rollbackable: false,
            })));
        }
        return report;
    }
    syncOffline(runFn) {
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
    onEvent(ctx, event, data) {
        return this.run(this.events.applyEvent(ctx, event, data));
    }
    overrideAction(report, actionId, reason) {
        const action = report.execution.log.find((a) => a.id === actionId);
        if (!action || !action.overrideable)
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
        if (!action || !action.rollbackable)
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
exports.VeraAutonomousOperationsEngine = VeraAutonomousOperationsEngine;
//# sourceMappingURL=vera-autonomous-operations-engine.js.map