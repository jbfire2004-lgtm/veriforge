import type { AutonomousAction, ExecutionResult, OperationsContextInput } from "../types";
export declare class AutonomousExecutionEngine {
    execute(ctx: OperationsContextInput, actions: AutonomousAction[]): ExecutionResult;
    rollback(action: AutonomousAction, reason: string): AutonomousAction;
    override(action: AutonomousAction, reason: string): AutonomousAction;
}
//# sourceMappingURL=autonomous-execution.d.ts.map