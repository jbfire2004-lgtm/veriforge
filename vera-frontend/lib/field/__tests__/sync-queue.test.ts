import { describe, expect, it, vi, beforeEach } from "vitest";
import { deriveSyncEngineStatus } from "../sync-status";

const store = new Map<string, unknown>();

vi.mock("../db", () => ({
  getFieldDb: async () => ({
    put: async (_store: string, value: unknown, key: string) => {
      store.set(key, value);
    },
    get: async (_store: string, key: string) => store.get(key),
    getAll: async () => [...store.values()],
    delete: async (_store: string, key: string) => {
      store.delete(key);
    },
  }),
}));

import { SyncQueue } from "../sync-queue";

describe("SyncQueue", () => {
  beforeEach(() => {
    store.clear();
  });

  it("enqueues FIFO pending items", async () => {
    const queue = new SyncQueue();
    const first = await queue.enqueue("safetyFormV2.submit", { clientSyncId: "a" });
    await new Promise((r) => setTimeout(r, 5));
    const second = await queue.enqueue("safetyFormV2.submit", { clientSyncId: "b" });

    const pending = await queue.list("pending");
    expect(pending).toHaveLength(2);
    expect(pending[0].id).toBe(first.id);
    expect(pending[1].id).toBe(second.id);
  });

  it("marks failed items and increments attempts", async () => {
    const queue = new SyncQueue();
    const row = await queue.enqueue("training.upload", { workerId: 1 });
    await queue.mark(row.id, "failed", "network");

    const failed = await queue.list("failed");
    expect(failed).toHaveLength(1);
    expect(failed[0].attempts).toBe(1);
    expect(failed[0].lastError).toBe("network");
  });

  it("removes synced items", async () => {
    const queue = new SyncQueue();
    const row = await queue.enqueue("qr.tempRecord", { tempId: "t1" });
    await queue.remove(row.id);
    expect(await queue.pendingCount()).toBe(0);
  });
});

describe("deriveSyncEngineStatus", () => {
  it("returns SYNCING when active", () => {
    expect(deriveSyncEngineStatus({ syncing: true, failedCount: 0 })).toBe("SYNCING");
  });

  it("returns ERROR when failures exist", () => {
    expect(deriveSyncEngineStatus({ syncing: false, failedCount: 2 })).toBe("ERROR");
  });

  it("returns IDLE otherwise", () => {
    expect(deriveSyncEngineStatus({ syncing: false, failedCount: 0 })).toBe("IDLE");
  });
});
