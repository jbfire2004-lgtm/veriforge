import type { EnterpriseContextInput, PhaseAutomationBundle, TwinEnterpriseOverlay } from "../types";
import { enterpriseAction, priorityScore } from "../utils/actions";

export class TwinAutomationEngine {
  run(ctx: EnterpriseContextInput): PhaseAutomationBundle & { overlay: TwinEnterpriseOverlay } {
    const actions: PhaseAutomationBundle["actions"] = [];
    const updated: TwinEnterpriseOverlay["updated"] = [];
    const predictions: TwinEnterpriseOverlay["predictions"] = [];

    const types = ["worker", "equipment", "project", "company", "provider", "unionHall"] as const;
    for (const type of types) {
      if (type === "unionHall" && !ctx.unionHallId) continue;
      if (type === "provider") continue;
      updated.push({
        type,
        id: type === "company" ? ctx.companyId ?? "0" : ctx.companyId ?? "0",
        fields: ["compliance", "risk", "readiness", "predictions"],
      });
      actions.push(
        enterpriseAction({
          module: "twin",
          phase: "VDTE",
          type: `twin.update_${type}`,
          title: `Update ${type} twin`,
          reason: "Enterprise automation sync",
          entityType: type,
          entityId: type === "unionHall" ? ctx.unionHallId! : ctx.companyId ?? "0",
          priority: priorityScore({ readiness: 60 }),
          overrideable: false,
          rollbackable: false,
        })
      );
    }

    if ((ctx.nonCompliantWorkers ?? 0) > 0) {
      predictions.push({
        entityId: ctx.companyId ?? "0",
        label: "Compliance decline",
        probability: 0.65,
      });
    }

    return {
      actions,
      insights: [`${updated.length} twin types updated`],
      overlay: { updated, predictions },
    };
  }
}
