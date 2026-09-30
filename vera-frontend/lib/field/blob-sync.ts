import { uploadTrainingDocument } from "@/lib/api/training-ingestion";
import type { LocalCacheStore } from "./cache-store";
import type { SyncQueueItem } from "./types";

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload pending blobs (training certs, inspection photos) before action sync.
 */
export async function hydrateBlobsForAction(
  cache: LocalCacheStore,
  item: SyncQueueItem,
): Promise<SyncQueueItem> {
  if (item.type === "training.upload") {
    return hydrateTrainingUpload(cache, item);
  }

  if (item.type === "pmInspectionPhoto.capture") {
    return hydratePmInspectionPhoto(cache, item);
  }

  if (item.type === "pmInspections.sync") {
    return hydratePmInspectionSyncPhotos(cache, item);
  }

  return item;
}

async function hydrateTrainingUpload(
  cache: LocalCacheStore,
  item: SyncQueueItem,
): Promise<SyncQueueItem> {
  const blobId = item.payload.blobId as string | undefined;
  if (!blobId) return item;

  const blob = await cache.getBlob(blobId);
  if (!blob) return item;

  const record = item.payload.record as Record<string, unknown>;
  const companyId = record.companyId as number | undefined;
  if (!companyId) return item;

  const form = new FormData();
  const file = new File([blob], blobId, { type: blob.type || "application/octet-stream" });
  form.append("file", file);
  form.append("companyId", String(companyId));
  form.append(
    "metadata",
    JSON.stringify({
      rows: [
        {
          workerId: record.workerId,
          certificationId: record.certificationId,
          issuedAt: record.issuedAt,
          expiresAt: record.expiresAt,
          certificationCode: record.certificationCode,
        },
      ],
    }),
  );

  const run = await uploadTrainingDocument(form);
  return {
    ...item,
    payload: {
      ...item.payload,
      ingestionRunId: run?.id,
      record: { ...record, pending: false },
    },
  };
}

async function hydratePmInspectionPhoto(
  cache: LocalCacheStore,
  item: SyncQueueItem,
): Promise<SyncQueueItem> {
  const blobId = item.payload.blobId as string | undefined;
  if (!blobId) return item;

  const blob = await cache.getBlob(blobId);
  if (!blob) return item;

  const dataUrl = await blobToDataUrl(blob);
  return {
    ...item,
    payload: {
      ...item.payload,
      dataUrl,
      mimeType: blob.type || "image/jpeg",
      fileName: `${blobId}.jpg`,
    },
  };
}

async function hydratePmInspectionSyncPhotos(
  cache: LocalCacheStore,
  item: SyncQueueItem,
): Promise<SyncQueueItem> {
  const refs = item.payload.photoCaptures as
    | Array<{ blobId: string; caption?: string; clientSyncId: string }>
    | undefined;
  if (!refs?.length) return item;

  const photoCaptures = [];
  for (const ref of refs) {
    const blob = await cache.getBlob(ref.blobId);
    if (!blob) continue;
    photoCaptures.push({
      dataUrl: await blobToDataUrl(blob),
      caption: ref.caption,
      clientSyncId: ref.clientSyncId,
      mimeType: blob.type || "image/jpeg",
      fileName: `${ref.clientSyncId}.jpg`,
      defaultSubcontractorCompanyId: item.payload.defaultSubcontractorCompanyId,
    });
  }

  return {
    ...item,
    payload: {
      ...item.payload,
      photoCaptures,
    },
  };
}
