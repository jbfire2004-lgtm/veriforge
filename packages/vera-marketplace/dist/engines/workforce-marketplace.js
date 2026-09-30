"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkforceMarketplaceEngine = void 0;
const marketplace_base_1 = require("./marketplace-base");
class WorkforceMarketplaceEngine {
    run(ctx) {
        return (0, marketplace_base_1.matchListingsToDemands)((0, marketplace_base_1.listingsFromContext)(ctx), (0, marketplace_base_1.demandsFromContext)(ctx), "workforce", (l, d) => {
            const factors = [];
            if (l.skills?.length)
                factors.push("competency_aligned");
            if (d.urgency === "high")
                factors.push("union_rules_checked");
            return factors;
        });
    }
}
exports.WorkforceMarketplaceEngine = WorkforceMarketplaceEngine;
//# sourceMappingURL=workforce-marketplace.js.map