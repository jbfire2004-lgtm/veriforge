import { PlanetaryCoordinationEngine } from "../engines/planetary-coordination";
import { OrbitalCoordinationEngine } from "../engines/orbital-coordination";
import { DeepSpaceCoordinationEngine } from "../engines/deep-space-coordination";
import { DelayTolerantAiEngine } from "../engines/delay-tolerant-ai";
import { InterplanetarySafetyEngine } from "../engines/interplanetary-safety";
import { InterplanetaryAutomationEngine } from "../engines/interplanetary-automation";
import { InterplanetaryTwinEngine } from "../engines/interplanetary-twin";
import { InterplanetaryKnowledgeGraphEngine } from "../engines/knowledge-graph";
import { InterplanetaryPolicyEngine } from "../engines/interplanetary-policy";
import { InterplanetarySimulationEngine } from "../engines/interplanetary-simulation";
import { OfflineInterplanetaryEngine } from "../engines/offline-interplanetary";
import { ingestPhases } from "../integrations/phase-integration";
import type { GlobalNetworkReport } from "@vera/global-network";
import type { IndustryEcosystemReport } from "@vera/industry-ecosystem";
import type { MarketplaceReport } from "@vera/marketplace";
import type { InterplanetaryContextInput, InterplanetaryDashboard, InterplanetaryReport } from "../types";
import { clamp } from "../utils/scoring";

/**
 * Vera Interplanetary Operations Engine (VIOE)
 */
export class VeraInterplanetaryOperationsEngine {
  readonly planetary = new PlanetaryCoordinationEngine();
  readonly orbital = new OrbitalCoordinationEngine();
  readonly deepSpace = new DeepSpaceCoordinationEngine();
  readonly delayTolerant = new DelayTolerantAiEngine();
  readonly safety = new InterplanetarySafetyEngine();
  readonly automation = new InterplanetaryAutomationEngine();
  readonly twins = new InterplanetaryTwinEngine();
  readonly knowledgeGraph = new InterplanetaryKnowledgeGraphEngine();
  readonly policies = new InterplanetaryPolicyEngine();
  readonly simulation = new InterplanetarySimulationEngine();
  readonly offline = new OfflineInterplanetaryEngine();

  operate(
    ctx: InterplanetaryContextInput,
    marketplace?: MarketplaceReport | null,
    industry?: IndustryEcosystemReport | null,
    network?: GlobalNetworkReport | null
  ): InterplanetaryReport {
    const enriched = ingestPhases(ctx, marketplace, industry, network);
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

  operateOffline(
    ctx: InterplanetaryContextInput,
    marketplace?: MarketplaceReport | null,
    industry?: IndustryEcosystemReport | null,
    network?: GlobalNetworkReport | null
  ): InterplanetaryReport {
    this.offline.enqueue(ctx);
    return this.operate({ ...ctx, offline: true }, marketplace, industry, network);
  }

  syncOffline(
    marketplace?: MarketplaceReport | null,
    industry?: IndustryEcosystemReport | null,
    network?: GlobalNetworkReport | null
  ): InterplanetaryReport[] {
    return this.offline.drain().map((item) =>
      this.offline.markSynced(this.operate({ ...item.context, offline: false }, marketplace, industry, network))
    );
  }

  private buildDashboard(
    ctx: InterplanetaryContextInput,
    planetary: InterplanetaryReport["planetary"],
    safety: InterplanetaryReport["safety"],
    automation: InterplanetaryReport["automation"],
    delayTolerant: InterplanetaryReport["delayTolerant"]
  ): InterplanetaryDashboard {
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
      interplanetaryRiskScore: clamp(safety.evaRiskScore + safety.habitatRiskScore / 2),
    };
  }
}
