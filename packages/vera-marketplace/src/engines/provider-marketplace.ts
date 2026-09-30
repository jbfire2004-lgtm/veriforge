import type { CategoryMarketplace, MarketplaceContextInput } from "../types";
import { demandsFromContext, listingsFromContext, matchListingsToDemands } from "./marketplace-base";

export class ProviderMarketplaceEngine {
  run(ctx: MarketplaceContextInput): CategoryMarketplace {
    return matchListingsToDemands(
      listingsFromContext(ctx),
      demandsFromContext(ctx),
      "provider",
      (l) => (l.readinessScore > 80 ? ["high_quality_score"] : ["capacity_available"])
    );
  }
}
