"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceServicesMarketplaceEngine = void 0;
const marketplace_base_1 = require("./marketplace-base");
class ComplianceServicesMarketplaceEngine {
    run(ctx) {
        return (0, marketplace_base_1.matchListingsToDemands)((0, marketplace_base_1.listingsFromContext)(ctx), (0, marketplace_base_1.demandsFromContext)(ctx), "compliance_services", () => ["auditor_verified", "document_specialist"]);
    }
}
exports.ComplianceServicesMarketplaceEngine = ComplianceServicesMarketplaceEngine;
//# sourceMappingURL=compliance-services-marketplace.js.map