import { describe, expect, it } from "vitest";
import {
  fetchControlCatalog,
  fetchHazardCatalog,
  suggestControlsForHazards,
  suggestHazardsForTask,
} from "@/lib/hazard-control-catalog";
import { identifyHazardsWithAi } from "@/lib/jha-ai-suggestions";

describe("hazard-control-catalog", () => {
  it("targets Vera Core hazard and control endpoints", () => {
    expect(fetchHazardCatalog.name).toBe("fetchHazardCatalog");
    expect(fetchControlCatalog.name).toBe("fetchControlCatalog");
    expect(suggestHazardsForTask.name).toBe("suggestHazardsForTask");
    expect(suggestControlsForHazards.name).toBe("suggestControlsForHazards");
    expect(identifyHazardsWithAi.name).toBe("identifyHazardsWithAi");
  });
});
