import { IndustryCoordinationEngine } from "../engines/industry-coordination";
import { IndustryPredictionEngine } from "../engines/industry-prediction";
import { IndustryOptimizationEngine } from "../engines/industry-optimization";
import { IndustryRiskEngine } from "../engines/industry-risk";
import { IndustryReadinessEngine } from "../engines/industry-readiness";
import { IndustryAutomationEngine } from "../engines/industry-automation";
import { IndustryTwinFederationEngine } from "../engines/industry-twin-federation";
import { IndustryKnowledgeGraphEngine } from "../engines/industry-knowledge-graph";
import { IndustryPolicyEngine } from "../engines/industry-policy";
import { IndustrySimulationEngine } from "../engines/industry-simulation";
import { IndustryAlertingEngine } from "../engines/industry-alerting";
import { OfflineEcosystemEngine } from "../engines/offline-ecosystem";
import type { GlobalNetworkReport } from "@vera/global-network";
import type { IndustryContextInput, IndustryEcosystemReport } from "../types";
/**
 * Vera Autonomous Industry Ecosystem Engine (VAIEE)
 */
export declare class VeraIndustryEcosystemEngine {
    readonly coordination: IndustryCoordinationEngine;
    readonly prediction: IndustryPredictionEngine;
    readonly optimization: IndustryOptimizationEngine;
    readonly risk: IndustryRiskEngine;
    readonly readiness: IndustryReadinessEngine;
    readonly automation: IndustryAutomationEngine;
    readonly twinFederation: IndustryTwinFederationEngine;
    readonly knowledgeGraph: IndustryKnowledgeGraphEngine;
    readonly policies: IndustryPolicyEngine;
    readonly simulation: IndustrySimulationEngine;
    readonly alerting: IndustryAlertingEngine;
    readonly offline: OfflineEcosystemEngine;
    orchestrate(ctx: IndustryContextInput, network?: GlobalNetworkReport | null): IndustryEcosystemReport;
    orchestrateOffline(ctx: IndustryContextInput, network?: GlobalNetworkReport | null): IndustryEcosystemReport;
    syncOffline(network?: GlobalNetworkReport | null): IndustryEcosystemReport[];
    private buildDashboard;
}
//# sourceMappingURL=vera-industry-ecosystem-engine.d.ts.map