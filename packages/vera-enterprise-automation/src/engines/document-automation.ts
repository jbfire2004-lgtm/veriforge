import type { EnterpriseContextInput, PhaseAutomationBundle } from "../types";
import { enterpriseAction, priorityScore } from "../utils/actions";

export class DocumentAutomationEngine {
  run(ctx: EnterpriseContextInput): PhaseAutomationBundle {
    const actions: PhaseAutomationBundle["actions"] = [];
    const insights: string[] = [];

    for (const doc of ctx.documents ?? []) {
      if ((doc.fraudScore ?? 0) > 0.7) {
        insights.push(`Fraud detected: document ${doc.id}`);
        actions.push(
          enterpriseAction({
            module: "document",
            phase: "VVE",
            type: "document.fraud_block",
            title: `Block fraudulent document ${doc.id}`,
            reason: `Fraud score ${doc.fraudScore}`,
            entityType: "document",
            entityId: doc.id,
            priority: priorityScore({ compliance: 90, safety: 60 }),
            overrideable: true,
            rollbackable: true,
          })
        );
      } else {
        actions.push(
          enterpriseAction({
            module: "document",
            phase: "VVE",
            type: "document.auto_map",
            title: `Auto-map document ${doc.id}`,
            reason: "Vision document pipeline",
            entityType: "document",
            entityId: doc.id,
            priority: priorityScore({ compliance: 50 }),
            overrideable: true,
            rollbackable: true,
          })
        );
      }
    }

    if (!ctx.documents?.length) {
      actions.push(
        enterpriseAction({
          module: "document",
          phase: "VVE",
          type: "document.scan_queue",
          title: "Process document scan queue",
          reason: "No pending documents in context",
          entityType: "company",
          entityId: ctx.companyId ?? "0",
          priority: 20,
          overrideable: false,
          rollbackable: false,
        })
      );
    }

    return { actions, insights };
  }
}
