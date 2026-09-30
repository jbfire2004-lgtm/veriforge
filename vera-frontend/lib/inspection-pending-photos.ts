import type { LocalCacheStore } from "./field/cache-store";
import type { SyncQueue } from "./field/sync-queue";
import type { SyncQueueItem } from "./field/types";
import type { InspectionPhotoDisplayItem } from "./inspection-photo-findings";

function blobToDataUrl(blob: Blob): Promise<string> {
  if (typeof FileReader === "undefined") {
    return blob.arrayBuffer().then((buffer) => {
      const bytes = Buffer.from(buffer);
      const mimeType = blob.type || "application/octet-stream";
      return `data:${mimeType};base64,${bytes.toString("base64")}`;
    });
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function isPendingInspectionPhotoAction(
  item: SyncQueueItem,
  inspectionId: string,
): boolean {
  return (
    item.type === "pmInspectionPhoto.capture" &&
    item.payload.inspectionId === inspectionId &&
    item.status !== "synced"
  );
}

export async function pendingPhotoDisplayFromQueueItem(
  item: SyncQueueItem,
  cache: LocalCacheStore,
): Promise<InspectionPhotoDisplayItem | null> {
  const blobId = item.payload.blobId;
  if (typeof blobId !== "string") return null;

  const blob = await cache.getBlob(blobId);
  const imageUrl = blob ? await blobToDataUrl(blob) : null;
  const caption =
    typeof item.payload.caption === "string" ? item.payload.caption : undefined;
  const checklistItemId =
    typeof item.payload.checklistItemId === "string"
      ? item.payload.checklistItemId
      : null;

  return {
    id: item.id,
    title: caption || "Queued photo",
    imageUrl,
    ocrText: caption || "Awaiting sync — OCR and hazard tags generate when online.",
    hazardTags:
      item.status === "failed"
        ? ["sync failed"]
        : item.status === "syncing"
          ? ["analyzing"]
          : ["pending sync"],
    syncState: item.status,
    checklistItemId,
    lastError: item.lastError,
  };
}

export async function listPendingInspectionPhotos(
  queue: SyncQueue,
  cache: LocalCacheStore | null,
  inspectionId: string,
): Promise<InspectionPhotoDisplayItem[]> {
  if (!cache || !inspectionId) return [];

  const queueItems = await queue.list();
  const relevant = queueItems.filter((item) =>
    isPendingInspectionPhotoAction(item, inspectionId),
  );

  const displays = await Promise.all(
    relevant.map((item) => pendingPhotoDisplayFromQueueItem(item, cache)),
  );
  return displays.filter((row): row is InspectionPhotoDisplayItem => row != null);
}
