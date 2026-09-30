import { describe, expect, it } from "vitest";
import { VeraIndustryEcosystemEngine } from "@vera/industry-ecosystem";

describe("Vera Industry Ecosystem", () => {
  it("orchestrates cross-company industry context", () => {
    const vaiee = new VeraIndustryEcosystemEngine();
    const report = vaiee.orchestrate({
      participants: [
        {
          companyHash: "ind-a",
          industry: "construction",
          region: "west",
          workerCount: 80,
          sifForms: 2,
          nonCompliantWorkers: 6,
          schedulingShortages: 3,
        },
        {
          companyHash: "ind-b",
          industry: "construction",
          region: "east",
          workerCount: 45,
          dispatchConflicts: 2,
          expiringTraining: 12,
        },
      ],
    });

    expect(report.coordination.actions.length).toBeGreaterThan(0);
    expect(report.prediction.forecasts.length).toBeGreaterThan(0);
    expect(report.risk.industryScore).toBeGreaterThanOrEqual(0);
    expect(report.dashboard.participantCount).toBe(2);
  });

  it("supports offline orchestrate and sync", () => {
    const vaiee = new VeraIndustryEcosystemEngine();
    const offline = vaiee.orchestrateOffline({
      participants: [{ companyHash: "x", industry: "construction", region: "NA" }],
    });
    expect(offline.context.offline).toBe(true);
    const synced = vaiee.syncOffline();
    expect(synced.length).toBeGreaterThan(0);
  });
});
