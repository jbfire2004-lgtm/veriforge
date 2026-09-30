import type { CategoryMarketplace, MarketplaceSimulation } from "../types";

let simId = 0;

export class MarketplaceSimulationEngine {
  run(categories: CategoryMarketplace[]): MarketplaceSimulation[] {
    const mk = (scenario: string, supply: number, demand: number, recommendation: string) => {
      simId += 1;
      return { id: `msim-${simId}`, scenario, supply, demand, gap: demand - supply, recommendation };
    };

    return categories.map((c) => {
      const supply = c.availabilityMap.reduce((s, a) => s + a.supply, 0);
      const demand = c.availabilityMap.reduce((s, a) => s + a.demand, 0);
      return mk(`${c.category} supply/demand`, supply, demand, c.recommendations[0] ?? "Monitor market");
    });
  }
}
