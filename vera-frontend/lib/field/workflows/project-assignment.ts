import type { LocalCacheStore } from "../cache-store";
import type { SyncQueue } from "../sync-queue";

export type OfflineComplianceCheck = {
  allowed: boolean;
  reasons: string[];
};

/** Validate assignment against cached compliance (§3.4). */
export async function validateOfflineAssignment(
  cache: LocalCacheStore,
  target: "worker" | "equipment",
  entityId: number
): Promise<OfflineComplianceCheck> {
  const entry = await cache.get<{ compliant?: boolean; lockedOut?: boolean }>(
    target,
    entityId
  );
  if (!entry) {
    return { allowed: true, reasons: ["No cached compliance — will verify on sync"] };
  }

  const reasons: string[] = [];
  if (entry.data.lockedOut) reasons.push("Equipment locked out (cached)");
  if (entry.data.compliant === false) reasons.push("Non-compliant (cached)");

  return { allowed: reasons.length === 0, reasons };
}

export async function assignWorkerToProjectOffline(
  cache: LocalCacheStore,
  queue: SyncQueue,
  projectId: number,
  workerId: number
): Promise<{ pendingSyncId: string; compliance: OfflineComplianceCheck }> {
  const compliance = await validateOfflineAssignment(cache, "worker", workerId);

  await cache.put("projectAssignment", `w:${projectId}:${workerId}`, {
    projectId,
    workerId,
    pending: true,
    assignedAt: new Date().toISOString(),
  });

  const item = await queue.enqueue("project.assignWorker", { projectId, workerId });
  return { pendingSyncId: item.id, compliance };
}

export async function assignEquipmentToProjectOffline(
  cache: LocalCacheStore,
  queue: SyncQueue,
  projectId: number,
  equipmentId: number
): Promise<{ pendingSyncId: string; compliance: OfflineComplianceCheck }> {
  const compliance = await validateOfflineAssignment(cache, "equipment", equipmentId);
  if (!compliance.allowed) {
    throw new Error(compliance.reasons.join("; "));
  }

  await cache.put("projectAssignment", `e:${projectId}:${equipmentId}`, {
    projectId,
    equipmentId,
    pending: true,
    assignedAt: new Date().toISOString(),
  });

  const item = await queue.enqueue("project.assignEquipment", { projectId, equipmentId });
  return { pendingSyncId: item.id, compliance };
}
