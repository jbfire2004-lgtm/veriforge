import { describe, expect, it } from "vitest";
import { VeraGlobalMarketplaceEngine } from "@vera/marketplace";

describe("Vera Global Marketplace", () => {
  it("runs autonomous marketplace matching", () => {
    const vgame = new VeraGlobalMarketplaceEngine();
    const report = vgame.run({
      listings: [
        {
          id: "l1",
          sellerHash: "seller-a",
          category: "workforce",
          resourceType: "dispatch",
          region: "west",
          quantity: 10,
          readinessScore: 85,
          complianceOk: true,
          skills: ["trade"],
        },
      ],
      demands: [
        {
          id: "d1",
          buyerHash: "buyer-b",
          category: "workforce",
          resourceType: "project",
          region: "west",
          quantity: 5,
          urgency: "high",
          requiredSkills: ["trade"],
        },
      ],
    });

    expect(report.workforce.matches.length).toBeGreaterThan(0);
    expect(report.matching.matches.length).toBeGreaterThan(0);
    expect(report.pricing.quotes.length).toBeGreaterThan(0);
    expect(report.dashboard.matchCount).toBeGreaterThan(0);
  });

  it("supports offline run and sync", () => {
    const vgame = new VeraGlobalMarketplaceEngine();
    const offline = vgame.runOffline({ listings: [], demands: [] });
    expect(offline.context.offline).toBe(true);
    const synced = vgame.syncOffline();
    expect(synced.length).toBeGreaterThan(0);
  });
});
