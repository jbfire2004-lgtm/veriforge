import type { IndustryContextInput, IndustryPolicy } from "../types";

export class IndustryPolicyEngine {
  evaluate(ctx: IndustryContextInput): IndustryPolicy[] {
    const p = ctx.participants ?? [];
    const sif = p.reduce((s, x) => s + (x.sifForms ?? 0), 0);
    const gaps = p.reduce((s, x) => s + (x.nonCompliantWorkers ?? 0), 0);

    const policies: IndustryPolicy[] = [
      { id: "pol-safety-1", domain: "safety", rule: "SIF precursors require industry broadcast within 24h", enforced: true, version: "1.0.0", violation: sif > 3 },
      { id: "pol-compliance-1", domain: "compliance", rule: "Compliance drift >10% triggers federated recalc", enforced: true, version: "1.0.0", violation: gaps > 20 },
      { id: "pol-training-1", domain: "training", rule: "Expiry clusters must route to provider pool", enforced: true, version: "1.0.0" },
      { id: "pol-dispatch-1", domain: "dispatch", rule: "Double-dispatch prohibited across halls", enforced: true, version: "1.1.0" },
      { id: "pol-scheduling-1", domain: "scheduling", rule: "Cross-contractor staffing must respect union rules", enforced: true, version: "1.0.0" },
      { id: "pol-equipment-1", domain: "equipment", rule: "Lockout patterns shared only as anonymized signals", enforced: true, version: "1.0.0" },
      { id: "pol-data-1", domain: "data_sharing", rule: "No PII in federated payloads", enforced: true, version: "2.0.0" },
    ];

    return policies;
  }
}
