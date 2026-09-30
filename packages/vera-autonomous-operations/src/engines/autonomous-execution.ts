import type { AutonomousAction, ExecutionResult, OperationsContextInput } from "../types";

export class AutonomousExecutionEngine {
  execute(
    ctx: OperationsContextInput,
    actions: AutonomousAction[]
  ): ExecutionResult {
    const executed: AutonomousAction[] = [];
    const queued: AutonomousAction[] = [];
    const failed: AutonomousAction[] = [];
    const log: AutonomousAction[] = [];
    const now = new Date().toISOString();

    for (const action of actions) {
      const copy = { ...action };
      if (ctx.offline) {
        copy.status = "queued";
        queued.push(copy);
        log.push({ ...copy, executedAt: now });
        continue;
      }

      if (ctx.autoExecute === false) {
        copy.status = "pending";
        log.push(copy);
        continue;
      }

      try {
        copy.status = "executed";
        copy.executedAt = now;
        executed.push(copy);
        log.push(copy);
      } catch {
        copy.status = "failed";
        failed.push(copy);
        log.push(copy);
      }
    }

    return { executed, queued, failed, log };
  }

  rollback(action: AutonomousAction, reason: string): AutonomousAction {
    return {
      ...action,
      status: "rolled_back",
      metadata: { ...action.metadata, rollbackReason: reason },
      executedAt: new Date().toISOString(),
    };
  }

  override(action: AutonomousAction, reason: string): AutonomousAction {
    return {
      ...action,
      status: "overridden",
      metadata: { ...action.metadata, overrideReason: reason },
      executedAt: new Date().toISOString(),
    };
  }
}
