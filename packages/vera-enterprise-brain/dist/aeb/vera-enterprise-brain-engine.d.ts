import { EnterpriseReasoningEngine } from "../engines/enterprise-reasoning";
import { EnterprisePlanningEngine } from "../engines/enterprise-planning";
import { EnterpriseOptimizationEngine } from "../engines/enterprise-optimization";
import { EnterprisePredictionEngine } from "../engines/enterprise-prediction";
import { EnterpriseMemoryEngine } from "../engines/enterprise-memory";
import { EnterpriseContextEngine } from "../engines/enterprise-context";
import { EnterpriseGoalEngine } from "../engines/enterprise-goals";
import { EnterprisePolicyEngine } from "../engines/enterprise-policy";
import { EnterpriseSimulationEngine } from "../engines/enterprise-simulation";
import { EnterpriseDecisionEngine } from "../engines/enterprise-decision";
import { OfflineBrainEngine } from "../engines/offline-brain";
import { BrainEventEngine } from "../engines/brain-events";
import type { BrainContextInput, EnterpriseBrainReport } from "../types";
/**
 * Vera Autonomous Enterprise Brain (AEB)
 */
export declare class VeraEnterpriseBrainEngine {
    readonly reasoning: EnterpriseReasoningEngine;
    readonly planning: EnterprisePlanningEngine;
    readonly optimization: EnterpriseOptimizationEngine;
    readonly prediction: EnterprisePredictionEngine;
    readonly memory: EnterpriseMemoryEngine;
    readonly context: EnterpriseContextEngine;
    readonly goals: EnterpriseGoalEngine;
    readonly policies: EnterprisePolicyEngine;
    readonly simulation: EnterpriseSimulationEngine;
    readonly decision: EnterpriseDecisionEngine;
    readonly offline: OfflineBrainEngine;
    readonly events: BrainEventEngine;
    think(ctx: BrainContextInput): EnterpriseBrainReport;
    thinkOffline(ctx: BrainContextInput): EnterpriseBrainReport;
    syncOffline(): EnterpriseBrainReport[];
    onEvent(ctx: BrainContextInput, event: string, data?: Record<string, unknown>): EnterpriseBrainReport;
    private buildDashboard;
}
//# sourceMappingURL=vera-enterprise-brain-engine.d.ts.map