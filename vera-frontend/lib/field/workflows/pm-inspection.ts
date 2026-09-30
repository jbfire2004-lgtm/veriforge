import { pruneHiddenInspectionAnswers } from "@/lib/inspection-visible-items";
import type { PmInspectionTemplate } from "@/lib/pm-inspections";
import type { LocalCacheStore } from "../cache-store";
import type { SyncQueue } from "../sync-queue";
import {
  attachPhotosToPmInspectionSync,
  type PmInspectionSyncPhotoRef,
} from "./pm-inspection-photo";

type ChecklistItem = PmInspectionTemplate["items"][number];

export async function syncPmInspectionOffline(
  cache: LocalCacheStore,
  queue: SyncQueue,
  body: {
    clientSyncId: string;
    templateId: string;
    companyId: number;
    projectId: number;
    answers: Record<string, unknown>;
    templateItems?: ChecklistItem[];
    siteId?: number;
    equipmentId?: number;
    workerId?: number;
    submitted?: boolean;
    signatures?: Array<{ role: string; signatureData?: string; clientSyncId?: string }>;
    photos?: File[];
    photoCaptions?: string[];
  },
): Promise<{ pendingSyncId: string; photoRefs: PmInspectionSyncPhotoRef[] }> {
  const answers = body.templateItems?.length
    ? pruneHiddenInspectionAnswers(body.templateItems, body.answers)
    : body.answers;
  let photoCaptures: PmInspectionSyncPhotoRef[] = [];
  if (body.photos?.length) {
    photoCaptures = await attachPhotosToPmInspectionSync(
      cache,
      body.photos,
      body.photoCaptions,
    );
  }

  await cache.put("inspection", body.clientSyncId, {
    ...body,
    answers,
    photoCaptures,
    pending: true,
    submittedAt: new Date().toISOString(),
  });

  const item = await queue.enqueue("pmInspections.sync", {
    clientSyncId: body.clientSyncId,
    templateId: body.templateId,
    companyId: body.companyId,
    projectId: body.projectId,
    answers,
    siteId: body.siteId,
    equipmentId: body.equipmentId,
    workerId: body.workerId,
    submitted: body.submitted,
    signatures: body.signatures,
    photoCaptures,
  });

  return { pendingSyncId: item.id, photoRefs: photoCaptures };
}
