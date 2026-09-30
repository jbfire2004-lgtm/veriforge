import type { CategoryMarketplace, MarketplaceContextInput } from "../types";
import { demandsFromContext, listingsFromContext, matchListingsToDemands } from "./marketplace-base";

export class EquipmentMarketplaceEngine {
  run(ctx: MarketplaceContextInput): CategoryMarketplace {
    return matchListingsToDemands(
      listingsFromContext(ctx),
      demandsFromContext(ctx),
      "equipment",
      (l) => (l.complianceOk ? ["inspection_clear", "no_lockout"] : ["maintenance_required"])
    );
  }
}
