import { describe, expect, it } from "vitest";
import { VeraInterplanetaryOperationsEngine } from "@vera/interplanetary";

describe("Vera Interplanetary Operations", () => {
  it("operates across planetary sites", () => {
    const vioe = new VeraInterplanetaryOperationsEngine();
    const report = vioe.operate({
      sites: [
        {
          id: "earth-1",
          name: "Earth HQ",
          body: "earth",
          facilityType: "surface_base",
          crewCount: 100,
          lifeSupportOk: true,
          powerLevel: 95,
          commDelayMinutes: 0,
        },
        {
          id: "mars-1",
          name: "Mars Hab",
          body: "mars",
          facilityType: "habitat",
          crewCount: 8,
          lifeSupportOk: true,
          powerLevel: 70,
          commDelayMinutes: 22,
          hazardScore: 40,
        },
      ],
    });

    expect(report.planetary.links.length).toBeGreaterThan(0);
    expect(report.delayTolerant.autonomousMode).toBe(true);
    expect(report.twins.length).toBeGreaterThan(0);
    expect(report.dashboard.siteCount).toBe(2);
  });

  it("supports offline operate and sync", () => {
    const vioe = new VeraInterplanetaryOperationsEngine();
    const offline = vioe.operateOffline({});
    expect(offline.context.offline).toBe(true);
    expect(offline.context.sites!.length).toBeGreaterThan(0);
    const synced = vioe.syncOffline();
    expect(synced.length).toBeGreaterThan(0);
  });
});
