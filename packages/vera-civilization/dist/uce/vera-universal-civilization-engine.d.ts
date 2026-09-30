import { CivilizationGovernanceEngine } from "../engines/civilization-governance";
import { CivilizationEthicsEngine } from "../engines/civilization-ethics";
import { CivilizationStabilityEngine } from "../engines/civilization-stability";
import { CivilizationGrowthEngine } from "../engines/civilization-growth";
import { CivilizationSustainabilityEngine } from "../engines/civilization-sustainability";
import { CivilizationKnowledgeEngine } from "../engines/civilization-knowledge";
import { CivilizationCoordinationEngine } from "../engines/civilization-coordination";
import { CivilizationSimulationEngine } from "../engines/civilization-simulation";
import { CivilizationDecisionEngine } from "../engines/civilization-decision";
import { CivilizationMemoryEngine } from "../engines/civilization-memory";
import { OfflineCivilizationEngine } from "../engines/offline-civilization";
import type { InterstellarReport } from "@vera/interstellar";
import type { CivilizationContextInput, CivilizationReport } from "../types";
/**
 * Vera Universal Civilization Engine (UCE)
 */
export declare class VeraUniversalCivilizationEngine {
    readonly governance: CivilizationGovernanceEngine;
    readonly ethics: CivilizationEthicsEngine;
    readonly stability: CivilizationStabilityEngine;
    readonly growth: CivilizationGrowthEngine;
    readonly sustainability: CivilizationSustainabilityEngine;
    readonly knowledge: CivilizationKnowledgeEngine;
    readonly coordination: CivilizationCoordinationEngine;
    readonly simulation: CivilizationSimulationEngine;
    readonly decision: CivilizationDecisionEngine;
    readonly memory: CivilizationMemoryEngine;
    readonly offline: OfflineCivilizationEngine;
    govern(ctx: CivilizationContextInput, interstellar?: InterstellarReport | null): CivilizationReport;
    governOffline(ctx: CivilizationContextInput, interstellar?: InterstellarReport | null): CivilizationReport;
    syncOffline(interstellar?: InterstellarReport | null): CivilizationReport[];
    private buildDashboard;
}
//# sourceMappingURL=vera-universal-civilization-engine.d.ts.map