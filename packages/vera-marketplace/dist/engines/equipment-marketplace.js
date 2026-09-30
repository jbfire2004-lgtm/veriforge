"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentMarketplaceEngine = void 0;
const marketplace_base_1 = require("./marketplace-base");
class EquipmentMarketplaceEngine {
    run(ctx) {
        return (0, marketplace_base_1.matchListingsToDemands)((0, marketplace_base_1.listingsFromContext)(ctx), (0, marketplace_base_1.demandsFromContext)(ctx), "equipment", (l) => (l.complianceOk ? ["inspection_clear", "no_lockout"] : ["maintenance_required"]));
    }
}
exports.EquipmentMarketplaceEngine = EquipmentMarketplaceEngine;
//# sourceMappingURL=equipment-marketplace.js.map