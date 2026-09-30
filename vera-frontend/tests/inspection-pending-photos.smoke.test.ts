import { describe, expect, it, vi } from "vitest";
import {
  isPendingInspectionPhotoAction,
  listPendingInspectionPhotos,
  pendingPhotoDisplayFromQueueItem,
} from "@/lib/inspection-pending-photos";
import type { LocalCacheStore } from "@/lib/field/cache-store";
import type { SyncQueueItem } from "@/lib/field/types";

function queueItem(
  partial: Partial<SyncQueueItem> & { id: string },
): SyncQueueItem {
  return {
    type: "pmInspectionPhoto.capture",
    payload: {},
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attempts: 0,
    clientVersion: 1,
    ...partial,
  };
}

describe("inspection-pending-photos", () => {
  it("detects pending photo actions for an inspection", () => {
    expect(
      isPendingInspectionPhotoAction(
        queueItem({
          id: "q1",
          payload: { inspectionId: "insp-1" },
        }),
        "insp-1",
      ),
    ).toBe(true);
    expect(
      isPendingInspectionPhotoAction(
        queueItem({
          id: "q2",
          status: "synced",
          payload: { inspectionId: "insp-1" },
        }),
        "insp-1",
      ),
    ).toBe(false);
  });

  it("builds pending display rows from queue blobs", async () => {
    const blob = new Blob(["fake"], { type: "image/jpeg" });
    const cache = {
      getBlob: vi.fn(async () => blob),
    } as unknown as LocalCacheStore;

    const display = await pendingPhotoDisplayFromQueueItem(
      queueItem({
        id: "q3",
        payload: {
          inspectionId: "insp-1",
          blobId: "blob-1",
          caption: "Gate photo",
          checklistItemId: "gate",
        },
      }),
      cache,
    );

    expect(display?.syncState).toBe("pending");
    expect(display?.checklistItemId).toBe("gate");
    expect(display?.ocrText).toBe("Gate photo");
    expect(display?.imageUrl).toMatch(/^data:image\/jpeg;base64,/);
  });

  it("lists pending displays for an inspection", async () => {
    const cache = {
      getBlob: vi.fn(async () => new Blob(["x"], { type: "image/png" })),
    } as unknown as LocalCacheStore;
    const queue = {
      list: vi.fn(async () => [
        queueItem({
          id: "q4",
          payload: {
            inspectionId: "insp-9",
            blobId: "blob-9",
            checklistItemId: "item-photo",
          },
        }),
        queueItem({
          id: "q5",
          payload: { inspectionId: "other" },
        }),
      ]),
    };

    const rows = await listPendingInspectionPhotos(
      queue as never,
      cache,
      "insp-9",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.checklistItemId).toBe("item-photo");
  });
});
