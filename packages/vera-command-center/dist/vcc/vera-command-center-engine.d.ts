import { RealtimeIntelligenceEngine } from "../engines/realtime-intelligence";
import { RealtimeRiskEngine } from "../engines/realtime-risk";
import { RealtimeReadinessEngine } from "../engines/realtime-readiness";
import { RealtimeAutomationEngine } from "../engines/realtime-automation";
import { RealtimeTwinEngine } from "../engines/realtime-twin";
import { CommandAgentsEngine } from "../engines/command-agents";
import { CommandAlertingEngine } from "../engines/alerting";
import { OfflineCommandEngine } from "../engines/offline-command";
import { CommandEventEngine } from "../engines/command-events";
import type { CommandCenterReport, CommandContextInput } from "../types";
/**
 * Vera Real-Time Intelligence Engine (VRTIE) — Command Center orchestrator
 */
export declare class VeraCommandCenterEngine {
    readonly intelligence: RealtimeIntelligenceEngine;
    readonly risk: RealtimeRiskEngine;
    readonly readiness: RealtimeReadinessEngine;
    readonly automation: RealtimeAutomationEngine;
    readonly twin: RealtimeTwinEngine;
    readonly agents: CommandAgentsEngine;
    readonly alerting: CommandAlertingEngine;
    readonly offline: OfflineCommandEngine;
    readonly events: CommandEventEngine;
    refresh(ctx: CommandContextInput): CommandCenterReport;
    refreshOffline(ctx: CommandContextInput): CommandCenterReport;
    syncOffline(): CommandCenterReport[];
    onEvent(ctx: CommandContextInput, event: string, data?: Record<string, unknown>): CommandCenterReport;
    private buildMap;
    private buildTimeline;
    private buildDashboard;
}
//# sourceMappingURL=vera-command-center-engine.d.ts.map