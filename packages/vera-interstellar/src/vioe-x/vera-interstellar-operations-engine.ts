import { StarSystemCoordinationEngine } from "../engines/star-system-coordination";
import { GenerationShipCoordinationEngine } from "../engines/generation-ship-coordination";
import { ProbeCoordinationEngine } from "../engines/probe-coordination";
import { ReplicatingColonyCoordinationEngine } from "../engines/replicating-colony-coordination";
import { LightYearDelayAiEngine } from "../engines/light-year-delay-ai";
import { InterstellarSafetyEngine } from "../engines/interstellar-safety";
import { InterstellarAutomationEngine } from "../engines/interstellar-automation";
import { InterstellarTwinEngine } from "../engines/interstellar-twin";
import { InterstellarKnowledgeGraphEngine } from "../engines/knowledge-graph";
import { InterstellarPolicyEngine } from "../engines/interstellar-policy";
import { InterstellarSimulationEngine } from "../engines/interstellar-simulation";
import { OfflineInterstellarEngine } from "../engines/offline-interstellar";
import { ingestPhases } from "../integrations/phase-integration";
import type { InterplanetaryReport } from "@vera/interplanetary";
import type { MarketplaceReport } from "@vera/marketplace";
import type { InterstellarContextInput, InterstellarDashboard, InterstellarReport } from "../types";
import { SYSTEM_DELAYS_YEARS, clamp } from "../utils/scoring";

/**
 * Vera Interstellar Operations Engine (VIOE-X)
 */
export class VeraInterstellarOperationsEngine {
  readonly starSystems = new StarSystemCoordinationEngine();
  readonly generationShips = new GenerationShipCoordinationEngine();
  readonly probes = new ProbeCoordinationEngine();
  readonly replicatingColonies = new ReplicatingColonyCoordinationEngine();
  readonly lightYearDelay = new LightYearDelayAiEngine();
  readonly safety = new InterstellarSafetyEngine();
  readonly automation = new InterstellarAutomationEngine();
  readonly twins = new InterstellarTwinEngine();
  readonly knowledgeGraph = new InterstellarKnowledgeGraphEngine();
  readonly policies = new InterstellarPolicyEngine();
  readonly simulation = new InterstellarSimulationEngine();
  readonly offline = new OfflineInterstellarEngine();

  expand(
    ctx: InterstellarContextInput,
    interplanetary?: InterplanetaryReport | null,
    marketplace?: MarketplaceReport | null
  ): InterstellarReport {
    const enriched = ingestPhases(ctx, interplanetary, marketplace);
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

  expandOffline(
    ctx: InterstellarContextInput,
    interplanetary?: InterplanetaryReport | null,
    marketplace?: MarketplaceReport | null
  ): InterstellarReport {
    this.offline.enqueue(ctx);
    return this.expand({ ...ctx, offline: true }, interplanetary, marketplace);
  }

  syncOffline(
    interplanetary?: InterplanetaryReport | null,
    marketplace?: MarketplaceReport | null
  ): InterstellarReport[] {
    return this.offline.drain().map((item) =>
      this.offline.markSynced(this.expand({ ...item.context, offline: false }, interplanetary, marketplace))
    );
  }

  private buildDashboard(
    ctx: InterstellarContextInput,
    starSystems: InterstellarReport["starSystems"],
    safety: InterstellarReport["safety"],
    automation: InterstellarReport["automation"],
    lightYearDelay: InterstellarReport["lightYearDelay"]
  ): InterstellarDashboard {
    const assets = ctx.assets ?? [];
    const delays = assets.map((a) => a.commDelayYears ?? SYSTEM_DELAYS_YEARS[a.system] ?? 0);
    const avgDelay = delays.length ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;

    return {
      generatedAt: new Date().toISOString(),
      assetCount: assets.length,
      systemCount: new Set(assets.map((a) => a.system)).size,
      hazardCount: safety.hazards.length,
      automationCount: automation.actions.length,
      avgDelayYears: Math.round(avgDelay * 100) / 100,
      interstellarRiskScore: clamp(safety.cryosleepRisk + safety.habitatRisk / 2),
      missionIntegrity: lightYearDelay.missionIntegrity,
    };
  }
}
