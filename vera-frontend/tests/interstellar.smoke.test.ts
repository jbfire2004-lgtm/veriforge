import { describe, expect, it } from "vitest";
import { VeraInterstellarOperationsEngine } from "@vera/interstellar";

describe("Vera Interstellar Operations", () => {
  it("expands across star systems", () => {
    const vioeX = new VeraInterstellarOperationsEngine();
    const report = vioeX.expand({
      assets: [
        {
          id: "sol-1",
          name: "Earth Command",
          system: "sol",
          kind: "colony",
          crewCount: 100,
          lifeSupportOk: true,
          powerLevel: 90,
          commDelayYears: 0,
        },
        {
          id: "ac-1",
          name: "Alpha Colony",
          system: "alpha_centauri",
          kind: "colony",
          commDelayYears: 4.37,
          lifeSupportOk: true,
        },
      ],
    });

    expect(report.starSystems.links.length).toBeGreaterThan(0);
    expect(report.lightYearDelay.autonomousMode).toBe(true);
    expect(report.twins.length).toBeGreaterThan(0);
    expect(report.dashboard.assetCount).toBe(2);
  });

  it("supports offline expand and sync", () => {
    const vioeX = new VeraInterstellarOperationsEngine();
    const offline = vioeX.expandOffline({});
    expect(offline.context.offline).toBe(true);
    expect(offline.context.assets!.length).toBeGreaterThan(0);
    const synced = vioeX.syncOffline();
    expect(synced.length).toBeGreaterThan(0);
  });
});
