import { saveFormDraft, deleteFormDraft } from "../form-drafts";
import type { LocalCacheStore } from "../cache-store";
import type { SyncQueue } from "../sync-queue";

export type SafetyFormV2Draft = {
  id: string;
  definitionId: string;
  companyId?: number;
  projectId?: number;
  siteId?: number;
  workerId?: number;
  formData: Record<string, unknown>;
  submit?: boolean;
  updatedAt: string;
  clientVersion: number;
};

export async function autosaveSafetyFormV2Draft(
  draft: Omit<SafetyFormV2Draft, "updatedAt" | "clientVersion"> & {
    clientVersion?: number;
  },
): Promise<SafetyFormV2Draft> {
  const row: SafetyFormV2Draft = {
    ...draft,
    updatedAt: new Date().toISOString(),
    clientVersion: (draft.clientVersion ?? 0) + 1,
  };
  await saveFormDraft({
    id: row.id,
    kind: "JHA",
    title: row.definitionId,
    companyId: row.companyId,
    siteId: row.siteId,
    fields: row.formData,
    updatedAt: row.updatedAt,
    clientVersion: row.clientVersion,
  });
  return row;
}

export async function submitSafetyFormV2Offline(
  cache: LocalCacheStore,
  queue: SyncQueue,
  body: {
    definitionId: string;
    formData: Record<string, unknown>;
    companyId?: number;
    projectId?: number;
    siteId?: number;
    workerId?: number;
    submit?: boolean;
    draftId?: string;
    signatures?: Array<{ fieldId?: string; signatureData: string }>;
  },
): Promise<{ queueId: string }> {
  const clientSyncId =
    body.draftId ??
    (typeof crypto !== "undefined" ? crypto.randomUUID() : `sf-${Date.now()}`);

  const payload = {
    clientSyncId,
    definitionId: body.definitionId,
    formData: body.formData,
    companyId: body.companyId,
    projectId: body.projectId,
    siteId: body.siteId,
    workerId: body.workerId,
    submit: body.submit ?? false,
    signatures: body.signatures,
    clientTimestamp: new Date().toISOString(),
  };

  const item = await queue.enqueue("safetyFormV2.submit", payload);
  await cache.put("safetyFormDraft", item.id, { ...payload, pending: true });

  if (body.draftId) {
    await deleteFormDraft(body.draftId);
  }

  return { queueId: item.id };
}
