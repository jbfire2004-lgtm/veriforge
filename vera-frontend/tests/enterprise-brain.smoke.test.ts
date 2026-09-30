import { describe, expect, it } from "vitest";
import { VeraEnterpriseBrainEngine } from "@vera/enterprise-brain";

describe("Vera Enterprise Brain", () => {
  it("thinks holistically across enterprise context", () => {
    const aeb = new VeraEnterpriseBrainEngine();
    const report = aeb.think({
      companyId: "1",
      workerCount: 20,
      sifPrecursors: 2,
      nonCompliantWorkers: 3,
      schedulingShortages: [{ projectId: "p1", deficit: 2 }],
    });

    expect(report.reasoning.steps.length).toBeGreaterThan(0);
    expect(report.predictions.length).toBeGreaterThan(0);
    expect(report.decisions.length).toBeGreaterThan(0);
    expect(report.dashboard.healthScore).toBeGreaterThanOrEqual(0);
  });

  it("runs simulations and policy evaluation", () => {
    const aeb = new VeraEnterpriseBrainEngine();
    const report = aeb.think({ companyId: "1", sifPrecursors: 1 });
    expect(report.simulations.length).toBeGreaterThan(0);
    expect(report.policies.some((p) => p.enforced)).toBe(true);
  });

  it("supports offline think", () => {
    const aeb = new VeraEnterpriseBrainEngine();
    const report = aeb.thinkOffline({ companyId: "1" });
    expect(report.context.offline).toBe(true);
  });
});
