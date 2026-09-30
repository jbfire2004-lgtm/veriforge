import type { CivilizationContextInput, CivilizationStability } from "../types";
import { clamp } from "../utils/scoring";

export class CivilizationStabilityEngine {
  assess(ctx: CivilizationContextInput): CivilizationStability {
    const scopes = ctx.scopes ?? [];
    const avgStability =
      scopes.length > 0
        ? scopes.reduce((s, x) => s + (x.stability ?? 70), 0) / scopes.length
        : 70;
    const risk = ctx.interstellarRiskScore ?? 25;

    const stabilityScore = clamp(avgStability - risk * 0.4);

    return {
      stabilityScore,
      forecasts: [
        { label: "Societal instability", probability: risk > 50 ? 0.45 : 0.15, horizon: "50y" },
        { label: "Economic instability", probability: 0.2, horizon: "30y" },
        { label: "Political fragmentation", probability: scopes.length > 5 ? 0.35 : 0.12, horizon: "40y" },
        { label: "Environmental stress", probability: 0.25, horizon: "20y" },
        { label: "Interplanetary conflict", probability: risk > 40 ? 0.3 : 0.1, horizon: "15y" },
        { label: "Resource scarcity", probability: 0.22, horizon: "25y" },
        { label: "Cultural fragmentation", probability: scopes.length > 3 ? 0.28 : 0.1, horizon: "60y" },
      ],
      interventions:
        stabilityScore < 65
          ? ["Stability intervention: federated resource subsidy", "Cultural cohesion programs"]
          : ["Continue stability monitoring across centuries"],
    };
  }
}
