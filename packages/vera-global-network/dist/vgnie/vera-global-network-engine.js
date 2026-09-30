"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraGlobalNetworkEngine = void 0;
const global_hazard_intelligence_1 = require("../engines/global-hazard-intelligence");
const global_safety_intelligence_1 = require("../engines/global-safety-intelligence");
const global_workforce_intelligence_1 = require("../engines/global-workforce-intelligence");
const global_equipment_intelligence_1 = require("../engines/global-equipment-intelligence");
const global_training_intelligence_1 = require("../engines/global-training-intelligence");
const global_compliance_intelligence_1 = require("../engines/global-compliance-intelligence");
const global_dispatch_intelligence_1 = require("../engines/global-dispatch-intelligence");
const global_automation_intelligence_1 = require("../engines/global-automation-intelligence");
const twin_federation_1 = require("../engines/twin-federation");
const knowledge_graph_1 = require("../engines/knowledge-graph");
const privacy_security_1 = require("../engines/privacy-security");
const global_alerting_1 = require("../engines/global-alerting");
const offline_network_1 = require("../engines/offline-network");
/**
 * Vera Global Network Intelligence Engine (VGNIE)
 */
class VeraGlobalNetworkEngine {
    constructor() {
        this.hazards = new global_hazard_intelligence_1.GlobalHazardIntelligenceEngine();
        this.safety = new global_safety_intelligence_1.GlobalSafetyIntelligenceEngine();
        this.workforce = new global_workforce_intelligence_1.GlobalWorkforceIntelligenceEngine();
        this.equipment = new global_equipment_intelligence_1.GlobalEquipmentIntelligenceEngine();
        this.training = new global_training_intelligence_1.GlobalTrainingIntelligenceEngine();
        this.compliance = new global_compliance_intelligence_1.GlobalComplianceIntelligenceEngine();
        this.dispatch = new global_dispatch_intelligence_1.GlobalDispatchIntelligenceEngine();
        this.automation = new global_automation_intelligence_1.GlobalAutomationIntelligenceEngine();
        this.twinFederation = new twin_federation_1.TwinFederationEngine();
        this.knowledgeGraph = new knowledge_graph_1.KnowledgeGraphEngine();
        this.privacy = new privacy_security_1.PrivacySecurityLayer();
        this.alerting = new global_alerting_1.GlobalAlertingEngine();
        this.offline = new offline_network_1.OfflineNetworkEngine();
    }
    analyze(ctx) {
        const hazards = this.hazards.analyze(ctx);
        const safety = this.safety.analyze(ctx);
        const workforce = this.workforce.analyze(ctx);
        const equipment = this.equipment.analyze(ctx);
        const training = this.training.analyze(ctx);
        const compliance = this.compliance.analyze(ctx);
        const dispatch = this.dispatch.analyze(ctx);
        const automation = this.automation.analyze(ctx);
        const twinFederation = this.twinFederation.federate(ctx);
        const knowledgeGraph = this.knowledgeGraph.build(ctx);
        const privacy = this.privacy.envelope(ctx);
        const alerts = this.alerting.generate(ctx, hazards, safety);
        const dashboard = this.buildDashboard(ctx, hazards, safety, compliance, workforce, equipment, dispatch, alerts, knowledgeGraph);
        return {
            generatedAt: new Date().toISOString(),
            context: ctx,
            hazards,
            safety,
            workforce,
            equipment,
            training,
            compliance,
            dispatch,
            automation,
            twinFederation,
            knowledgeGraph,
            privacy,
            alerts,
            dashboard,
        };
    }
    analyzeOffline(ctx) {
        this.offline.enqueue(ctx);
        return this.analyze({ ...ctx, offline: true });
    }
    syncOffline() {
        return this.offline.drain().map((item) => this.offline.markSynced(this.analyze({ ...item.context, offline: false })));
    }
    buildDashboard(ctx, hazards, safety, compliance, workforce, equipment, dispatch, alerts, knowledgeGraph) {
        return {
            generatedAt: new Date().toISOString(),
            companiesInNetwork: ctx.companies?.length ?? 0,
            hazardClusters: hazards.clusters.length,
            globalSafetyScore: safety.globalSafetyScore,
            globalComplianceScore: compliance.globalScore,
            workforceShortages: workforce.shortagePredictions.length,
            equipmentRisk: equipment.riskScore,
            dispatchDemand: dispatch.dispatchMap.reduce((s, d) => s + d.demand, 0),
            alertCount: alerts.length,
            graphNodes: knowledgeGraph.nodes.length,
        };
    }
}
exports.VeraGlobalNetworkEngine = VeraGlobalNetworkEngine;
//# sourceMappingURL=vera-global-network-engine.js.map