import type { CivilizationContextInput, CivilizationSimulation } from "../types";

let simId = 0;

export class CivilizationSimulationEngine {
  run(ctx: CivilizationContextInput): CivilizationSimulation[] {
    const mk = (scenario: string, impact: number, recommendation: string) => {
      simId += 1;
      return { id: `csim-${simId}`, scenario, impact, recommendation };
    };

    const unstable = (ctx.scopes ?? []).some((s) => (s.stability ?? 70) < 50);

    return [
      mk("Civilization collapse", unstable ? 85 : 20, "Federated stability intervention"),
      mk("Civilization expansion", 60, "Managed growth with ethics review"),
      mk("Terraforming cascade", 55, "Throttle injectors, monitor ecology"),
      mk("Cultural evolution", 40, "Preserve diversity, prevent fragmentation"),
      mk("Economic evolution", 45, "Resource-backed currency federation"),
      mk("Scientific evolution", 50, "Open science with safety gates"),
      mk("Interstellar migration", 70, "Generational ship capacity planning"),
      mk("Multi-species integration", 35, "Rights charter + communication protocols"),
    ];
  }
}
