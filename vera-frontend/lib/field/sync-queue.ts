import { getFieldDb } from "./db";
import type { SyncActionType, SyncQueueItem, SyncStatus } from "./types";

function newId(): string {
  return `sync_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** FIFO sync queue with retry metadata (§4). */
export class SyncQueue {
  async enqueue(
    type: SyncActionType,
    payload: Record<string, unknown>,
    clientVersion = 1
  ): Promise<SyncQueueItem> {
    const now = new Date().toISOString();
    const item: SyncQueueItem = {
      id: newId(),
      type,
      payload,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      attempts: 0,
      clientVersion,
    };
    const db = await getFieldDb();
    await db.put("sync_queue", item, item.id);
    return item;
  }

  async list(status?: SyncStatus): Promise<SyncQueueItem[]> {
    const db = await getFieldDb();
    const all = await db.getAll("sync_queue");
    const filtered = status ? all.filter((i) => i.status === status) : all;
    return filtered.sort(
      (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
    );
  }

  async get(id: string): Promise<SyncQueueItem | undefined> {
    const db = await getFieldDb();
    return db.get("sync_queue", id);
  }

  async update(item: SyncQueueItem): Promise<void> {
    const db = await getFieldDb();
    item.updatedAt = new Date().toISOString();
    await db.put("sync_queue", item, item.id);
  }

  async mark(
    id: string,
    status: SyncStatus,
    error?: string
  ): Promise<void> {
    const item = await this.get(id);
    if (!item) return;
    item.status = status;
    if (error) item.lastError = error;
    if (status === "failed") item.attempts += 1;
    await this.update(item);
  }

  async remove(id: string): Promise<void> {
    const db = await getFieldDb();
    await db.delete("sync_queue", id);
  }

  async pendingCount(): Promise<number> {
    return (await this.list("pending")).length;
  }

  async failedCount(): Promise<number> {
    return (await this.list("failed")).length;
  }
}
