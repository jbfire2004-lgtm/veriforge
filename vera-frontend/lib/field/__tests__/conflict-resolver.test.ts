import { describe, expect, it } from "vitest";
import { evaluateConflict } from "../conflict-resolver";
import type { SyncQueueItem } from "../types";

function item(
  type: SyncQueueItem["type"],
  payload: Record<string, unknown>
): SyncQueueItem {
  return {
    id: "t1",
    type,
    payload,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attempts: 0,
    clientVersion: 1,
  };
}

describe("evaluateConflict", () => {
  it("blocks assignment when project closed", () => {
    const result = evaluateConflict({
      action: item("project.assignWorker", { projectId: 1, workerId: 2 }),
      serverState: { projectStatus: "CLOSED" },
    });
    expect(result.ok).toBe(false);
  });

  it("blocks equipment assignment when locked out", () => {
    const result = evaluateConflict({
      action: item("project.assignEquipment", { projectId: 1, equipmentId: 3 }),
      serverState: { lockedOut: true },
    });
    expect(result.ok).toBe(false);
  });

  it("allows worker link when active", () => {
    const result = evaluateConflict({
      action: item("worker.link", { workerId: 1, companyId: 1 }),
      serverState: { workerActive: true },
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.proceed).toBe(true);
  });

  it("blocks safetyFormV2 when server is newer", () => {
    const result = evaluateConflict({
      action: item("safetyFormV2.submit", {
        clientSyncId: "abc",
        clientTimestamp: "2026-01-01T00:00:00Z",
        clientVersion: 1,
      }),
      serverState: {
        updatedAt: "2026-01-02T00:00:00Z",
        clientVersion: 2,
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.conflict.rule).toBe("safetyFormV2.server_newer");
    }
  });

  it("allows safetyFormV2 when server is not newer", () => {
    const result = evaluateConflict({
      action: item("safetyFormV2.submit", {
        clientSyncId: "abc",
        clientTimestamp: "2026-01-02T00:00:00Z",
        clientVersion: 2,
      }),
      serverState: {
        updatedAt: "2026-01-01T00:00:00Z",
        clientVersion: 1,
      },
    });
    expect(result.ok).toBe(true);
  });
});
