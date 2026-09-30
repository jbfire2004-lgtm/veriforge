import type { EnterpriseContextInput, PhaseAutomationBundle } from "../types";
import { enterpriseAction, priorityScore } from "../utils/actions";

export class DataAutomationEngine {
  run(ctx: EnterpriseContextInput): PhaseAutomationBundle {
    const actions: PhaseAutomationBundle["actions"] = [];
    const insights: string[] = [];

    actions.push(
      enterpriseAction({
        module: "data",
        type: "data.validate_integrity",
        title: "Validate data integrity",
        reason: "Scheduled enterprise data pass",
        entityType: "company",
        entityId: ctx.companyId ?? "0",
        priority: priorityScore({ compliance: 40 }),
        overrideable: false,
        rollbackable: false,
      })
    );

    if ((ctx.workerCount ?? 0) > 50) {
      insights.push("Large worker set — deduplication scan recommended");
      actions.push(
        enterpriseAction({
          module: "data",
          type: "data.deduplicate",
          title: "Deduplicate worker records",
          reason: "High worker count anomaly threshold",
          entityType: "company",
          entityId: ctx.companyId ?? "0",
          priority: 35,
          overrideable: true,
          rollbackable: true,
        })
      );
    }

    if (ctx.offline) {
      actions.push(
        enterpriseAction({
          module: "data",
          type: "data.sync_offline",
          title: "Sync offline data batch",
          reason: "Offline mode active",
          entityType: "company",
          entityId: ctx.companyId ?? "0",
          priority: priorityScore({ operational: 80 }),
          overrideable: false,
          rollbackable: false,
          status: "queued",
        })
      );
    }

    return { actions, insights };
  }
}
