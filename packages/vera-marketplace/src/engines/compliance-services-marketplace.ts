import type { CategoryMarketplace, MarketplaceContextInput } from "../types";
import { demandsFromContext, listingsFromContext, matchListingsToDemands } from "./marketplace-base";

export class ComplianceServicesMarketplaceEngine {
  run(ctx: MarketplaceContextInput): CategoryMarketplace {
    return matchListingsToDemands(
      listingsFromContext(ctx),
      demandsFromContext(ctx),
      "compliance_services",
      () => ["auditor_verified", "document_specialist"]
    );
  }
}
