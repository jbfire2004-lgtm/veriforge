import type { EnterpriseContextInput, PhaseAutomationBundle } from "../types";
import { enterpriseAction, priorityScore } from "../utils/actions";

export class ComplianceAutomationEngine {
  run(ctx: EnterpriseContextInput): PhaseAutomationBundle {
    const actions: PhaseAutomationBundle["actions"] = [];
    const insights: string[] = [];

    if ((ctx.nonCompliantWorkers ?? 0) > 0) {
      insights.push(`${ctx.nonCompliantWorkers} workers non-compliant`);
      actions.push(
        enterpriseAction({
          module: "compliance",
          type: "compliance.trigger_training",
          title: "Trigger compliance training",
          reason: "Non-compliant workers detected",
          entityType: "company",
          entityId: ctx.companyId ?? "0",
          priority: priorityScore({ compliance: 95 }),
          overrideable: true,
          rollbackable: false,
        })
      );
    }

    if ((ctx.inspectionFailures ?? 0) > 0) {
      actions.push(
        enterpriseAction({
          module: "compliance",
          type: "compliance.trigger_inspection",
          title: "Schedule compliance inspections",
          reason: "Failed inspections",
          entityType: "company",
          entityId: ctx.companyId ?? "0",
          priority: priorityScore({ compliance: 85, safety: 70 }),
          overrideable: true,
          rollbackable: false,
        })
      );
    }

    if ((ctx.lockedEquipment ?? 0) > 0) {
      actions.push(
        enterpriseAction({
          module: "compliance",
          type: "compliance.lockout",
          title: "Maintain equipment lockouts",
          reason: "Locked equipment pending clearance",
          entityType: "company",
          entityId: ctx.companyId ?? "0",
          priority: priorityScore({ safety: 90 }),
          overrideable: true,
          rollbackable: true,
        })
      );
    }

    actions.push(
      enterpriseAction({
        module: "compliance",
        type: "compliance.report",
        title: "Generate compliance report",
        reason: "Scheduled compliance automation",
        entityType: "company",
        entityId: ctx.companyId ?? "0",
        priority: 30,
        overrideable: false,
        rollbackable: false,
      })
    );

    return { actions, insights };
  }
}
