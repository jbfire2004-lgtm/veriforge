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
import { buildTwinSafetyOverlay } from "../integrations/twin-integration";
import type {
  AutonomousSafetyReport,
  SafetyContextInput,
  SafetyDashboardBundle,
} from "../types";

/**
 * Vera Autonomous Safety Engine (VASE)
 */
export class VeraAutonomousSafetyEngine {
  readonly sif = new SifPreventionEngine();
  readonly heca = new HecaIntelligenceEngine();
  readonly energyWheel = new EnergyWheelEngine();
  readonly hazards = new HazardPatternRecognitionEngine();
  readonly rootCause = new RootCausePredictionEngine();
  readonly intervention = new SafetyInterventionEngine();
  readonly automation = new SafetyAutomationEngine();
  readonly timeline = new SafetyTimelineEngine();
  readonly offline = new OfflineSafetyEngine();
  readonly events = new SafetyEventEngine();

  analyze(ctx: SafetyContextInput): AutonomousSafetyReport {
    const sif = this.sif.analyze(ctx);
    const heca = this.heca.analyze(ctx);
    const energyWheel = this.energyWheel.analyze(ctx);
    const hazards = this.hazards.analyze(ctx);
    const rootCause = this.rootCause.analyze(ctx);
    const interventions = this.intervention.evaluate(ctx, sif, heca, energyWheel);

    const core = {
      generatedAt: new Date().toISOString(),
      context: ctx,
      sif,
      heca,
      energyWheel,
      hazards,
      rootCause,
      interventions,
    };

    const automation = this.automation.generate(core);
    const twinOverlay = buildTwinSafetyOverlay(core);
    const withAutomation = { ...core, automation, twinOverlay };
    const timeline = this.timeline.build(withAutomation);
    const dashboard = this.buildDashboard(core, interventions);

    return {
      ...withAutomation,
      timeline,
      dashboard,
    };
  }

  analyzeOffline(ctx: SafetyContextInput): AutonomousSafetyReport {
    this.offline.enqueue(ctx);
    return this.analyze({ ...ctx, offline: true });
  }

  syncOffline(): AutonomousSafetyReport[] {
    return this.offline.drain().map((item) => this.offline.applyReport(this.analyze(item.context)));
  }

  onEvent(ctx: SafetyContextInput, event: string, data?: Record<string, unknown>): AutonomousSafetyReport {
    return this.analyze(this.events.applyEvent(ctx, event, data));
  }

  private buildDashboard(
    report: Omit<AutonomousSafetyReport, "dashboard" | "timeline" | "twinOverlay" | "automation">,
    interventions: AutonomousSafetyReport["interventions"]
  ): SafetyDashboardBundle {
    return {
      generatedAt: new Date().toISOString(),
      sif: {
        avgRisk: report.sif.riskScore.score,
        precursorCount: report.sif.precursors.length,
        alertCount: report.sif.precursors.filter((p) => p.confidence >= 0.7).length,
      },
      heca: {
        avgRisk: report.heca.riskScore.score,
        deviationCount: report.heca.deviations.length,
      },
      energyWheel: {
        conflictCount: report.energyWheel.conflicts.length,
        missingControlCount: report.energyWheel.missingControls.length,
      },
      hazardClusters: report.hazards.clusters.length,
      interventions,
      trends: report.hazards.trends.map((t) => ({ label: t.label, value: t.delta })),
    };
  }
}
