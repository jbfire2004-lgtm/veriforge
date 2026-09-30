"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraEnterpriseBrainEngine = void 0;
const enterprise_reasoning_1 = require("../engines/enterprise-reasoning");
const enterprise_planning_1 = require("../engines/enterprise-planning");
const enterprise_optimization_1 = require("../engines/enterprise-optimization");
const enterprise_prediction_1 = require("../engines/enterprise-prediction");
const enterprise_memory_1 = require("../engines/enterprise-memory");
const enterprise_context_1 = require("../engines/enterprise-context");
const enterprise_goals_1 = require("../engines/enterprise-goals");
const enterprise_policy_1 = require("../engines/enterprise-policy");
const enterprise_simulation_1 = require("../engines/enterprise-simulation");
const enterprise_decision_1 = require("../engines/enterprise-decision");
const offline_brain_1 = require("../engines/offline-brain");
const brain_events_1 = require("../engines/brain-events");
const phase_integration_1 = require("../integrations/phase-integration");
/**
 * Vera Autonomous Enterprise Brain (AEB)
 */
class VeraEnterpriseBrainEngine {
    constructor() {
        this.reasoning = new enterprise_reasoning_1.EnterpriseReasoningEngine();
        this.planning = new enterprise_planning_1.EnterprisePlanningEngine();
        this.optimization = new enterprise_optimization_1.EnterpriseOptimizationEngine();
        this.prediction = new enterprise_prediction_1.EnterprisePredictionEngine();
        this.memory = new enterprise_memory_1.EnterpriseMemoryEngine();
        this.context = new enterprise_context_1.EnterpriseContextEngine();
        this.goals = new enterprise_goals_1.EnterpriseGoalEngine();
        this.policies = new enterprise_policy_1.EnterprisePolicyEngine();
        this.simulation = new enterprise_simulation_1.EnterpriseSimulationEngine();
        this.decision = new enterprise_decision_1.EnterpriseDecisionEngine();
        this.offline = new offline_brain_1.OfflineBrainEngine();
        this.events = new brain_events_1.BrainEventEngine();
    }
    think(ctx) {
        const phases = (0, phase_integration_1.ingestAllPhases)(ctx);
        const goals = this.goals.resolve(ctx);
        const reasoning = this.reasoning.reason(ctx, phases);
        const planning = this.planning.plan(ctx, phases);
        const optimization = this.optimization.optimize(ctx, phases);
        const predictions = this.prediction.predict(ctx, phases);
        const memory = this.memory.recall(ctx, phases);
        const contextSnapshot = this.context.snapshot(ctx, phases);
        const policyRules = this.policies.evaluate(ctx);
        const simulations = this.simulation.run(ctx);
        const decisions = this.decision.decide(ctx, phases, reasoning, predictions, policyRules);
        const dashboard = this.buildDashboard(ctx, reasoning, planning, predictions, decisions, policyRules, simulations, memory, Math.max(0, 100 - phases.command.dashboard.risk.avg));
        return {
            generatedAt: new Date().toISOString(),
            context: ctx,
            reasoning,
            planning,
            optimization,
            predictions,
            memory,
            contextSnapshot,
            goals,
            policies: policyRules,
            simulations,
            decisions,
            commandCenterRef: phases.command.dashboard,
            dashboard,
        };
    }
    thinkOffline(ctx) {
        this.offline.enqueue(ctx);
        return this.think({ ...ctx, offline: true });
    }
    syncOffline() {
        return this.offline.drain().map((item) => this.offline.markSynced(this.think({ ...item.context, offline: false })));
    }
    onEvent(ctx, event, data) {
        return this.think(this.events.applyEvent(ctx, event, data));
    }
    buildDashboard(ctx, reasoning, planning, predictions, decisions, policies, simulations, memory, commandHealth) {
        const violations = policies.filter((p) => p.violation).length;
        let health = commandHealth;
        health -= violations * 8;
        health -= (ctx.sifPrecursors ?? 0) * 5;
        health = Math.max(0, Math.min(100, health));
        return {
            generatedAt: new Date().toISOString(),
            healthScore: health,
            reasoningSteps: reasoning.steps.length,
            planCount: planning.daily.length + planning.weekly.length + planning.monthly.length,
            predictionCount: predictions.length,
            decisionCount: decisions.length,
            policyViolations: violations,
            simulationCount: simulations.length,
            memoryEntries: memory.length,
        };
    }
}
exports.VeraEnterpriseBrainEngine = VeraEnterpriseBrainEngine;
//# sourceMappingURL=vera-enterprise-brain-engine.js.map