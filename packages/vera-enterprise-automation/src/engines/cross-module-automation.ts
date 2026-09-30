import type { CrossModuleAutomation, EnterpriseContextInput } from "../types";
import { enterpriseAction, priorityScore } from "../utils/actions";

export class CrossModuleAutomationEngine {
  run(ctx: EnterpriseContextInput): CrossModuleAutomation {
    const chains: CrossModuleAutomation["chains"] = [];
    const actions: CrossModuleAutomation["actions"] = [];

    if ((ctx.expiringTraining ?? 0) > 0) {
      chains.push({
        id: "chain-training-expiry",
        trigger: "training.expired",
        steps: [
          "Auto-restrict worker",
          "Auto-reassign project role",
          "Notify supervisor",
          "Schedule training session",
        ],
      });
      actions.push(
        enterpriseAction({
          module: "cross_module",
          type: "chain.training_expiry",
          title: "Training expiry chain",
          reason: `${ctx.expiringTraining} workers with expiring training`,
          entityType: "company",
          entityId: ctx.companyId ?? "0",
          priority: priorityScore({ compliance: 90, safety: 50 }),
          overrideable: true,
          rollbackable: true,
        })
      );
    }

    if ((ctx.inspectionFailures ?? 0) > 0) {
      chains.push({
        id: "chain-inspection-fail",
        trigger: "inspection.failed",
        steps: [
          "Auto-lockout equipment",
          "Auto-reassign operator",
          "Notify mechanic",
          "Schedule maintenance",
        ],
      });
      actions.push(
        enterpriseAction({
          module: "cross_module",
          type: "chain.inspection_fail",
          title: "Inspection failure chain",
          reason: `${ctx.inspectionFailures} inspection failure(s)`,
          entityType: "company",
          entityId: ctx.companyId ?? "0",
          priority: priorityScore({ safety: 95, operational: 70 }),
          overrideable: true,
          rollbackable: true,
        })
      );
    }

    if (ctx.schedulingShortages?.length) {
      chains.push({
        id: "chain-readiness",
        trigger: "project.readiness_drop",
        steps: [
          "Auto-correct staffing",
          "Auto-correct equipment",
          "Trigger training",
        ],
      });
    }

    return { chains, actions };
  }
}
