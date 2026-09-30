import type { LocalCacheStore } from "../cache-store";
import type { SyncQueue } from "../sync-queue";

export async function linkWorkerOffline(
  cache: LocalCacheStore,
  queue: SyncQueue,
  body: {
    workerId: number;
    companyId: number;
    role?: string;
    trade?: string;
  }
): Promise<{ pendingSyncId: string }> {
  await cache.put("companyLink", `${body.workerId}:${body.companyId}`, {
    ...body,
    active: true,
    pending: true,
    linkedAt: new Date().toISOString(),
  });

  const item = await queue.enqueue("worker.link", body);
  return { pendingSyncId: item.id };
}
