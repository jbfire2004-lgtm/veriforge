import { IndustryCoordinationEngine } from "../engines/industry-coordination";
import { IndustryPredictionEngine } from "../engines/industry-prediction";
import { IndustryOptimizationEngine } from "../engines/industry-optimization";
import { IndustryRiskEngine } from "../engines/industry-risk";
import { IndustryReadinessEngine } from "../engines/industry-readiness";
import { IndustryAutomationEngine } from "../engines/industry-automation";
import { IndustryTwinFederationEngine } from "../engines/industry-twin-federation";
import { IndustryKnowledgeGraphEngine } from "../engines/industry-knowledge-graph";
import { IndustryPolicyEngine } from "../engines/industry-policy";
import { IndustrySimulationEngine } from "../engines/industry-simulation";
import { IndustryAlertingEngine } from "../engines/industry-alerting";
import { OfflineEcosystemEngine } from "../engines/offline-ecosystem";
import { ingestNetworkReport } from "../integrations/phase-integration";
import type { GlobalNetworkReport } from "@vera/global-network";
import type { IndustryContextInput, IndustryDashboard, IndustryEcosystemReport } from "../types";

/**
 * Vera Autonomous Industry Ecosystem Engine (VAIEE)
 */
export class VeraIndustryEcosystemEngine {
  readonly coordination = new IndustryCoordinationEngine();
  readonly prediction = new IndustryPredictionEngine();
  readonly optimization = new IndustryOptimizationEngine();
  readonly risk = new IndustryRiskEngine();
  readonly readiness = new IndustryReadinessEngine();
  readonly automation = new IndustryAutomationEngine();
  readonly twinFederation = new IndustryTwinFederationEngine();
  readonly knowledgeGraph = new IndustryKnowledgeGraphEngine();
  readonly policies = new IndustryPolicyEngine();
  readonly simulation = new IndustrySimulationEngine();
  readonly alerting = new IndustryAlertingEngine();
  readonly offline = new OfflineEcosystemEngine();

  orchestrate(ctx: IndustryContextInput, network?: GlobalNetworkReport | null): IndustryEcosystemReport {
    const enriched = ingestNetworkReport(ctx, network);
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

  orchestrateOffline(ctx: IndustryContextInput, network?: GlobalNetworkReport | null): IndustryEcosystemReport {
    this.offline.enqueue(ctx);
    return this.orchestrate({ ...ctx, offline: true }, network);
  }

  syncOffline(network?: GlobalNetworkReport | null): IndustryEcosystemReport[] {
    return this.offline.drain().map((item) =>
      this.offline.markSynced(this.orchestrate({ ...item.context, offline: false }, network))
    );
  }

  private buildDashboard(
    ctx: IndustryContextInput,
    coordination: IndustryEcosystemReport["coordination"],
    prediction: IndustryEcosystemReport["prediction"],
    risk: IndustryEcosystemReport["risk"],
    readiness: IndustryEcosystemReport["readiness"],
    automation: IndustryEcosystemReport["automation"],
    alerts: IndustryEcosystemReport["alerts"],
    knowledgeGraph: IndustryEcosystemReport["knowledgeGraph"]
  ): IndustryDashboard {
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
