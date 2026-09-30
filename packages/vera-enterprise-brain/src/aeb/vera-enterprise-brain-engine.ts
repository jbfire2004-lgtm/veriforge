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
import { ingestAllPhases } from "../integrations/phase-integration";
import type { BrainContextInput, BrainDashboardBundle, EnterpriseBrainReport } from "../types";

/**
 * Vera Autonomous Enterprise Brain (AEB)
 */
export class VeraEnterpriseBrainEngine {
  readonly reasoning = new EnterpriseReasoningEngine();
  readonly planning = new EnterprisePlanningEngine();
  readonly optimization = new EnterpriseOptimizationEngine();
  readonly prediction = new EnterprisePredictionEngine();
  readonly memory = new EnterpriseMemoryEngine();
  readonly context = new EnterpriseContextEngine();
  readonly goals = new EnterpriseGoalEngine();
  readonly policies = new EnterprisePolicyEngine();
  readonly simulation = new EnterpriseSimulationEngine();
  readonly decision = new EnterpriseDecisionEngine();
  readonly offline = new OfflineBrainEngine();
  readonly events = new BrainEventEngine();

  think(ctx: BrainContextInput): EnterpriseBrainReport {
    const phases = ingestAllPhases(ctx);
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

    const dashboard = this.buildDashboard(
      ctx,
      reasoning,
      planning,
      predictions,
      decisions,
      policyRules,
      simulations,
      memory,
      Math.max(0, 100 - phases.command.dashboard.risk.avg)
    );

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
      commandCenterRef: phases.command.dashboard as unknown as Record<string, unknown>,
      dashboard,
    };
  }

  thinkOffline(ctx: BrainContextInput): EnterpriseBrainReport {
    this.offline.enqueue(ctx);
    return this.think({ ...ctx, offline: true });
  }

  syncOffline(): EnterpriseBrainReport[] {
    return this.offline.drain().map((item) =>
      this.offline.markSynced(this.think({ ...item.context, offline: false }))
    );
  }

  onEvent(
    ctx: BrainContextInput,
    event: string,
    data?: Record<string, unknown>
  ): EnterpriseBrainReport {
    return this.think(this.events.applyEvent(ctx, event, data));
  }

  private buildDashboard(
    ctx: BrainContextInput,
    reasoning: EnterpriseBrainReport["reasoning"],
    planning: EnterpriseBrainReport["planning"],
    predictions: EnterpriseBrainReport["predictions"],
    decisions: EnterpriseBrainReport["decisions"],
    policies: EnterpriseBrainReport["policies"],
    simulations: EnterpriseBrainReport["simulations"],
    memory: EnterpriseBrainReport["memory"],
    commandHealth: number
  ): BrainDashboardBundle {
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
