import type { CivilizationContextInput, CivilizationKnowledge } from "../types";

let entryId = 0;

export class CivilizationKnowledgeEngine {
  archive(ctx: CivilizationContextInput): CivilizationKnowledge {
    const scopes = ctx.scopes ?? [];
    const entries = scopes.map((s) => {
      entryId += 1;
      return { id: `know-${entryId}`, type: s.type, label: s.name, preserved: true };
    });

    return {
      graphNodes: scopes.length * 8 + 20,
      graphEdges: scopes.length * 12 + 30,
      entries,
      scientificDiscoveries: ["Exoplanet biosignature catalog", "Fusion grid optimization treatise"],
      culturalPreservation: scopes.map((s) => `Cultural archive ${s.name} (10,000y preservation)`),
    };
  }
}
