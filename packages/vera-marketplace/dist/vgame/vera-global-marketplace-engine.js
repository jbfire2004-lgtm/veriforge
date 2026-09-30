"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraGlobalMarketplaceEngine = void 0;
const workforce_marketplace_1 = require("../engines/workforce-marketplace");
const equipment_marketplace_1 = require("../engines/equipment-marketplace");
const training_marketplace_1 = require("../engines/training-marketplace");
const provider_marketplace_1 = require("../engines/provider-marketplace");
const safety_services_marketplace_1 = require("../engines/safety-services-marketplace");
const compliance_services_marketplace_1 = require("../engines/compliance-services-marketplace");
const automation_marketplace_1 = require("../engines/automation-marketplace");
const marketplace_matching_1 = require("../engines/marketplace-matching");
const marketplace_pricing_1 = require("../engines/marketplace-pricing");
const marketplace_policy_1 = require("../engines/marketplace-policy");
const marketplace_reputation_1 = require("../engines/marketplace-reputation");
const marketplace_simulation_1 = require("../engines/marketplace-simulation");
const offline_marketplace_1 = require("../engines/offline-marketplace");
const phase_integration_1 = require("../integrations/phase-integration");
/**
 * Vera Global Autonomous Marketplace Engine (VGAME)
 */
class VeraGlobalMarketplaceEngine {
    constructor() {
        this.workforce = new workforce_marketplace_1.WorkforceMarketplaceEngine();
        this.equipment = new equipment_marketplace_1.EquipmentMarketplaceEngine();
        this.training = new training_marketplace_1.TrainingMarketplaceEngine();
        this.providers = new provider_marketplace_1.ProviderMarketplaceEngine();
        this.safetyServices = new safety_services_marketplace_1.SafetyServicesMarketplaceEngine();
        this.complianceServices = new compliance_services_marketplace_1.ComplianceServicesMarketplaceEngine();
        this.automation = new automation_marketplace_1.AutomationMarketplaceEngine();
        this.matching = new marketplace_matching_1.MarketplaceMatchingEngine();
        this.pricing = new marketplace_pricing_1.MarketplacePricingEngine();
        this.policies = new marketplace_policy_1.MarketplacePolicyEngine();
        this.reputation = new marketplace_reputation_1.MarketplaceReputationEngine();
        this.simulation = new marketplace_simulation_1.MarketplaceSimulationEngine();
        this.offline = new offline_marketplace_1.OfflineMarketplaceEngine();
    }
    run(ctx, network, industry) {
        const enriched = (0, phase_integration_1.ingestPhases)(ctx, network, industry);
        const workforce = this.workforce.run(enriched);
        const equipment = this.equipment.run(enriched);
        const training = this.training.run(enriched);
        const providers = this.providers.run(enriched);
        const safetyServices = this.safetyServices.run(enriched);
        const complianceServices = this.complianceServices.run(enriched);
        const automation = this.automation.run(enriched);
        const categories = [workforce, equipment, training, providers, safetyServices, complianceServices, automation];
        const matching = this.matching.match(enriched, categories);
        const pricing = this.pricing.price(enriched, matching);
        const policies = this.policies.evaluate(enriched);
        const reputation = this.reputation.score(enriched);
        const simulations = this.simulation.run(categories);
        const dashboard = this.buildDashboard(enriched, matching, workforce, equipment);
        return {
            generatedAt: new Date().toISOString(),
            context: enriched,
            workforce,
            equipment,
            training,
            providers,
            safetyServices,
            complianceServices,
            automation,
            matching,
            pricing,
            policies,
            reputation,
            simulations,
            dashboard,
        };
    }
    runOffline(ctx, network, industry) {
        this.offline.enqueue(ctx);
        return this.run({ ...ctx, offline: true }, network, industry);
    }
    syncOffline(network, industry) {
        return this.offline.drain().map((item) => this.offline.markSynced(this.run({ ...item.context, offline: false }, network, industry)));
    }
    buildDashboard(ctx, matching, workforce, equipment) {
        const scores = matching.matches.map((m) => m.score);
        const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        return {
            generatedAt: new Date().toISOString(),
            listingCount: ctx.listings?.length ?? 0,
            demandCount: ctx.demands?.length ?? 0,
            matchCount: matching.matches.length,
            transactionReady: matching.matches.filter((m) => m.score >= 75).length,
            avgMatchScore: Math.round(avg),
            workforceShortages: workforce.shortagePredictions.length,
            equipmentShortages: equipment.shortagePredictions.length,
        };
    }
}
exports.VeraGlobalMarketplaceEngine = VeraGlobalMarketplaceEngine;
//# sourceMappingURL=vera-global-marketplace-engine.js.map