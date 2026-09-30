"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderMarketplaceEngine = void 0;
const marketplace_base_1 = require("./marketplace-base");
class ProviderMarketplaceEngine {
    run(ctx) {
        return (0, marketplace_base_1.matchListingsToDemands)((0, marketplace_base_1.listingsFromContext)(ctx), (0, marketplace_base_1.demandsFromContext)(ctx), "provider", (l) => (l.readinessScore > 80 ? ["high_quality_score"] : ["capacity_available"]));
    }
}
exports.ProviderMarketplaceEngine = ProviderMarketplaceEngine;
//# sourceMappingURL=provider-marketplace.js.map