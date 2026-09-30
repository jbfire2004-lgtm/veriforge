import { CivilizationGovernanceEngine } from "../engines/civilization-governance";
import { CivilizationEthicsEngine } from "../engines/civilization-ethics";
import { CivilizationStabilityEngine } from "../engines/civilization-stability";
import { CivilizationGrowthEngine } from "../engines/civilization-growth";
import { CivilizationSustainabilityEngine } from "../engines/civilization-sustainability";
import { CivilizationKnowledgeEngine } from "../engines/civilization-knowledge";
import { CivilizationCoordinationEngine } from "../engines/civilization-coordination";
import { CivilizationSimulationEngine } from "../engines/civilization-simulation";
import { CivilizationDecisionEngine } from "../engines/civilization-decision";
import { CivilizationMemoryEngine } from "../engines/civilization-memory";
import { OfflineCivilizationEngine } from "../engines/offline-civilization";
import { ingestPhases } from "../integrations/phase-integration";
import type { InterstellarReport } from "@vera/interstellar";
import type { CivilizationContextInput, CivilizationDashboard, CivilizationReport } from "../types";

/**
 * Vera Universal Civilization Engine (UCE)
 */
export class VeraUniversalCivilizationEngine {
  readonly governance = new CivilizationGovernanceEngine();
  readonly ethics = new CivilizationEthicsEngine();
  readonly stability = new CivilizationStabilityEngine();
  readonly growth = new CivilizationGrowthEngine();
  readonly sustainability = new CivilizationSustainabilityEngine();
  readonly knowledge = new CivilizationKnowledgeEngine();
  readonly coordination = new CivilizationCoordinationEngine();
  readonly simulation = new CivilizationSimulationEngine();
  readonly decision = new CivilizationDecisionEngine();
  readonly memory = new CivilizationMemoryEngine();
  readonly offline = new OfflineCivilizationEngine();

  govern(ctx: CivilizationContextInput, interstellar?: InterstellarReport | null): CivilizationReport {
    const enriched = ingestPhases(ctx, interstellar);
    const governance = this.governance.govern(enriched);
    const ethics = this.ethics.evaluate(enriched);
    const stability = this.stability.assess(enriched);
    const growth = this.growth.model(enriched);
    const sustainability = this.sustainability.assess(enriched);
    const knowledge = this.knowledge.archive(enriched);
    const coordination = this.coordination.coordinate(enriched);
    const simulations = this.simulation.run(enriched);
    const decisions = this.decision.decide(enriched, ethics, stability);
    const memory = this.memory.recall(enriched);
    const dashboard = this.buildDashboard(enriched, stability, sustainability, ethics, decisions, simulations, memory);

    return {
      generatedAt: new Date().toISOString(),
      context: enriched,
      governance,
      ethics,
      stability,
      growth,
      sustainability,
      knowledge,
      coordination,
      simulations,
      decisions,
      memory,
      dashboard,
    };
  }

  governOffline(ctx: CivilizationContextInput, interstellar?: InterstellarReport | null): CivilizationReport {
    this.offline.enqueue(ctx);
    return this.govern({ ...ctx, offline: true }, interstellar);
  }

  syncOffline(interstellar?: InterstellarReport | null): CivilizationReport[] {
    return this.offline.drain().map((item) =>
      this.offline.markSynced(this.govern({ ...item.context, offline: false }, interstellar))
    );
  }

  private buildDashboard(
    ctx: CivilizationContextInput,
    stability: CivilizationReport["stability"],
    sustainability: CivilizationReport["sustainability"],
    ethics: CivilizationReport["ethics"],
    decisions: CivilizationReport["decisions"],
    simulations: CivilizationReport["simulations"],
    memory: CivilizationReport["memory"]
  ): CivilizationDashboard {
    return {
      generatedAt: new Date().toISOString(),
      scopeCount: ctx.scopes?.length ?? 0,
      stabilityScore: stability.stabilityScore,
      sustainabilityScore: sustainability.sustainabilityScore,
      ethicsAlignment: ethics.alignmentScore,
      decisionCount: decisions.length,
      simulationCount: simulations.length,
      memoryRecords: memory.records.length,
    };
  }
}
