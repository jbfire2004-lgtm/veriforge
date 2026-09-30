import type { EnterpriseContextInput, MultiEntityAutomation } from "../types";
import { enterpriseAction, priorityScore } from "../utils/actions";

export class MultiEntityAutomationEngine {
  run(ctx: EnterpriseContextInput): MultiEntityAutomation {
    const balances: MultiEntityAutomation["balances"] = [];
    const actions: MultiEntityAutomation["actions"] = [];

    if ((ctx.projectCount ?? 0) > 1) {
      balances.push({ domain: "workers", action: "balance_across_projects", count: ctx.projectCount ?? 0 });
      actions.push(
        enterpriseAction({
          module: "multi_entity",
          type: "balance.workers",
          title: "Balance workers across projects",
          reason: "Multi-project workforce optimization",
          entityType: "company",
          entityId: ctx.companyId ?? "0",
          priority: priorityScore({ operational: 70, readiness: 60 }),
          overrideable: true,
          rollbackable: true,
        })
      );
    }

    if ((ctx.equipmentCount ?? 0) > 2) {
      balances.push({ domain: "equipment", action: "balance_across_projects", count: ctx.equipmentCount ?? 0 });
    }

    if (ctx.unionHallId) {
      balances.push({ domain: "dispatch", action: "balance_union_halls", count: 1 });
      actions.push(
        enterpriseAction({
          module: "multi_entity",
          type: "balance.dispatch",
          title: "Balance dispatch across union halls",
          reason: "Union hall workforce distribution",
          entityType: "unionHall",
          entityId: ctx.unionHallId,
          priority: priorityScore({ operational: 65 }),
          overrideable: true,
          rollbackable: true,
        })
      );
    }

    if ((ctx.nonCompliantWorkers ?? 0) > 0) {
      balances.push({
        domain: "compliance",
        action: "balance_company_compliance",
        count: ctx.nonCompliantWorkers ?? 0,
      });
    }

    return { balances, actions };
  }
}
