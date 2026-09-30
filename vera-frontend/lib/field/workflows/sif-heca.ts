import { saveFormDraft } from "../form-drafts";
import type { LocalCacheStore } from "../cache-store";
import type { SyncQueue } from "../sync-queue";
import type { FormDraftRecord } from "../types";

export type FieldSifHazardRow = {
  description: string;
  severity: number;
  likelihood: number;
  energyTypes: string[];
};

export type FieldSifControlRow = {
  description: string;
  controlType: string;
  hazardIndex: number | null;
};

export type SifHecaFieldDraft = {
  clientSyncId: string;
  kind: "SIF" | "HECA";
  companyId: number;
  projectId: number;
  siteId?: number;
  workerId: number | null;
  title: string;
  jobDescription: string;
  workScope: string;
  locationNote: string;
  environmentNote: string;
  equipmentNote: string;
  hazards: FieldSifHazardRow[];
  controls: FieldSifControlRow[];
  energyTypes: string[];
};

export function defaultSifHecaFieldDraft(
  kind: "SIF" | "HECA",
  companyId: number,
  projectId: number,
  siteId?: number,
): SifHecaFieldDraft {
  return {
    clientSyncId: `sifheca_${kind}_${Date.now()}`,
    kind,
    companyId,
    projectId,
    siteId,
    workerId: null,
    title: "",
    jobDescription: "",
    workScope: "",
    locationNote: "",
    environmentNote: "",
    equipmentNote: "",
    hazards: [{ description: "", severity: 4, likelihood: 3, energyTypes: [] }],
    controls: [{ description: "", controlType: "engineering", hazardIndex: 0 }],
    energyTypes: [],
  };
}

export async function autosaveSifHecaFieldDraft(draft: SifHecaFieldDraft): Promise<FormDraftRecord> {
  const row: FormDraftRecord = {
    id: draft.clientSyncId,
    kind: draft.kind,
    companyId: draft.companyId,
    siteId: draft.siteId,
    title: `${draft.kind} — ${draft.title || "Draft"}`,
    fields: draft as unknown as Record<string, unknown>,
    updatedAt: new Date().toISOString(),
    clientVersion: 1,
  };
  await saveFormDraft(row);
  return row;
}

export async function submitSifHecaFieldOffline(
  cache: LocalCacheStore,
  queue: SyncQueue,
  draft: SifHecaFieldDraft,
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
      adequate: true,
      effectivenessScore: 4,
    }));

  const payload: Record<string, unknown> = {
    clientSyncId: draft.clientSyncId,
    assessmentKind: draft.kind,
    companyId: draft.companyId,
    projectId: draft.projectId,
    siteId: draft.siteId,
    workerId: draft.workerId ?? undefined,
    sourceType: "general",
    title: draft.title.trim() || `${draft.kind} field assessment`,
    jobDescription: draft.jobDescription.trim() || undefined,
    workScope: draft.workScope.trim() || undefined,
    locationNote: draft.locationNote.trim() || undefined,
    environmentNote: draft.environmentNote.trim() || undefined,
    equipmentNote: draft.equipmentNote.trim() || undefined,
    hazards,
    controls,
    energyTypes: draft.energyTypes,
    submit: opts?.submit === true,
  };

  await cache.put("safetyFormDraft", draft.clientSyncId, {
    ...payload,
    pending: true,
    savedAt: new Date().toISOString(),
  });

  const item = await queue.enqueue("sifHeca.sync", payload);
  return { queueId: item.id };
}
