import { compressImageForOffline } from "../crypto";
import type { LocalCacheStore } from "../cache-store";
import type { SyncQueue } from "../sync-queue";

export type PmInspectionPhotoCapturePayload = {
  inspectionId: string;
  companyId: number;
  projectId: number;
  caption?: string;
  blobId: string;
  clientSyncId: string;
  checklistItemId?: string;
  defaultSubcontractorCompanyId?: number;
};

/** Queue instant photo capture for sync when back online. */
export async function capturePmInspectionPhotoOffline(
  cache: LocalCacheStore,
  queue: SyncQueue,
  body: {
    inspectionId: string;
    companyId: number;
    projectId: number;
    photo: File;
    caption?: string;
    checklistItemId?: string;
    defaultSubcontractorCompanyId?: number;
  },
): Promise<{ pendingSyncId: string; clientSyncId: string }> {
  const clientSyncId = `insp_photo_${Date.now()}`;
  const blobId = `${clientSyncId}_blob`;
  const compressed = await compressImageForOffline(body.photo);
  await cache.putBlob(blobId, compressed);

  const item = await queue.enqueue("pmInspectionPhoto.capture", {
    inspectionId: body.inspectionId,
    companyId: body.companyId,
    projectId: body.projectId,
    caption: body.caption,
    checklistItemId: body.checklistItemId,
    blobId,
    clientSyncId,
    defaultSubcontractorCompanyId: body.defaultSubcontractorCompanyId,
  } satisfies PmInspectionPhotoCapturePayload);

  return { pendingSyncId: item.id, clientSyncId };
}

export type PmInspectionSyncPhotoRef = {
  blobId: string;
  caption?: string;
  clientSyncId: string;
  defaultSubcontractorCompanyId?: number;
};

/** Attach photo refs to a PM inspection offline sync payload. */
export async function attachPhotosToPmInspectionSync(
  cache: LocalCacheStore,
  photos: File[],
  captions?: string[],
): Promise<PmInspectionSyncPhotoRef[]> {
  const refs: PmInspectionSyncPhotoRef[] = [];
  for (let i = 0; i < photos.length; i++) {
    const clientSyncId = `insp_sync_photo_${Date.now()}_${i}`;
    const blobId = `${clientSyncId}_blob`;
    const compressed = await compressImageForOffline(photos[i]!);
    await cache.putBlob(blobId, compressed);
    refs.push({
      blobId,
      clientSyncId,
      caption: captions?.[i],
    });
  }
  return refs;
}
