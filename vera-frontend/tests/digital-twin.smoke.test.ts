import { describe, expect, it } from "vitest";
import { VeraDigitalTwinEngine } from "@vera/digital-twin";

describe("Vera Digital Twin Engine", () => {
  it("creates worker twin and applies events", () => {
    const vdte = new VeraDigitalTwinEngine();
    vdte.createWorker({
      id: "1",
      name: "Jane Worker",
      isCompliant: true,
    });
    const updated = vdte.applyEvent({
      name: "training.uploaded",
      entityType: "worker",
      entityId: "1",
      occurredAt: new Date().toISOString(),
    });
    expect(updated?.timeline.length).toBeGreaterThan(1);
    expect(updated?.type).toBe("worker");
  });

  it("builds dashboard from twins", () => {
    const vdte = new VeraDigitalTwinEngine();
    vdte.createWorker({ id: "1", name: "A", isCompliant: false });
    vdte.createEquipment({ id: "2", name: "Crane", lockedOut: true });
    const dash = vdte.getDashboard();
    expect(dash.workers.total).toBe(1);
    expect(dash.equipment.lockedOut).toBe(1);
  });

  it("syncs offline queue", () => {
    const vdte = new VeraDigitalTwinEngine();
    vdte.createWorker({ id: "1", name: "B" });
    vdte.applyEventOffline(
      {
        name: "training.validated",
        entityType: "worker",
        entityId: "1",
        occurredAt: new Date().toISOString(),
      },
      1
    );
    const synced = vdte.syncOffline("worker", "1");
    expect(synced?.offline.pending).toBe(false);
  });
});
