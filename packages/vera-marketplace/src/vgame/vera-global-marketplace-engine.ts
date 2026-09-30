import { WorkforceMarketplaceEngine } from "../engines/workforce-marketplace";
import { EquipmentMarketplaceEngine } from "../engines/equipment-marketplace";
import { TrainingMarketplaceEngine } from "../engines/training-marketplace";
import { ProviderMarketplaceEngine } from "../engines/provider-marketplace";
import { SafetyServicesMarketplaceEngine } from "../engines/safety-services-marketplace";
import { ComplianceServicesMarketplaceEngine } from "../engines/compliance-services-marketplace";
import { AutomationMarketplaceEngine } from "../engines/automation-marketplace";
import { MarketplaceMatchingEngine } from "../engines/marketplace-matching";
import { MarketplacePricingEngine } from "../engines/marketplace-pricing";
import { MarketplacePolicyEngine } from "../engines/marketplace-policy";
import { MarketplaceReputationEngine } from "../engines/marketplace-reputation";
import { MarketplaceSimulationEngine } from "../engines/marketplace-simulation";
import { OfflineMarketplaceEngine } from "../engines/offline-marketplace";
import { ingestPhases } from "../integrations/phase-integration";
import type { GlobalNetworkReport } from "@vera/global-network";
import type { IndustryEcosystemReport } from "@vera/industry-ecosystem";
import type { MarketplaceContextInput, MarketplaceDashboard, MarketplaceReport } from "../types";

/**
 * Vera Global Autonomous Marketplace Engine (VGAME)
 */
export class VeraGlobalMarketplaceEngine {
  readonly workforce = new WorkforceMarketplaceEngine();
  readonly equipment = new EquipmentMarketplaceEngine();
  readonly training = new TrainingMarketplaceEngine();
  readonly providers = new ProviderMarketplaceEngine();
  readonly safetyServices = new SafetyServicesMarketplaceEngine();
  readonly complianceServices = new ComplianceServicesMarketplaceEngine();
  readonly automation = new AutomationMarketplaceEngine();
  readonly matching = new MarketplaceMatchingEngine();
  readonly pricing = new MarketplacePricingEngine();
  readonly policies = new MarketplacePolicyEngine();
  readonly reputation = new MarketplaceReputationEngine();
  readonly simulation = new MarketplaceSimulationEngine();
  readonly offline = new OfflineMarketplaceEngine();

  run(
    ctx: MarketplaceContextInput,
    network?: GlobalNetworkReport | null,
    industry?: IndustryEcosystemReport | null
  ): MarketplaceReport {
    const enriched = ingestPhases(ctx, network, industry);

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

  runOffline(
    ctx: MarketplaceContextInput,
    network?: GlobalNetworkReport | null,
    industry?: IndustryEcosystemReport | null
  ): MarketplaceReport {
    this.offline.enqueue(ctx);
    return this.run({ ...ctx, offline: true }, network, industry);
  }

  syncOffline(network?: GlobalNetworkReport | null, industry?: IndustryEcosystemReport | null): MarketplaceReport[] {
    return this.offline.drain().map((item) =>
      this.offline.markSynced(this.run({ ...item.context, offline: false }, network, industry))
    );
  }

  private buildDashboard(
    ctx: MarketplaceContextInput,
    matching: MarketplaceReport["matching"],
    workforce: MarketplaceReport["workforce"],
    equipment: MarketplaceReport["equipment"]
  ): MarketplaceDashboard {
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
