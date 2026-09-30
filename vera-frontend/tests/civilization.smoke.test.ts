import { describe, expect, it } from "vitest";
import { VeraUniversalCivilizationEngine } from "@vera/civilization";

describe("Vera Universal Civilization Engine", () => {
  it("governs civilization scopes", () => {
    const uce = new VeraUniversalCivilizationEngine();
    const report = uce.govern({
      scopes: [
        { id: "sol", name: "Sol Federation", type: "system", population: 10000, stability: 80 },
        { id: "ac", name: "Alpha Colony", type: "colony", population: 500, stability: 70 },
      ],
    });

    expect(report.governance.decisions.length).toBeGreaterThan(0);
    expect(report.ethics.rules.length).toBeGreaterThan(0);
    expect(report.decisions.length).toBeGreaterThan(0);
    expect(report.dashboard.scopeCount).toBe(2);
  });

  it("supports offline govern and sync", () => {
    const uce = new VeraUniversalCivilizationEngine();
    const offline = uce.governOffline({});
    expect(offline.context.offline).toBe(true);
    expect(offline.context.scopes!.length).toBeGreaterThan(0);
    const synced = uce.syncOffline();
    expect(synced.length).toBeGreaterThan(0);
  });
});
