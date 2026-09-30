import { saveFormDraft, deleteFormDraft } from "../form-drafts";
import type { LocalCacheStore } from "../cache-store";
import type { SyncQueue } from "../sync-queue";
import type { FormDraftRecord, SafetyFormKind } from "../types";

export type FieldHazardRow = {
  description: string;
  severity: number;
  likelihood: number;
  energyTypes: string[];
};

export type FieldControlRow = {
  description: string;
  controlType: string;
  hazardIndex: number | null;
};

export type JhaFlhaFieldDraft = {
  clientSyncId: string;
  kind: SafetyFormKind;
  companyId: number;
  projectId: number;
  siteId?: number;
  taskDescription: string;
  locationNote: string;
  workScope: string;
  hazards: FieldHazardRow[];
  controls: FieldControlRow[];
  energyTypes: string[];
  workerId: number | null;
  equipmentIds: number[];
  signature: string;
};

export function defaultJhaFlhaFieldDraft(
  kind: SafetyFormKind,
  companyId: number,
  projectId: number,
  siteId?: number,
): JhaFlhaFieldDraft {
  return {
    clientSyncId: `jhaflha_${kind}_${Date.now()}`,
    kind,
    companyId,
    projectId,
    siteId,
    taskDescription: "",
    locationNote: "",
    workScope: "",
    hazards: [{ description: "", severity: 3, likelihood: 3, energyTypes: [] }],
    controls: [{ description: "", controlType: "engineering", hazardIndex: 0 }],
    energyTypes: [],
    workerId: null,
    equipmentIds: [],
    signature: "",
  };
}

export async function autosaveJhaFlhaFieldDraft(draft: JhaFlhaFieldDraft): Promise<FormDraftRecord> {
  const row: FormDraftRecord = {
    id: draft.clientSyncId,
    kind: draft.kind,
    companyId: draft.companyId,
    siteId: draft.siteId,
    title: `${draft.kind} — ${draft.taskDescription || "Draft"}`,
    fields: draft as unknown as Record<string, unknown>,
    signatureDataUrl: draft.signature || undefined,
    updatedAt: new Date().toISOString(),
    clientVersion: 1,
  };
  await saveFormDraft(row);
  return row;
}

export async function submitJhaFlhaFieldOffline(
  cache: LocalCacheStore,
  queue: SyncQueue,
  draft: JhaFlhaFieldDraft,
  opts?: { submit?: boolean },
): Promise<{ queueId: string }> {
  const hazards = draft.hazards
    .filter((h) => h.description.trim())
    .map((h) => ({
      description: h.description.trim(),
      severity: h.severity,
      likelihood: h.likelihood,
      energyTypes: h.energyTypes.length ? h.energyTypes : draft.energyTypes,
    }));

  const controls = draft.controls
    .filter((c) => c.description.trim())
    .map((c) => ({
      description: c.description.trim(),
      controlType: c.controlType,
      hazardIndex: c.hazardIndex ?? undefined,
    }));

  const payload: Record<string, unknown> = {
    clientSyncId: draft.clientSyncId,
    kind: draft.kind,
    companyId: draft.companyId,
    projectId: draft.projectId,
    siteId: draft.siteId,
    taskDescription: draft.taskDescription.trim() || `${draft.kind} field assessment`,
    workScope: draft.workScope.trim() || undefined,
    locationNote: draft.locationNote.trim() || undefined,
    environmentalJson: { source: "field_offline" },
    hazards,
    controls,
    energySources: draft.energyTypes.map((energyType) => ({
      energyType,
      exposureLevel: 3,
    })),
    equipment: draft.equipmentIds.map((equipmentId) => ({
      equipmentId,
      authorized: true,
    })),
    workers: draft.workerId ? [{ workerId: draft.workerId, role: "crew" }] : undefined,
    signatures:
      draft.signature.trim() && draft.workerId
        ? [
            {
              role: "WORKER",
              signatureData: draft.signature.trim(),
              signerName: `Worker ${draft.workerId}`,
              workerId: draft.workerId,
            },
          ]
        : undefined,
    submit: opts?.submit === true,
  };

  await cache.put("safetyFormDraft", draft.clientSyncId, {
    ...payload,
    pending: true,
    savedAt: new Date().toISOString(),
  });

  const item = await queue.enqueue("jhaFlha.sync", payload);
  return { queueId: item.id };
}
