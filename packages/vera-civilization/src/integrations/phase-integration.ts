import type { InterstellarReport } from "@vera/interstellar";
import type { CivilizationContextInput, CivilizationScope } from "../types";

export function ingestPhases(
  ctx: CivilizationContextInput,
  interstellar?: InterstellarReport | null
): CivilizationContextInput {
  const scopes: CivilizationScope[] = [...(ctx.scopes ?? [])];

  if (scopes.length === 0 && interstellar?.context.assets) {
    for (const a of interstellar.context.assets) {
      scopes.push({
        id: a.id,
        name: a.name,
        type:
          a.kind === "generation_ship"
            ? "generation_ship"
            : a.kind === "colony" || a.kind === "replicating_colony"
              ? "colony"
              : a.kind === "habitat"
                ? "planet"
                : "system",
        population: (a.crewCount ?? 0) + (a.robotCount ?? 0) * 0.1,
        stability: 100 - (a.hazardScore ?? 20),
        growthRate: a.terraformStage ? 1.5 + a.terraformStage * 0.2 : 1.2,
        resourceIndex: a.powerLevel ?? 70,
      });
    }
    scopes.push({
      id: "species-human",
      name: "Human civilization",
      type: "species_enclave",
      population: scopes.reduce((s, x) => s + (x.population ?? 0), 0),
      stability: 75,
    });
  }

  if (scopes.length === 0) {
    scopes.push(
      { id: "sol-fed", name: "Sol Federation", type: "system", population: 10000, stability: 82, resourceIndex: 75 },
      { id: "ac-colony", name: "Alpha Centauri Colony", type: "colony", population: 800, stability: 74, growthRate: 1.8 },
      { id: "proxima", name: "Proxima Settlement", type: "planet", population: 200, stability: 68, resourceIndex: 60 }
    );
  }

  return {
    ...ctx,
    scopes,
    interstellarRiskScore: interstellar?.dashboard.interstellarRiskScore ?? ctx.interstellarRiskScore,
    missionIntegrity: interstellar?.dashboard.missionIntegrity ?? ctx.missionIntegrity,
    assetCount: interstellar?.dashboard.assetCount ?? ctx.assetCount,
    systemCount: interstellar?.dashboard.systemCount ?? ctx.systemCount,
  };
}
