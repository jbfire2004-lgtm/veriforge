import { StarSystemCoordinationEngine } from "../engines/star-system-coordination";
import { GenerationShipCoordinationEngine } from "../engines/generation-ship-coordination";
import { ProbeCoordinationEngine } from "../engines/probe-coordination";
import { ReplicatingColonyCoordinationEngine } from "../engines/replicating-colony-coordination";
import { LightYearDelayAiEngine } from "../engines/light-year-delay-ai";
import { InterstellarSafetyEngine } from "../engines/interstellar-safety";
import { InterstellarAutomationEngine } from "../engines/interstellar-automation";
import { InterstellarTwinEngine } from "../engines/interstellar-twin";
import { InterstellarKnowledgeGraphEngine } from "../engines/knowledge-graph";
import { InterstellarPolicyEngine } from "../engines/interstellar-policy";
import { InterstellarSimulationEngine } from "../engines/interstellar-simulation";
import { OfflineInterstellarEngine } from "../engines/offline-interstellar";
import type { InterplanetaryReport } from "@vera/interplanetary";
import type { MarketplaceReport } from "@vera/marketplace";
import type { InterstellarContextInput, InterstellarReport } from "../types";
/**
 * Vera Interstellar Operations Engine (VIOE-X)
 */
export declare class VeraInterstellarOperationsEngine {
    readonly starSystems: StarSystemCoordinationEngine;
    readonly generationShips: GenerationShipCoordinationEngine;
    readonly probes: ProbeCoordinationEngine;
    readonly replicatingColonies: ReplicatingColonyCoordinationEngine;
    readonly lightYearDelay: LightYearDelayAiEngine;
    readonly safety: InterstellarSafetyEngine;
    readonly automation: InterstellarAutomationEngine;
    readonly twins: InterstellarTwinEngine;
    readonly knowledgeGraph: InterstellarKnowledgeGraphEngine;
    readonly policies: InterstellarPolicyEngine;
    readonly simulation: InterstellarSimulationEngine;
    readonly offline: OfflineInterstellarEngine;
    expand(ctx: InterstellarContextInput, interplanetary?: InterplanetaryReport | null, marketplace?: MarketplaceReport | null): InterstellarReport;
    expandOffline(ctx: InterstellarContextInput, interplanetary?: InterplanetaryReport | null, marketplace?: MarketplaceReport | null): InterstellarReport;
    syncOffline(interplanetary?: InterplanetaryReport | null, marketplace?: MarketplaceReport | null): InterstellarReport[];
    private buildDashboard;
}
//# sourceMappingURL=vera-interstellar-operations-engine.d.ts.map