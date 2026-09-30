import type { InterstellarContextInput, LightYearDelayState } from "../types";
import { SYSTEM_DELAYS_YEARS, clamp } from "../utils/scoring";

export class LightYearDelayAiEngine {
  run(ctx: InterstellarContextInput): LightYearDelayState {
    const assets = ctx.assets ?? [];
    const delays = assets.map((a) => a.commDelayYears ?? SYSTEM_DELAYS_YEARS[a.system] ?? 4);
    const maxDelay = delays.length ? Math.max(...delays) : 4;

    const predictedStates = assets.map((a) => {
      const delay = a.commDelayYears ?? SYSTEM_DELAYS_YEARS[a.system] ?? 4;
      return {
        assetId: a.id,
        horizon: delay > 10 ? "T+20y" : delay > 4 ? "T+8y" : "T+2y",
        prediction: `Autonomous projection across ${delay}y comm delay — no Earth input`,
      };
    });

    const blackoutWindows = assets
      .filter((a) => (a.commDelayYears ?? SYSTEM_DELAYS_YEARS[a.system] ?? 0) >= 4)
      .map((a) => ({
        assetId: a.id,
        untilYears: a.commDelayYears ?? SYSTEM_DELAYS_YEARS[a.system] ?? 4,
      }));

    const missionIntegrity = clamp(100 - (ctx.interplanetaryRiskScore ?? 20) / 2 - blackoutWindows.length * 5);

    return {
      predictedStates,
      prePlannedActions: [
        "Pre-authorize multi-decade autonomous mission branch",
        "Pre-stage cryosleep rotation schedule",
        "Queue generational sync batch for comm window",
        "Resolve cross-colony conflicts without Earth ack",
        "Maintain scientific mission priorities across generations",
      ],
      blackoutWindows,
      syncPending: blackoutWindows.length,
      autonomousMode: maxDelay >= 4,
      missionIntegrity,
    };
  }
}
