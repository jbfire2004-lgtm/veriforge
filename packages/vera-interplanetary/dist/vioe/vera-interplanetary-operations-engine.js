"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraInterplanetaryOperationsEngine = void 0;
const planetary_coordination_1 = require("../engines/planetary-coordination");
const orbital_coordination_1 = require("../engines/orbital-coordination");
const deep_space_coordination_1 = require("../engines/deep-space-coordination");
const delay_tolerant_ai_1 = require("../engines/delay-tolerant-ai");
const interplanetary_safety_1 = require("../engines/interplanetary-safety");
const interplanetary_automation_1 = require("../engines/interplanetary-automation");
const interplanetary_twin_1 = require("../engines/interplanetary-twin");
const knowledge_graph_1 = require("../engines/knowledge-graph");
const interplanetary_policy_1 = require("../engines/interplanetary-policy");
const interplanetary_simulation_1 = require("../engines/interplanetary-simulation");
const offline_interplanetary_1 = require("../engines/offline-interplanetary");
const phase_integration_1 = require("../integrations/phase-integration");
const scoring_1 = require("../utils/scoring");
/**
 * Vera Interplanetary Operations Engine (VIOE)
 */
class VeraInterplanetaryOperationsEngine {
    constructor() {
        this.planetary = new planetary_coordination_1.PlanetaryCoordinationEngine();
        this.orbital = new orbital_coordination_1.OrbitalCoordinationEngine();
        this.deepSpace = new deep_space_coordination_1.DeepSpaceCoordinationEngine();
        this.delayTolerant = new delay_tolerant_ai_1.DelayTolerantAiEngine();
        this.safety = new interplanetary_safety_1.InterplanetarySafetyEngine();
        this.automation = new interplanetary_automation_1.InterplanetaryAutomationEngine();
        this.twins = new interplanetary_twin_1.InterplanetaryTwinEngine();
        this.knowledgeGraph = new knowledge_graph_1.InterplanetaryKnowledgeGraphEngine();
        this.policies = new interplanetary_policy_1.InterplanetaryPolicyEngine();
        this.simulation = new interplanetary_simulation_1.InterplanetarySimulationEngine();
        this.offline = new offline_interplanetary_1.OfflineInterplanetaryEngine();
    }
    operate(ctx, marketplace, industry, network) {
        const enriched = (0, phase_integration_1.ingestPhases)(ctx, marketplace, industry, network);
        const planetary = this.planetary.coordinate(enriched);
        const orbital = this.orbital.coordinate(enriched);
        const deepSpace = this.deepSpace.coordinate(enriched);
        const delayTolerant = this.delayTolerant.run(enriched);
        const safety = this.safety.assess(enriched);
        const automation = this.automation.run(enriched);
        const twins = this.twins.hydrate(enriched);
        const knowledgeGraph = this.knowledgeGraph.build(enriched);
        const policies = this.policies.evaluate(enriched);
        const simulations = this.simulation.run(enriched);
        const dashboard = this.buildDashboard(enriched, planetary, safety, automation, delayTolerant);
        return {
            generatedAt: new Date().toISOString(),
            context: enriched,
            planetary,
            orbital,
            deepSpace,
            delayTolerant,
            safety,
            automation,
            twins,
            knowledgeGraph,
            policies,
            simulations,
            dashboard,
        };
    }
    operateOffline(ctx, marketplace, industry, network) {
        this.offline.enqueue(ctx);
        return this.operate({ ...ctx, offline: true }, marketplace, industry, network);
    }
    syncOffline(marketplace, industry, network) {
        return this.offline.drain().map((item) => this.offline.markSynced(this.operate({ ...item.context, offline: false }, marketplace, industry, network)));
    }
    buildDashboard(ctx, planetary, safety, automation, delayTolerant) {
        const sites = ctx.sites ?? [];
        const delays = sites.map((s) => s.commDelayMinutes ?? 0);
        const avgDelay = delays.length ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;
        return {
            generatedAt: new Date().toISOString(),
            siteCount: sites.length,
            activeLinks: planetary.links.filter((l) => l.status === "active").length,
            hazardCount: safety.hazards.length,
            automationCount: automation.actions.length,
            avgCommDelayMinutes: Math.round(avgDelay * 10) / 10,
            interplanetaryRiskScore: (0, scoring_1.clamp)(safety.evaRiskScore + safety.habitatRiskScore / 2),
        };
    }
}
exports.VeraInterplanetaryOperationsEngine = VeraInterplanetaryOperationsEngine;
//# sourceMappingURL=vera-interplanetary-operations-engine.js.map