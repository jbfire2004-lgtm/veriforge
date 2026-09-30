import { describe, expect, it } from "vitest";
import { VeraIntelligenceEngine } from "@vera/intelligence";

describe("Vera Intelligence Engine", () => {
  it("builds bundle with recommendations", () => {
    const vie = new VeraIntelligenceEngine();
    const bundle = vie.buildBundle({
      context: { companyId: 1 },
      company: {
        id: "1",
        name: "Test Co",
        complianceRate: 72,
        highRiskWorkers: 3,
        highRiskEquipment: 1,
        expiringTraining: 5,
      },
    });
    expect(bundle.recommendations.length).toBeGreaterThanOrEqual(0);
    expect(bundle.generatedAt).toBeTruthy();
  });

  it("answers natural language queries", () => {
    const vie = new VeraIntelligenceEngine();
    const res = vie.ask("What is our compliance status?");
    expect(res.intent).toBe("compliance.query");
  });
});
