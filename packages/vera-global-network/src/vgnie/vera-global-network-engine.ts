import { GlobalHazardIntelligenceEngine } from "../engines/global-hazard-intelligence";
import { GlobalSafetyIntelligenceEngine } from "../engines/global-safety-intelligence";
import { GlobalWorkforceIntelligenceEngine } from "../engines/global-workforce-intelligence";
import { GlobalEquipmentIntelligenceEngine } from "../engines/global-equipment-intelligence";
import { GlobalTrainingIntelligenceEngine } from "../engines/global-training-intelligence";
import { GlobalComplianceIntelligenceEngine } from "../engines/global-compliance-intelligence";
import { GlobalDispatchIntelligenceEngine } from "../engines/global-dispatch-intelligence";
import { GlobalAutomationIntelligenceEngine } from "../engines/global-automation-intelligence";
import { TwinFederationEngine } from "../engines/twin-federation";
import { KnowledgeGraphEngine } from "../engines/knowledge-graph";
import { PrivacySecurityLayer } from "../engines/privacy-security";
import { GlobalAlertingEngine } from "../engines/global-alerting";
import { OfflineNetworkEngine } from "../engines/offline-network";
import type {
  GlobalNetworkDashboard,
  GlobalNetworkReport,
  NetworkContextInput,
} from "../types";

/**
 * Vera Global Network Intelligence Engine (VGNIE)
 */
export class VeraGlobalNetworkEngine {
  readonly hazards = new GlobalHazardIntelligenceEngine();
  readonly safety = new GlobalSafetyIntelligenceEngine();
  readonly workforce = new GlobalWorkforceIntelligenceEngine();
  readonly equipment = new GlobalEquipmentIntelligenceEngine();
  readonly training = new GlobalTrainingIntelligenceEngine();
  readonly compliance = new GlobalComplianceIntelligenceEngine();
  readonly dispatch = new GlobalDispatchIntelligenceEngine();
  readonly automation = new GlobalAutomationIntelligenceEngine();
  readonly twinFederation = new TwinFederationEngine();
  readonly knowledgeGraph = new KnowledgeGraphEngine();
  readonly privacy = new PrivacySecurityLayer();
  readonly alerting = new GlobalAlertingEngine();
  readonly offline = new OfflineNetworkEngine();

  analyze(ctx: NetworkContextInput): GlobalNetworkReport {
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

  analyzeOffline(ctx: NetworkContextInput): GlobalNetworkReport {
    this.offline.enqueue(ctx);
    return this.analyze({ ...ctx, offline: true });
  }

  syncOffline(): GlobalNetworkReport[] {
    return this.offline.drain().map((item) =>
      this.offline.markSynced(this.analyze({ ...item.context, offline: false }))
    );
  }

  private buildDashboard(
    ctx: NetworkContextInput,
    hazards: GlobalNetworkReport["hazards"],
    safety: GlobalNetworkReport["safety"],
    compliance: GlobalNetworkReport["compliance"],
    workforce: GlobalNetworkReport["workforce"],
    equipment: GlobalNetworkReport["equipment"],
    dispatch: GlobalNetworkReport["dispatch"],
    alerts: GlobalNetworkReport["alerts"],
    knowledgeGraph: GlobalNetworkReport["knowledgeGraph"]
  ): GlobalNetworkDashboard {
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
