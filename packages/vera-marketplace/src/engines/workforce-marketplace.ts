import type { CategoryMarketplace, MarketplaceContextInput } from "../types";
import { demandsFromContext, listingsFromContext, matchListingsToDemands } from "./marketplace-base";

export class WorkforceMarketplaceEngine {
  run(ctx: MarketplaceContextInput): CategoryMarketplace {
    return matchListingsToDemands(
      listingsFromContext(ctx),
      demandsFromContext(ctx),
      "workforce",
      (l, d) => {
        const factors: string[] = [];
        if (l.skills?.length) factors.push("competency_aligned");
        if (d.urgency === "high") factors.push("union_rules_checked");
        return factors;
      }
    );
  }
}
