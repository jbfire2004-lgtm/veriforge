"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraInterstellarOperationsEngine = void 0;
const star_system_coordination_1 = require("../engines/star-system-coordination");
const generation_ship_coordination_1 = require("../engines/generation-ship-coordination");
const probe_coordination_1 = require("../engines/probe-coordination");
const replicating_colony_coordination_1 = require("../engines/replicating-colony-coordination");
const light_year_delay_ai_1 = require("../engines/light-year-delay-ai");
const interstellar_safety_1 = require("../engines/interstellar-safety");
const interstellar_automation_1 = require("../engines/interstellar-automation");
const interstellar_twin_1 = require("../engines/interstellar-twin");
const knowledge_graph_1 = require("../engines/knowledge-graph");
const interstellar_policy_1 = require("../engines/interstellar-policy");
const interstellar_simulation_1 = require("../engines/interstellar-simulation");
const offline_interstellar_1 = require("../engines/offline-interstellar");
const phase_integration_1 = require("../integrations/phase-integration");
const scoring_1 = require("../utils/scoring");
/**
 * Vera Interstellar Operations Engine (VIOE-X)
 */
class VeraInterstellarOperationsEngine {
    constructor() {
        this.starSystems = new star_system_coordination_1.StarSystemCoordinationEngine();
        this.generationShips = new generation_ship_coordination_1.GenerationShipCoordinationEngine();
        this.probes = new probe_coordination_1.ProbeCoordinationEngine();
        this.replicatingColonies = new replicating_colony_coordination_1.ReplicatingColonyCoordinationEngine();
        this.lightYearDelay = new light_year_delay_ai_1.LightYearDelayAiEngine();
        this.safety = new interstellar_safety_1.InterstellarSafetyEngine();
        this.automation = new interstellar_automation_1.InterstellarAutomationEngine();
        this.twins = new interstellar_twin_1.InterstellarTwinEngine();
        this.knowledgeGraph = new knowledge_graph_1.InterstellarKnowledgeGraphEngine();
        this.policies = new interstellar_policy_1.InterstellarPolicyEngine();
        this.simulation = new interstellar_simulation_1.InterstellarSimulationEngine();
        this.offline = new offline_interstellar_1.OfflineInterstellarEngine();
    }
    expand(ctx, interplanetary, marketplace) {
        const enriched = (0, phase_integration_1.ingestPhases)(ctx, interplanetary, marketplace);
        const starSystems = this.starSystems.coordinate(enriched);
        const generationShips = this.generationShips.coordinate(enriched);
        const probes = this.probes.coordinate(enriched);
        const replicatingColonies = this.replicatingColonies.coordinate(enriched);
        const lightYearDelay = this.lightYearDelay.run(enriched);
        const safety = this.safety.assess(enriched);
        const automation = this.automation.run(enriched);
        const twins = this.twins.hydrate(enriched);
        const knowledgeGraph = this.knowledgeGraph.build(enriched);
        const policies = this.policies.evaluate(enriched);
        const simulations = this.simulation.run(enriched);
        const dashboard = this.buildDashboard(enriched, starSystems, safety, automation, lightYearDelay);
        return {
            generatedAt: new Date().toISOString(),
            context: enriched,
            starSystems,
            generationShips,
            probes,
            replicatingColonies,
            lightYearDelay,
            safety,
            automation,
            twins,
            knowledgeGraph,
            policies,
            simulations,
            dashboard,
        };
    }
    expandOffline(ctx, interplanetary, marketplace) {
        this.offline.enqueue(ctx);
        return this.expand({ ...ctx, offline: true }, interplanetary, marketplace);
    }
    syncOffline(interplanetary, marketplace) {
        return this.offline.drain().map((item) => this.offline.markSynced(this.expand({ ...item.context, offline: false }, interplanetary, marketplace)));
    }
    buildDashboard(ctx, starSystems, safety, automation, lightYearDelay) {
        const assets = ctx.assets ?? [];
        const delays = assets.map((a) => a.commDelayYears ?? scoring_1.SYSTEM_DELAYS_YEARS[a.system] ?? 0);
        const avgDelay = delays.length ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;
        return {
            generatedAt: new Date().toISOString(),
            assetCount: assets.length,
            systemCount: new Set(assets.map((a) => a.system)).size,
            hazardCount: safety.hazards.length,
            automationCount: automation.actions.length,
            avgDelayYears: Math.round(avgDelay * 100) / 100,
            interstellarRiskScore: (0, scoring_1.clamp)(safety.cryosleepRisk + safety.habitatRisk / 2),
            missionIntegrity: lightYearDelay.missionIntegrity,
        };
    }
}
exports.VeraInterstellarOperationsEngine = VeraInterstellarOperationsEngine;
//# sourceMappingURL=vera-interstellar-operations-engine.js.map