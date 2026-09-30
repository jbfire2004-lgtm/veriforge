import { PlanetaryCoordinationEngine } from "../engines/planetary-coordination";
import { OrbitalCoordinationEngine } from "../engines/orbital-coordination";
import { DeepSpaceCoordinationEngine } from "../engines/deep-space-coordination";
import { DelayTolerantAiEngine } from "../engines/delay-tolerant-ai";
import { InterplanetarySafetyEngine } from "../engines/interplanetary-safety";
import { InterplanetaryAutomationEngine } from "../engines/interplanetary-automation";
import { InterplanetaryTwinEngine } from "../engines/interplanetary-twin";
import { InterplanetaryKnowledgeGraphEngine } from "../engines/knowledge-graph";
import { InterplanetaryPolicyEngine } from "../engines/interplanetary-policy";
import { InterplanetarySimulationEngine } from "../engines/interplanetary-simulation";
import { OfflineInterplanetaryEngine } from "../engines/offline-interplanetary";
import type { GlobalNetworkReport } from "@vera/global-network";
import type { IndustryEcosystemReport } from "@vera/industry-ecosystem";
import type { MarketplaceReport } from "@vera/marketplace";
import type { InterplanetaryContextInput, InterplanetaryReport } from "../types";
/**
 * Vera Interplanetary Operations Engine (VIOE)
 */
export declare class VeraInterplanetaryOperationsEngine {
    readonly planetary: PlanetaryCoordinationEngine;
    readonly orbital: OrbitalCoordinationEngine;
    readonly deepSpace: DeepSpaceCoordinationEngine;
    readonly delayTolerant: DelayTolerantAiEngine;
    readonly safety: InterplanetarySafetyEngine;
    readonly automation: InterplanetaryAutomationEngine;
    readonly twins: InterplanetaryTwinEngine;
    readonly knowledgeGraph: InterplanetaryKnowledgeGraphEngine;
    readonly policies: InterplanetaryPolicyEngine;
    readonly simulation: InterplanetarySimulationEngine;
    readonly offline: OfflineInterplanetaryEngine;
    operate(ctx: InterplanetaryContextInput, marketplace?: MarketplaceReport | null, industry?: IndustryEcosystemReport | null, network?: GlobalNetworkReport | null): InterplanetaryReport;
    operateOffline(ctx: InterplanetaryContextInput, marketplace?: MarketplaceReport | null, industry?: IndustryEcosystemReport | null, network?: GlobalNetworkReport | null): InterplanetaryReport;
    syncOffline(marketplace?: MarketplaceReport | null, industry?: IndustryEcosystemReport | null, network?: GlobalNetworkReport | null): InterplanetaryReport[];
    private buildDashboard;
}
//# sourceMappingURL=vera-interplanetary-operations-engine.d.ts.map