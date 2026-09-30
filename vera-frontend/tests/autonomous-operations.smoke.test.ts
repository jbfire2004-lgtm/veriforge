import { describe, expect, it } from "vitest";
import { VeraAutonomousOperationsEngine } from "@vera/autonomous-operations";

describe("Vera Autonomous Operations Engine", () => {
  it("auto-dispatches workers to understaffed projects", () => {
    const vaoe = new VeraAutonomousOperationsEngine();
    const report = vaoe.run({
      companyId: "1",
      unionHallId: "10",
      workers: [
        {
          id: "w1",
          name: "Alex",
          isCompliant: true,
          trainingValid: true,
          dispatchStatus: "available",
          readinessScore: 85,
        },
        {
          id: "w2",
          name: "Sam",
          isCompliant: false,
          dispatchStatus: "dispatched",
          restricted: true,
        },
      ],
      projects: [
        { id: "p1", name: "Site A", requiredWorkers: 4, assignedWorkers: 1 },
      ],
    });

    expect(report.dispatch.dispatches.length).toBeGreaterThan(0);
    expect(report.execution.executed.length).toBeGreaterThan(0);
  });

  it("auto-lockouts failed inspection equipment", () => {
    const vaoe = new VeraAutonomousOperationsEngine();
    const report = vaoe.run({
      equipment: [
        {
          id: "e1",
          name: "Crane",
          inspectionPassed: false,
          lockedOut: false,
        },
      ],
    });

    expect(report.lockout.lockouts.length).toBe(1);
    expect(report.lockout.lockouts[0].type).toBe("lockout.apply");
  });

  it("resolves double-booking conflicts", () => {
    const vaoe = new VeraAutonomousOperationsEngine();
    const report = vaoe.run({
      workers: [
        {
          id: "w1",
          name: "Alex",
          projectIds: ["p1", "p2"],
          isCompliant: true,
          trainingValid: true,
        },
      ],
    });

    expect(report.conflicts.resolutions.length).toBeGreaterThan(0);
    expect(report.twinOverlay.worker?.w1).toBeDefined();
  });

  it("supports override on actions", () => {
    const vaoe = new VeraAutonomousOperationsEngine();
    let report = vaoe.run({
      equipment: [{ id: "e1", name: "Unit", inspectionPassed: false }],
    });
    const actionId = report.lockout.lockouts[0]?.id;
    if (actionId) {
      report = vaoe.overrideAction(report, actionId, "Supervisor override");
      expect(report.overrides).toHaveLength(1);
    }
  });
});
