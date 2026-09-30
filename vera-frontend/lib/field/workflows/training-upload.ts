import { compressImageForOffline } from "../crypto";
import { analyzeDocumentOffline } from "@/lib/vision/offline";
import type { LocalCacheStore } from "../cache-store";
import type { SyncQueue } from "../sync-queue";

export async function uploadTrainingOffline(
  cache: LocalCacheStore,
  queue: SyncQueue,
  body: {
    workerId: number;
    certificationId: number;
    file: File;
    issuedAt?: string;
    expiresAt?: string;
    certificateNumber?: string;
  }
): Promise<{ pendingSyncId: string; blobId: string }> {
  const blobId = `training_${body.workerId}_${Date.now()}`;
  const compressed =
    body.file.type.startsWith("image/")
      ? await compressImageForOffline(body.file)
      : body.file;

  await cache.putBlob(blobId, compressed);

  let visionHints: Record<string, unknown> | undefined;
  if (body.file.type.startsWith("image/") || body.file.type === "text/plain") {
    try {
      const text =
        body.file.type === "text/plain"
          ? await body.file.text()
          : "";
      if (text) {
        const vision = await analyzeDocumentOffline({
          documentType: "training_certificate",
          ocrText: text,
          offline: true,
        });
        visionHints = {
          fields: vision.fields,
          mappings: vision.mappings,
          reviewRequired: vision.reviewRequired,
        };
      }
    } catch {
      /* vision optional offline */
    }
  }

  const record = {
    workerId: body.workerId,
    certificationId: body.certificationId,
    issuedAt: body.issuedAt,
    expiresAt: body.expiresAt,
    certificateNumber: body.certificateNumber,
    offlineBlobId: blobId,
    pending: true,
    visionHints,
  };

  await cache.put("trainingRecord", blobId, record);

  const item = await queue.enqueue("training.upload", {
    workerId: body.workerId,
    blobId,
    record,
  });

  return { pendingSyncId: item.id, blobId };
}
