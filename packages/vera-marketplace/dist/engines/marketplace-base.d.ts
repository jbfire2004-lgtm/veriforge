import type { CategoryMarketplace, MarketplaceContextInput, MarketplaceDemand, MarketplaceListing } from "../types";
export declare function matchListingsToDemands(listings: MarketplaceListing[], demands: MarketplaceDemand[], category: string, extraFactors: (l: MarketplaceListing, d: MarketplaceDemand) => string[]): CategoryMarketplace;
export declare function listingsFromContext(ctx: MarketplaceContextInput): MarketplaceListing[];
export declare function demandsFromContext(ctx: MarketplaceContextInput): MarketplaceDemand[];
//# sourceMappingURL=marketplace-base.d.ts.map