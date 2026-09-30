import type { IntelligenceModule } from "../types";

export type AutomationTaskType =
  | "notification"
  | "reminder"
  | "lockout"
  | "assignment"
  | "escalation"
  | "correction"
  | "tagging"
  | "cleanup"
  | "sync"
  | "retry";

export type AutomationTask = {
  id: string;
  type: AutomationTaskType;
  module: IntelligenceModule;
  title: string;
  payload: Record<string, unknown>;
  scheduledAt: string;
  status: "pending" | "running" | "completed" | "failed";
  retries: number;
};

export type AutomationRule = {
  id: string;
  type: AutomationTaskType;
  module: IntelligenceModule;
  condition: (ctx: Record<string, unknown>) => boolean;
  build: (ctx: Record<string, unknown>) => Omit<AutomationTask, "id" | "status" | "retries" | "scheduledAt">;
};

let taskId = 0;

export class AutomationEngine {
  private tasks: AutomationTask[] = [];
  private rules: AutomationRule[] = [];

  registerRule(rule: AutomationRule): void {
    this.rules.push(rule);
  }

  registerDefaultRules(): void {
    this.registerRule({
      id: "expiry-reminder",
      type: "reminder",
      module: "training",
      condition: (ctx) => (ctx.daysToExpiry as number) <= 30 && (ctx.daysToExpiry as number) > 0,
      build: (ctx) => ({
        type: "reminder",
        module: "training",
        title: `Training expires in ${ctx.daysToExpiry} days`,
        payload: { entityId: ctx.entityId },
      }),
    });
    this.registerRule({
      id: "lockout-trigger",
      type: "lockout",
      module: "equipment",
      condition: (ctx) => ctx.inspectionFailed === true,
      build: (ctx) => ({
        type: "lockout",
        module: "equipment",
        title: "Auto-lockout after inspection failure",
        payload: { equipmentId: ctx.equipmentId },
      }),
    });
    this.registerRule({
      id: "compliance-escalation",
      type: "escalation",
      module: "compliance",
      condition: (ctx) => (ctx.riskScore as number) >= 80,
      build: (ctx) => ({
        type: "escalation",
        module: "compliance",
        title: "High compliance risk — escalate to admin",
        payload: { companyId: ctx.companyId },
      }),
    });
    this.registerRule({
      id: "sync-retry",
      type: "retry",
      module: "offline",
      condition: (ctx) => ctx.syncFailed === true && (ctx.retries as number) < 3,
      build: (ctx) => ({
        type: "retry",
        module: "offline",
        title: "Retry offline sync batch",
        payload: { batchId: ctx.batchId },
      }),
    });
  }

  evaluate(ctx: Record<string, unknown>): AutomationTask[] {
    const created: AutomationTask[] = [];
    for (const rule of this.rules) {
      if (!rule.condition(ctx)) continue;
      const partial = rule.build(ctx);
      const task: AutomationTask = {
        id: `auto_${++taskId}`,
        ...partial,
        scheduledAt: new Date().toISOString(),
        status: "pending",
        retries: 0,
      };
      this.tasks.push(task);
      created.push(task);
    }
    return created;
  }

  getPending(): AutomationTask[] {
    return this.tasks.filter((t) => t.status === "pending");
  }

  markComplete(id: string): void {
    const t = this.tasks.find((x) => x.id === id);
    if (t) t.status = "completed";
  }

  getAll(): AutomationTask[] {
    return [...this.tasks];
  }
}
