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
import type { AutonomousOperationsReport, OperationsContextInput } from "../types";
/**
 * Vera Autonomous Operations Engine (VAOE)
 */
export declare class VeraAutonomousOperationsEngine {
    readonly dispatch: AutoDispatchEngine;
    readonly assignment: AutoAssignmentEngine;
    readonly lockout: AutoLockoutEngine;
    readonly restriction: AutoRestrictionEngine;
    readonly roster: AutoRosterEngine;
    readonly conflicts: AutoConflictResolutionEngine;
    readonly readiness: AutoReadinessEngine;
    readonly execution: AutonomousExecutionEngine;
    readonly sync: AutonomousSyncEngine;
    readonly events: OperationsEventEngine;
    readonly offline: OfflineAutonomousEngine;
    run(ctx: OperationsContextInput): AutonomousOperationsReport;
    runOffline(ctx: OperationsContextInput): AutonomousOperationsReport;
    syncOffline(runFn: (ctx: OperationsContextInput) => AutonomousOperationsReport): AutonomousOperationsReport[];
    onEvent(ctx: OperationsContextInput, event: string, data?: Record<string, unknown>): AutonomousOperationsReport;
    overrideAction(report: AutonomousOperationsReport, actionId: string, reason: string): AutonomousOperationsReport;
    rollbackAction(report: AutonomousOperationsReport, actionId: string, reason: string): AutonomousOperationsReport;
    private buildDashboard;
}
//# sourceMappingURL=vera-autonomous-operations-engine.d.ts.map