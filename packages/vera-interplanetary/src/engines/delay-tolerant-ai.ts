import type { DelayTolerantState, InterplanetaryContextInput } from "../types";
import { COMM_DELAYS } from "../utils/scoring";

export class DelayTolerantAiEngine {
  run(ctx: InterplanetaryContextInput): DelayTolerantState {
    const sites = ctx.sites ?? [];
    const maxDelay = Math.max(...sites.map((s) => s.commDelayMinutes ?? COMM_DELAYS[s.body] ?? 0), 0);

    const predictedStates = sites.map((s) => {
      const delay = s.commDelayMinutes ?? COMM_DELAYS[s.body] ?? 0;
      return {
        siteId: s.id,
        horizon: delay > 15 ? "T+24h" : "T+4h",
        prediction:
          delay > 15
            ? `Autonomous state projection during ${delay}m comm blackout`
            : "Near-real-time state sync with Earth",
      };
    });

    const blackoutWindows = sites
      .filter((s) => (s.commDelayMinutes ?? COMM_DELAYS[s.body] ?? 0) > 10)
      .map((s) => ({
        siteId: s.id,
        until: new Date(Date.now() + (s.commDelayMinutes ?? 22) * 60 * 1000).toISOString(),
      }));

    return {
      predictedStates,
      prePlannedActions: [
        "Pre-authorize EVA abort during blackout",
        "Pre-stage life support O2 reserve adjustment",
        "Queue sync batch for comm window reopen",
        "Resolve resource conflicts autonomously during blackout",
      ],
      blackoutWindows,
      syncPending: blackoutWindows.length,
      autonomousMode: maxDelay >= 5,
    };
  }
}
