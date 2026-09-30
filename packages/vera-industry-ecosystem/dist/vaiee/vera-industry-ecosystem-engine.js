"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraIndustryEcosystemEngine = void 0;
const industry_coordination_1 = require("../engines/industry-coordination");
const industry_prediction_1 = require("../engines/industry-prediction");
const industry_optimization_1 = require("../engines/industry-optimization");
const industry_risk_1 = require("../engines/industry-risk");
const industry_readiness_1 = require("../engines/industry-readiness");
const industry_automation_1 = require("../engines/industry-automation");
const industry_twin_federation_1 = require("../engines/industry-twin-federation");
const industry_knowledge_graph_1 = require("../engines/industry-knowledge-graph");
const industry_policy_1 = require("../engines/industry-policy");
const industry_simulation_1 = require("../engines/industry-simulation");
const industry_alerting_1 = require("../engines/industry-alerting");
const offline_ecosystem_1 = require("../engines/offline-ecosystem");
const phase_integration_1 = require("../integrations/phase-integration");
/**
 * Vera Autonomous Industry Ecosystem Engine (VAIEE)
 */
class VeraIndustryEcosystemEngine {
    constructor() {
        this.coordination = new industry_coordination_1.IndustryCoordinationEngine();
        this.prediction = new industry_prediction_1.IndustryPredictionEngine();
        this.optimization = new industry_optimization_1.IndustryOptimizationEngine();
        this.risk = new industry_risk_1.IndustryRiskEngine();
        this.readiness = new industry_readiness_1.IndustryReadinessEngine();
        this.automation = new industry_automation_1.IndustryAutomationEngine();
        this.twinFederation = new industry_twin_federation_1.IndustryTwinFederationEngine();
        this.knowledgeGraph = new industry_knowledge_graph_1.IndustryKnowledgeGraphEngine();
        this.policies = new industry_policy_1.IndustryPolicyEngine();
        this.simulation = new industry_simulation_1.IndustrySimulationEngine();
        this.alerting = new industry_alerting_1.IndustryAlertingEngine();
        this.offline = new offline_ecosystem_1.OfflineEcosystemEngine();
    }
    orchestrate(ctx, network) {
        const enriched = (0, phase_integration_1.ingestNetworkReport)(ctx, network);
        const coordination = this.coordination.coordinate(enriched);
        const prediction = this.prediction.predict(enriched);
        const optimization = this.optimization.optimize(enriched);
        const risk = this.risk.assess(enriched);
        const readiness = this.readiness.assess(enriched);
        const automation = this.automation.run(enriched);
        const twinFederation = this.twinFederation.federate(enriched);
        const knowledgeGraph = this.knowledgeGraph.build(enriched);
        const policies = this.policies.evaluate(enriched);
        const simulations = this.simulation.run(enriched);
        const alerts = this.alerting.generate(enriched, prediction, risk);
        const dashboard = this.buildDashboard(enriched, coordination, prediction, risk, readiness, automation, alerts, knowledgeGraph);
        return {
            generatedAt: new Date().toISOString(),
            context: enriched,
            coordination,
            prediction,
            optimization,
            risk,
            readiness,
            automation,
            twinFederation,
            knowledgeGraph,
            policies,
            simulations,
            alerts,
            dashboard,
        };
    }
    orchestrateOffline(ctx, network) {
        this.offline.enqueue(ctx);
        return this.orchestrate({ ...ctx, offline: true }, network);
    }
    syncOffline(network) {
        return this.offline.drain().map((item) => this.offline.markSynced(this.orchestrate({ ...item.context, offline: false }, network)));
    }
    buildDashboard(ctx, coordination, prediction, risk, readiness, automation, alerts, knowledgeGraph) {
        return {
            generatedAt: new Date().toISOString(),
            participantCount: ctx.participants?.length ?? 0,
            industryRiskScore: risk.industryScore,
            industryReadinessScore: readiness.industryReadinessScore,
            coordinationActions: coordination.actions.length,
            forecastCount: prediction.forecasts.length,
            automationActions: automation.actions.filter((a) => a.enabled).length,
            alertCount: alerts.length,
            graphNodes: knowledgeGraph.nodes.length,
        };
    }
}
exports.VeraIndustryEcosystemEngine = VeraIndustryEcosystemEngine;
//# sourceMappingURL=vera-industry-ecosystem-engine.js.map