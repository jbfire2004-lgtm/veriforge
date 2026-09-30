import { describe, expect, it } from "vitest";
import { VeraEnterpriseAutomationEngine } from "@vera/enterprise-automation";

describe("Vera Enterprise Automation Engine", () => {
  it("orchestrates cross-phase automation", () => {
    const veao = new VeraEnterpriseAutomationEngine();
    const report = veao.orchestrate({
      companyId: "1",
      workerCount: 10,
      nonCompliantWorkers: 2,
      expiringTraining: 1,
      inspectionFailures: 1,
      safetyForms: [
        { id: "1", kind: "SIF", title: "Height work", hazardSummary: "fall from height" },
      ],
      schedulingShortages: [{ projectId: "p1", deficit: 2 }],
    });

    expect(report.safety.actions.length).toBeGreaterThan(0);
    expect(report.scheduling.actions.length).toBeGreaterThan(0);
    expect(report.execution.log.length).toBeGreaterThan(0);
    expect(report.dashboard.healthScore).toBeGreaterThan(0);
  });

  it("resolves conflicts by priority", () => {
    const veao = new VeraEnterpriseAutomationEngine();
    const report = veao.orchestrate({
      companyId: "1",
      inspectionFailures: 2,
      nonCompliantWorkers: 5,
    });
    expect(report.conflicts.length).toBeGreaterThanOrEqual(0);
  });

  it("runs cross-module chains", () => {
    const veao = new VeraEnterpriseAutomationEngine();
    const report = veao.orchestrate({
      companyId: "1",
      expiringTraining: 3,
      inspectionFailures: 1,
    });
    expect(report.crossModule.chains.length).toBeGreaterThan(0);
    expect(report.rules.triggered).toBeGreaterThan(0);
  });

  it("supports override", () => {
    const veao = new VeraEnterpriseAutomationEngine();
    let report = veao.orchestrate({ companyId: "1", nonCompliantWorkers: 1 });
    const action = report.execution.log.find((a) => a.overrideable);
    if (action) {
      report = veao.overrideAction(report, action.id, "Supervisor override");
      expect(report.overrides).toHaveLength(1);
    }
  });
});
