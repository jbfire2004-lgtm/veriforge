import type { InterstellarContextInput, InterstellarSimulation } from "../types";

let simId = 0;

export class InterstellarSimulationEngine {
  run(ctx: InterstellarContextInput): InterstellarSimulation[] {
    const assets = ctx.assets ?? [];
    const mk = (scenario: string, impact: number, recommendation: string) => {
      simId += 1;
      return { id: `isim-${simId}`, scenario, impact, recommendation };
    };

    return [
      mk("Star system hazard cascade", assets.some((a) => (a.hazardScore ?? 0) > 40) ? 90 : 25, "Harden habitats, pause EVA"),
      mk("Terraforming instability", assets.some((a) => (a.terraformStage ?? 0) > 0 && (a.terraformStage ?? 0) < 3) ? 70 : 15, "Throttle terraform injectors"),
      mk("Habitat breach", assets.some((a) => !a.lifeSupportOk) ? 98 : 20, "Seal modules, shelter crew"),
      mk("Cryosleep failure", assets.some((a) => a.kind === "generation_ship") ? 75 : 10, "Rotate cryo pods, medical response"),
      mk("Power grid failure", assets.some((a) => (a.powerLevel ?? 100) < 50) ? 85 : 20, "Redistribute fusion bus"),
      mk("Radiation storm", assets.some((a) => (a.radiationLevel ?? 0) > 60) ? 88 : 25, "Radiation shelters, halt surface ops"),
      mk("Robotics fleet failure", assets.some((a) => (a.robotCount ?? 0) > 5 && (a.hazardScore ?? 0) > 35) ? 65 : 15, "Failover to backup fleet"),
      mk("Interstellar debris collision", 40, "Trajectory correction burn"),
      mk("Multi-decade mission drift", assets.length > 2 ? 55 : 20, "Recalibrate generational mission plan"),
    ];
  }
}
