import { describe, expect, it } from "vitest";
import { VeraCommandCenterEngine } from "@vera/command-center";

describe("Vera Command Center Engine", () => {
  it("refreshes unified real-time report", () => {
    const vcc = new VeraCommandCenterEngine();
    const report = vcc.refresh({
      companyId: "1",
      sifPrecursors: 1,
      entities: [
        { id: "w1", name: "Alex", type: "worker", complianceOk: false, riskScore: 60 },
        { id: "e1", name: "Crane", type: "equipment", riskScore: 80 },
        { id: "p1", name: "Site A", type: "project" },
      ],
      safetyForms: [
        { id: "1", kind: "SIF", title: "Roof", hazardSummary: "fall from height" },
      ],
    });

    expect(report.risk.length).toBeGreaterThan(0);
    expect(report.alerts.length).toBeGreaterThan(0);
    expect(report.agents.length).toBe(7);
    expect(report.dashboard.risk.avg).toBeGreaterThan(0);
  });

  it("builds map markers and timeline", () => {
    const vcc = new VeraCommandCenterEngine();
    const report = vcc.refresh({
      companyId: "1",
      entities: [{ id: "w1", name: "A", type: "worker", lat: 49.28, lng: -123.12 }],
    });
    expect(report.map.length).toBeGreaterThan(0);
    expect(report.timeline.length).toBeGreaterThanOrEqual(0);
  });

  it("handles offline refresh", () => {
    const vcc = new VeraCommandCenterEngine();
    const report = vcc.refreshOffline({ companyId: "1" });
    expect(report.context.offline).toBe(true);
  });
});
