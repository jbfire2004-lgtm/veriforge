import { saveFormDraft, deleteFormDraft } from "../form-drafts";
import type { LocalCacheStore } from "../cache-store";
import type { SyncQueue } from "../sync-queue";
import type { FormDraftRecord, SafetyFormKind } from "../types";

export async function autosaveSafetyFormDraft(
  draft: Omit<FormDraftRecord, "updatedAt" | "clientVersion"> & {
    clientVersion?: number;
  },
): Promise<FormDraftRecord> {
  const row: FormDraftRecord = {
    ...draft,
    updatedAt: new Date().toISOString(),
    clientVersion: (draft.clientVersion ?? 0) + 1,
  };
  await saveFormDraft(row);
  return row;
}

export async function submitSafetyFormOffline(
  cache: LocalCacheStore,
  queue: SyncQueue,
  body: {
    kind: SafetyFormKind;
    title: string;
    companyId?: number;
    siteId?: number;
    fields: Record<string, unknown>;
    signatureDataUrl?: string;
    submit?: boolean;
    draftId?: string;
  },
): Promise<{ queueId: string }> {
  const payload = {
    kind: body.kind,
    title: body.title,
    companyId: body.companyId,
    siteId: body.siteId,
    workDescription: body.fields.workDescription,
    hazardSummary: body.fields.hazardSummary,
    controlMeasures: body.fields.controlMeasures,
    jobLocation: body.fields.jobLocation,
    taskStepsJson: body.fields.taskStepsJson
      ? JSON.stringify(body.fields.taskStepsJson)
      : undefined,
    clientTimestamp: new Date().toISOString(),
    submit: body.submit ?? false,
    signatureDataUrl: body.signatureDataUrl,
  };

  const item = await queue.enqueue("safetyForm.submit", payload);
  await cache.put("safetyFormDraft", item.id, { ...payload, pending: true });

  if (body.draftId) {
    await deleteFormDraft(body.draftId);
  }

  return { queueId: item.id };
}
