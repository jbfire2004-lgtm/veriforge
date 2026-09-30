import type { InterstellarContextInput, InterstellarTwin } from "../types";
import { clamp } from "../utils/scoring";

const TWIN_TYPES = [
  "star_system",
  "colony",
  "habitat",
  "terraforming",
  "power_grid",
  "mining",
  "robotics_fleet",
  "generation_ship",
  "cryosleep",
  "scientific_mission",
] as const;

export class InterstellarTwinEngine {
  hydrate(ctx: InterstellarContextInput): InterstellarTwin[] {
    const assets = ctx.assets ?? [];
    const twins: InterstellarTwin[] = [];

    for (const a of assets) {
      for (const twinType of TWIN_TYPES) {
        const health = clamp(
          (a.lifeSupportOk ? 40 : 0) + (a.powerLevel ?? 70) * 0.4 - (a.hazardScore ?? 0) * 0.5
        );
        twins.push({
          twinType,
          assetId: a.id,
          health,
          failureRisk: clamp(100 - health),
          predictions:
            health < 55
              ? [`${twinType}: failure/hazard risk at ${a.name} (decades autonomous)`]
              : [`${twinType}: nominal at ${a.name}`],
        });
      }
    }

    return twins.slice(0, 50);
  }
}
