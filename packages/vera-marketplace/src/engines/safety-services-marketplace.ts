import type { CategoryMarketplace, MarketplaceContextInput } from "../types";
import { demandsFromContext, listingsFromContext, matchListingsToDemands } from "./marketplace-base";

export class SafetyServicesMarketplaceEngine {
  run(ctx: MarketplaceContextInput): CategoryMarketplace {
    return matchListingsToDemands(
      listingsFromContext(ctx),
      demandsFromContext(ctx),
      "safety_services",
      (_, d) => (d.urgency === "emergency" ? ["sif_heca_specialist"] : ["risk_tier_match"])
    );
  }
}
