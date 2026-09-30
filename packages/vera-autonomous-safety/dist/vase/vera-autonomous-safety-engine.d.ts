import { SifPreventionEngine } from "../engines/sif-prevention";
import { HecaIntelligenceEngine } from "../engines/heca-intelligence";
import { EnergyWheelEngine } from "../engines/energy-wheel";
import { HazardPatternRecognitionEngine } from "../engines/hazard-patterns";
import { RootCausePredictionEngine } from "../engines/root-cause-prediction";
import { SafetyInterventionEngine } from "../engines/safety-intervention";
import { SafetyAutomationEngine } from "../engines/safety-automation";
import { SafetyTimelineEngine } from "../engines/safety-timeline";
import { OfflineSafetyEngine } from "../engines/offline-safety";
import { SafetyEventEngine } from "../engines/safety-events";
import type { AutonomousSafetyReport, SafetyContextInput } from "../types";
/**
 * Vera Autonomous Safety Engine (VASE)
 */
export declare class VeraAutonomousSafetyEngine {
    readonly sif: SifPreventionEngine;
    readonly heca: HecaIntelligenceEngine;
    readonly energyWheel: EnergyWheelEngine;
    readonly hazards: HazardPatternRecognitionEngine;
    readonly rootCause: RootCausePredictionEngine;
    readonly intervention: SafetyInterventionEngine;
    readonly automation: SafetyAutomationEngine;
    readonly timeline: SafetyTimelineEngine;
    readonly offline: OfflineSafetyEngine;
    readonly events: SafetyEventEngine;
    analyze(ctx: SafetyContextInput): AutonomousSafetyReport;
    analyzeOffline(ctx: SafetyContextInput): AutonomousSafetyReport;
    syncOffline(): AutonomousSafetyReport[];
    onEvent(ctx: SafetyContextInput, event: string, data?: Record<string, unknown>): AutonomousSafetyReport;
    private buildDashboard;
}
//# sourceMappingURL=vera-autonomous-safety-engine.d.ts.map