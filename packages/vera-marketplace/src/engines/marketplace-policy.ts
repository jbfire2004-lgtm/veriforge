import type { MarketplaceContextInput, MarketplacePolicy } from "../types";

export class MarketplacePolicyEngine {
  evaluate(ctx: MarketplaceContextInput): MarketplacePolicy[] {
    const nonCompliantListings = (ctx.listings ?? []).filter((l) => !l.complianceOk).length;
    const emergencyDemands = (ctx.demands ?? []).filter((d) => d.urgency === "emergency").length;

    return [
      { id: "mpol-safety-1", domain: "safety", rule: "Non-compliant resources cannot be listed", enforced: true, version: "1.0.0", violation: nonCompliantListings > 0 },
      { id: "mpol-compliance-1", domain: "compliance", rule: "Training marketplace requires valid competency path", enforced: true, version: "1.0.0" },
      { id: "mpol-dispatch-1", domain: "dispatch", rule: "Union rules override cross-company worker matches", enforced: true, version: "1.1.0" },
      { id: "mpol-equipment-1", domain: "equipment", rule: "Locked-out equipment excluded from exchange", enforced: true, version: "1.0.0" },
      { id: "mpol-data-1", domain: "data_sharing", rule: "Marketplace payloads must be anonymized", enforced: true, version: "2.0.0" },
      { id: "mpol-contract-1", domain: "contract", rule: "Cross-company exchange requires policy acceptance", enforced: true, version: "1.0.0" },
      { id: "mpol-payment-1", domain: "payment", rule: "Surge pricing capped at 2x base in regulated regions", enforced: true, version: "1.0.0" },
      { id: "mpol-training-1", domain: "training", rule: "Provider must be approved for listing category", enforced: true, version: "1.0.0", violation: emergencyDemands > 5 },
    ];
  }
}
