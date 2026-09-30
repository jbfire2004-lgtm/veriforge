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
import type { GlobalNetworkReport } from "@vera/global-network";
import type { IndustryEcosystemReport } from "@vera/industry-ecosystem";
import type { MarketplaceContextInput, MarketplaceReport } from "../types";
/**
 * Vera Global Autonomous Marketplace Engine (VGAME)
 */
export declare class VeraGlobalMarketplaceEngine {
    readonly workforce: WorkforceMarketplaceEngine;
    readonly equipment: EquipmentMarketplaceEngine;
    readonly training: TrainingMarketplaceEngine;
    readonly providers: ProviderMarketplaceEngine;
    readonly safetyServices: SafetyServicesMarketplaceEngine;
    readonly complianceServices: ComplianceServicesMarketplaceEngine;
    readonly automation: AutomationMarketplaceEngine;
    readonly matching: MarketplaceMatchingEngine;
    readonly pricing: MarketplacePricingEngine;
    readonly policies: MarketplacePolicyEngine;
    readonly reputation: MarketplaceReputationEngine;
    readonly simulation: MarketplaceSimulationEngine;
    readonly offline: OfflineMarketplaceEngine;
    run(ctx: MarketplaceContextInput, network?: GlobalNetworkReport | null, industry?: IndustryEcosystemReport | null): MarketplaceReport;
    runOffline(ctx: MarketplaceContextInput, network?: GlobalNetworkReport | null, industry?: IndustryEcosystemReport | null): MarketplaceReport;
    syncOffline(network?: GlobalNetworkReport | null, industry?: IndustryEcosystemReport | null): MarketplaceReport[];
    private buildDashboard;
}
//# sourceMappingURL=vera-global-marketplace-engine.d.ts.map