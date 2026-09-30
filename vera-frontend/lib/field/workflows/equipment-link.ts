import type { LocalCacheStore } from "../cache-store";
import type { SyncQueue } from "../sync-queue";

export async function linkEquipmentOffline(
  cache: LocalCacheStore,
  queue: SyncQueue,
  body: { equipmentId: number; companyId: number }
): Promise<{ pendingSyncId: string }> {
  await cache.put("equipmentLink", `${body.equipmentId}:${body.companyId}`, {
    ...body,
    active: true,
    pending: true,
    linkedAt: new Date().toISOString(),
  });

  const item = await queue.enqueue("equipment.link", body);
  return { pendingSyncId: item.id };
}
