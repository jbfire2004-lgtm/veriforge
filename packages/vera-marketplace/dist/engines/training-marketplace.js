"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingMarketplaceEngine = void 0;
const marketplace_base_1 = require("./marketplace-base");
class TrainingMarketplaceEngine {
    run(ctx) {
        return (0, marketplace_base_1.matchListingsToDemands)((0, marketplace_base_1.listingsFromContext)(ctx), (0, marketplace_base_1.demandsFromContext)(ctx), "training", () => ["provider_capacity", "compliance_rules"]);
    }
}
exports.TrainingMarketplaceEngine = TrainingMarketplaceEngine;
//# sourceMappingURL=training-marketplace.js.map