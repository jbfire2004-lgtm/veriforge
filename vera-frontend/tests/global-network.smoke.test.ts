import { describe, expect, it } from "vitest";
import { VeraGlobalNetworkEngine } from "@vera/global-network";

describe("Vera Global Network Intelligence", () => {
  it("analyzes federated multi-company context", () => {
    const vgnie = new VeraGlobalNetworkEngine();
    const report = vgnie.analyze({
      companies: [
        {
          companyHash: "anon-a",
          workerCount: 50,
          sifForms: 2,
          hecaForms: 1,
          hazardTexts: ["fall from height on scaffold"],
          nonCompliantWorkers: 5,
          inspectionFailures: 3,
        },
        {
          companyHash: "anon-b",
          workerCount: 30,
          energyWheelForms: 2,
          hazardTexts: ["electrical lockout conflict"],
          dispatchConflicts: 1,
        },
      ],
    });

    expect(report.hazards.clusters.length).toBeGreaterThan(0);
    expect(report.safety.globalSafetyScore).toBeGreaterThanOrEqual(0);
    expect(report.knowledgeGraph.nodes.length).toBeGreaterThan(0);
    expect(report.dashboard.companiesInNetwork).toBe(2);
  });

  it("supports offline analyze and sync", () => {
    const vgnie = new VeraGlobalNetworkEngine();
    const offline = vgnie.analyzeOffline({ companies: [{ companyHash: "x", workerCount: 1 }] });
    expect(offline.context.offline).toBe(true);
    const synced = vgnie.syncOffline();
    expect(synced.length).toBeGreaterThan(0);
  });
});
