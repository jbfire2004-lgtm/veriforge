import { compressImageForOffline } from "../crypto";
import type { LocalCacheStore } from "../cache-store";
import type { SyncQueue } from "../sync-queue";
import type { InspectionType } from "@/lib/api/inspection";

export async function submitInspectionOffline(
  cache: LocalCacheStore,
  queue: SyncQueue,
  body: {
    equipmentId: number;
    workerId?: number;
    inspectionType: InspectionType;
    checklist: Record<string, { passed: boolean; notes?: string }>;
    passed: boolean;
    photos?: File[];
    lockoutTriggered?: boolean;
    notes?: string;
    correctiveActions?: string;
  }
): Promise<{ pendingSyncId: string; localId: string }> {
  const localId = `insp_${Date.now()}`;
  const photoRefs: string[] = [];

  if (body.photos?.length) {
    for (let i = 0; i < body.photos.length; i++) {
      const file = body.photos[i]!;
      const compressed = await compressImageForOffline(file);
      const blobId = `${localId}_photo_${i}`;
      await cache.putBlob(blobId, compressed);
      photoRefs.push(blobId);
    }
  }

  await cache.put("inspection", localId, {
    ...body,
    photoRefs,
    lockoutTriggered: body.lockoutTriggered ?? !body.passed,
    submittedAt: new Date().toISOString(),
    pending: true,
  });

  const item = await queue.enqueue("inspection.submit", {
    equipmentId: body.equipmentId,
    workerId: body.workerId,
    inspectionType: body.inspectionType,
    checklist: body.checklist,
    passed: body.passed,
    photoRefs,
    notes: body.notes,
    correctiveActions: body.correctiveActions,
    lockoutTriggered: body.lockoutTriggered,
    localId,
  });

  if (body.lockoutTriggered || !body.passed) {
    const equip = await cache.get<{ lockedOut?: boolean }>("equipment", body.equipmentId);
    if (equip) {
      await cache.put("equipment", body.equipmentId, {
        ...equip.data,
        lockedOut: true,
      });
    }
  }

  return { pendingSyncId: item.id, localId };
}
