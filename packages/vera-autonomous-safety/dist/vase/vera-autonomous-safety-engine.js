"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraAutonomousSafetyEngine = void 0;
const sif_prevention_1 = require("../engines/sif-prevention");
const heca_intelligence_1 = require("../engines/heca-intelligence");
const energy_wheel_1 = require("../engines/energy-wheel");
const hazard_patterns_1 = require("../engines/hazard-patterns");
const root_cause_prediction_1 = require("../engines/root-cause-prediction");
const safety_intervention_1 = require("../engines/safety-intervention");
const safety_automation_1 = require("../engines/safety-automation");
const safety_timeline_1 = require("../engines/safety-timeline");
const offline_safety_1 = require("../engines/offline-safety");
const safety_events_1 = require("../engines/safety-events");
const twin_integration_1 = require("../integrations/twin-integration");
/**
 * Vera Autonomous Safety Engine (VASE)
 */
class VeraAutonomousSafetyEngine {
    constructor() {
        this.sif = new sif_prevention_1.SifPreventionEngine();
        this.heca = new heca_intelligence_1.HecaIntelligenceEngine();
        this.energyWheel = new energy_wheel_1.EnergyWheelEngine();
        this.hazards = new hazard_patterns_1.HazardPatternRecognitionEngine();
        this.rootCause = new root_cause_prediction_1.RootCausePredictionEngine();
        this.intervention = new safety_intervention_1.SafetyInterventionEngine();
        this.automation = new safety_automation_1.SafetyAutomationEngine();
        this.timeline = new safety_timeline_1.SafetyTimelineEngine();
        this.offline = new offline_safety_1.OfflineSafetyEngine();
        this.events = new safety_events_1.SafetyEventEngine();
    }
    analyze(ctx) {
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
        const twinOverlay = (0, twin_integration_1.buildTwinSafetyOverlay)(core);
        const withAutomation = { ...core, automation, twinOverlay };
        const timeline = this.timeline.build(withAutomation);
        const dashboard = this.buildDashboard(core, interventions);
        return {
            ...withAutomation,
            timeline,
            dashboard,
        };
    }
    analyzeOffline(ctx) {
        this.offline.enqueue(ctx);
        return this.analyze({ ...ctx, offline: true });
    }
    syncOffline() {
        return this.offline.drain().map((item) => this.offline.applyReport(this.analyze(item.context)));
    }
    onEvent(ctx, event, data) {
        return this.analyze(this.events.applyEvent(ctx, event, data));
    }
    buildDashboard(report, interventions) {
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
exports.VeraAutonomousSafetyEngine = VeraAutonomousSafetyEngine;
//# sourceMappingURL=vera-autonomous-safety-engine.js.map