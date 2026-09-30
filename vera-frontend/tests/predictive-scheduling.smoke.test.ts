import { describe, expect, it } from "vitest";
import { VeraPredictiveSchedulingEngine } from "@vera/predictive-scheduling";

describe("Vera Predictive Scheduling Engine", () => {
  it("forecasts workforce shortages for understaffed projects", () => {
    const vpse = new VeraPredictiveSchedulingEngine();
    const report = vpse.analyze({
      companyId: "1",
      workers: [
        {
          id: "w1",
          name: "Alex",
          isCompliant: true,
          readinessScore: 80,
          dispatchStatus: "available",
        },
        {
          id: "w2",
          name: "Sam",
          isCompliant: false,
          readinessScore: 40,
          dispatchStatus: "dispatched",
        },
      ],
      projects: [
        {
          id: "p1",
          name: "Site A",
          requiredWorkers: 5,
          assignedWorkers: 2,
        },
      ],
    });

    expect(report.workforce.shortages.length).toBeGreaterThan(0);
    expect(report.staffing.workerAssignments.length).toBeGreaterThan(0);
  });

  it("optimizes dispatch order by readiness", () => {
    const vpse = new VeraPredictiveSchedulingEngine();
    const report = vpse.analyze({
      dispatches: [
        {
          id: "d1",
          workerId: "w1",
          unionHallId: "uh1",
          companyId: "1",
          dispatchedAt: new Date().toISOString(),
        },
        {
          id: "d2",
          workerId: "w2",
          unionHallId: "uh1",
          companyId: "1",
          dispatchedAt: new Date().toISOString(),
        },
      ],
      workers: [
        { id: "w1", name: "A", isCompliant: true, readinessScore: 90 },
        { id: "w2", name: "B", isCompliant: false, readinessScore: 30 },
      ],
    });

    expect(report.dispatch.optimizedOrder.length).toBe(2);
    expect(report.dispatch.optimizedOrder[0].priority).toBeGreaterThanOrEqual(
      report.dispatch.optimizedOrder[1].priority
    );
  });

  it("builds twin scheduling overlay", () => {
    const vpse = new VeraPredictiveSchedulingEngine();
    const report = vpse.analyze({
      workers: [{ id: "w1", name: "A", isCompliant: true, readinessScore: 70 }],
      projects: [{ id: "p1", name: "P", requiredWorkers: 3, assignedWorkers: 1 }],
    });
    expect(report.twinOverlay.worker?.w1).toBeDefined();
    expect(report.dashboard.workforce).toBeDefined();
  });
});
