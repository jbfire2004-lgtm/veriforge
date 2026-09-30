import type { InterplanetaryContextInput, InterplanetaryTwin } from "../types";
import { clamp } from "../utils/scoring";

const TWIN_TYPES = [
  "habitat",
  "life_support",
  "power_grid",
  "rover",
  "lander",
  "orbital_station",
  "eva_suit",
  "crew",
  "robotics",
] as const;

export class InterplanetaryTwinEngine {
  hydrate(ctx: InterplanetaryContextInput): InterplanetaryTwin[] {
    const sites = ctx.sites ?? [];
    const twins: InterplanetaryTwin[] = [];

    for (const s of sites) {
      for (const twinType of TWIN_TYPES.slice(0, s.facilityType === "rover" ? 4 : 6)) {
        const health = clamp(
          (s.lifeSupportOk ? 40 : 0) + (s.powerLevel ?? 80) * 0.5 - (s.hazardScore ?? 0)
        );
        twins.push({
          twinType,
          siteId: s.id,
          health,
          predictions:
            health < 60
              ? [`${twinType} failure risk elevated at ${s.name}`]
              : [`${twinType} nominal at ${s.name}`],
          failureRisk: clamp(100 - health),
        });
      }
    }

    return twins.slice(0, 40);
  }
}
