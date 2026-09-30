import type { InterplanetaryContextInput, InterplanetarySimulation } from "../types";

let simId = 0;

export class InterplanetarySimulationEngine {
  run(ctx: InterplanetaryContextInput): InterplanetarySimulation[] {
    const sites = ctx.sites ?? [];
    const mk = (scenario: string, impact: number, recommendation: string) => {
      simId += 1;
      return { id: `isim-${simId}`, scenario, impact, recommendation };
    };

    return [
      mk("Habitat breach", sites.some((s) => !s.lifeSupportOk) ? 95 : 25, "Seal module, shelter crew"),
      mk("Radiation storm", sites.some((s) => (s.radiationLevel ?? 0) > 50) ? 80 : 20, "Shelter in habitat"),
      mk("Mars dust storm", sites.some((s) => s.body === "mars") ? 70 : 15, "Halt EVA, conserve power"),
      mk("Power grid failure", sites.some((s) => (s.powerLevel ?? 100) < 50) ? 85 : 20, "Redistribute bus load"),
      mk("Life support failure", sites.some((s) => !s.lifeSupportOk) ? 98 : 15, "Emergency O2 protocol"),
      mk("EVA emergency", 40, "Recall crew, pressurize airlock"),
      mk("Rover failure", sites.some((s) => s.facilityType === "rover") ? 55 : 10, "Dispatch repair robotics"),
      mk("Orbital debris collision", sites.some((s) => s.body === "orbit") ? 75 : 10, "Execute avoidance burn"),
    ];
  }
}
