import { GlobalHazardIntelligenceEngine } from "../engines/global-hazard-intelligence";
import { GlobalSafetyIntelligenceEngine } from "../engines/global-safety-intelligence";
import { GlobalWorkforceIntelligenceEngine } from "../engines/global-workforce-intelligence";
import { GlobalEquipmentIntelligenceEngine } from "../engines/global-equipment-intelligence";
import { GlobalTrainingIntelligenceEngine } from "../engines/global-training-intelligence";
import { GlobalComplianceIntelligenceEngine } from "../engines/global-compliance-intelligence";
import { GlobalDispatchIntelligenceEngine } from "../engines/global-dispatch-intelligence";
import { GlobalAutomationIntelligenceEngine } from "../engines/global-automation-intelligence";
import { TwinFederationEngine } from "../engines/twin-federation";
import { KnowledgeGraphEngine } from "../engines/knowledge-graph";
import { PrivacySecurityLayer } from "../engines/privacy-security";
import { GlobalAlertingEngine } from "../engines/global-alerting";
import { OfflineNetworkEngine } from "../engines/offline-network";
import type { GlobalNetworkReport, NetworkContextInput } from "../types";
/**
 * Vera Global Network Intelligence Engine (VGNIE)
 */
export declare class VeraGlobalNetworkEngine {
    readonly hazards: GlobalHazardIntelligenceEngine;
    readonly safety: GlobalSafetyIntelligenceEngine;
    readonly workforce: GlobalWorkforceIntelligenceEngine;
    readonly equipment: GlobalEquipmentIntelligenceEngine;
    readonly training: GlobalTrainingIntelligenceEngine;
    readonly compliance: GlobalComplianceIntelligenceEngine;
    readonly dispatch: GlobalDispatchIntelligenceEngine;
    readonly automation: GlobalAutomationIntelligenceEngine;
    readonly twinFederation: TwinFederationEngine;
    readonly knowledgeGraph: KnowledgeGraphEngine;
    readonly privacy: PrivacySecurityLayer;
    readonly alerting: GlobalAlertingEngine;
    readonly offline: OfflineNetworkEngine;
    analyze(ctx: NetworkContextInput): GlobalNetworkReport;
    analyzeOffline(ctx: NetworkContextInput): GlobalNetworkReport;
    syncOffline(): GlobalNetworkReport[];
    private buildDashboard;
}
//# sourceMappingURL=vera-global-network-engine.d.ts.map