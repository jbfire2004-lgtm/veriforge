import type { EnterpriseAction, EnterpriseContextInput, EnterpriseExecutionResult } from "../types";

export class EnterpriseExecutionEngine {
  execute(ctx: EnterpriseContextInput, actions: EnterpriseAction[]): EnterpriseExecutionResult {
    const executed: EnterpriseAction[] = [];
    const queued: EnterpriseAction[] = [];
    const failed: EnterpriseAction[] = [];
    const log: EnterpriseAction[] = [];
    const now = new Date().toISOString();

    const sorted = [...actions]
      .filter((a) => a.status !== "superseded")
      .sort((a, b) => b.priority - a.priority);

    for (const action of sorted) {
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

  override(action: EnterpriseAction, reason: string): EnterpriseAction {
    return {
      ...action,
      status: "overridden",
      metadata: { ...action.metadata, overrideReason: reason },
      executedAt: new Date().toISOString(),
    };
  }

  rollback(action: EnterpriseAction, reason: string): EnterpriseAction {
    return {
      ...action,
      status: "rolled_back",
      metadata: { ...action.metadata, rollbackReason: reason },
      executedAt: new Date().toISOString(),
    };
  }
}
