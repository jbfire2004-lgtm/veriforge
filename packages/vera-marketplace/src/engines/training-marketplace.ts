import type { CategoryMarketplace, MarketplaceContextInput } from "../types";
import { demandsFromContext, listingsFromContext, matchListingsToDemands } from "./marketplace-base";

export class TrainingMarketplaceEngine {
  run(ctx: MarketplaceContextInput): CategoryMarketplace {
    return matchListingsToDemands(
      listingsFromContext(ctx),
      demandsFromContext(ctx),
      "training",
      () => ["provider_capacity", "compliance_rules"]
    );
  }
}
