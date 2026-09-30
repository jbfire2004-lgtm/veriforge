import type { AutomationModule, EnterpriseAction, EnterpriseActionStatus } from "../types";

let counter = 0;

export function enterpriseAction(
  partial: Omit<EnterpriseAction, "id" | "status"> & { status?: EnterpriseActionStatus }
): EnterpriseAction {
  counter += 1;
  return {
    id: `ent-${Date.now()}-${counter}`,
    status: partial.status ?? "pending",
    ...partial,
  };
}

export function priorityScore(factors: {
  safety?: number;
  compliance?: number;
  readiness?: number;
  operational?: number;
  cost?: number;
  risk?: number;
}): number {
  return Math.round(
    (factors.safety ?? 0) * 0.3 +
      (factors.compliance ?? 0) * 0.25 +
      (factors.readiness ?? 0) * 0.2 +
      (factors.operational ?? 0) * 0.15 +
      (factors.risk ?? 0) * 0.1 -
      (factors.cost ?? 0) * 0.05
  );
}

export function mapModuleActions(
  module: AutomationModule,
  phase: string,
  items: { type: string; title: string; reason: string; entityType: string; entityId: string; targetId?: string; priority?: number }[]
): EnterpriseAction[] {
  return items.map((item) =>
    enterpriseAction({
      module,
      phase,
      type: item.type,
      title: item.title,
      reason: item.reason,
      entityType: item.entityType,
      entityId: item.entityId,
      targetId: item.targetId,
      priority: item.priority ?? 50,
      overrideable: true,
      rollbackable: true,
    })
  );
}
