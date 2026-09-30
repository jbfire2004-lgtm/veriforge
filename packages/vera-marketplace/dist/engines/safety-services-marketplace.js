"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyServicesMarketplaceEngine = void 0;
const marketplace_base_1 = require("./marketplace-base");
class SafetyServicesMarketplaceEngine {
    run(ctx) {
        return (0, marketplace_base_1.matchListingsToDemands)((0, marketplace_base_1.listingsFromContext)(ctx), (0, marketplace_base_1.demandsFromContext)(ctx), "safety_services", (_, d) => (d.urgency === "emergency" ? ["sif_heca_specialist"] : ["risk_tier_match"]));
    }
}
exports.SafetyServicesMarketplaceEngine = SafetyServicesMarketplaceEngine;
//# sourceMappingURL=safety-services-marketplace.js.map