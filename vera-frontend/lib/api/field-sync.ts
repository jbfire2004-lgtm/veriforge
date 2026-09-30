import { apiFetchJson } from "@/lib/api-fetch";
import { getOfflineDeviceId } from "@/lib/field/device-id";

const FIELD_HEADERS = {
  "x-vera-offline-mode": "1",
};

export type FieldDeltaTombstone = {
  type: "task" | "workPackage";
  id: string;
  deletedAt: string;
};

export type FieldDeltaBundle = {
  syncedAt: string;
  since: string | null;
  workers: unknown[];
  equipment: unknown[];
  projects: unknown[];
  trainingRecords: unknown[];
  inspections: unknown[];
  safetyForms: unknown[];
  workPackages?: unknown[];
  tasks?: unknown[];
  safetyFormDefinitions?: unknown[];
  deleted?: FieldDeltaTombstone[];
  workerWalletSnapshots?: WorkerWalletSnapshot[];
  versions: Record<string, number>;
};

export type WorkerWalletSnapshot = {
  workerId: number;
  verifiedCount: number;
  expiringSoon: number;
  expired: number;
  readinessScore: number | null;
  lastSyncedAt: string;
};

export async function fetchFieldDelta(companyId: number, since?: string) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (since) q.set("since", since);
  return apiFetchJson<FieldDeltaBundle>(`/api/v1/field/delta?${q}`, {
    headers: { ...FIELD_HEADERS, "x-vera-client-id": getOfflineDeviceId() },
  });
}

export type FieldOfflineBundle = {
  syncedAt: string;
  worker: unknown | null;
  projectAssignments: unknown[];
  projects: unknown[];
  safetyForms: unknown[];
  credentials: unknown[];
  safetyFormDefinitions: unknown[];
  safetyFormTemplates: unknown[];
};

export async function fetchFieldOfflineBundle(params: {
  companyId?: number;
  workerId?: number;
}) {
  const q = new URLSearchParams();
  if (params.companyId != null) q.set("companyId", String(params.companyId));
  if (params.workerId != null) q.set("workerId", String(params.workerId));
  return apiFetchJson<FieldOfflineBundle>(`/api/v1/field/offline-bundle?${q}`, {
    headers: { ...FIELD_HEADERS, "x-vera-client-id": getOfflineDeviceId() },
  });
}

export async function syncFieldBatch(
  actions: {
    type: string;
    payload: Record<string, unknown>;
    clientTimestamp?: string;
    clientVersion?: number;
  }[],
) {
  const batchId = `batch_${Date.now()}`;
  const clientId = getOfflineDeviceId();
  return apiFetchJson<{
    processed: number;
    failed: number;
    results: { type: string; ok: boolean; error?: string }[];
  }>("/api/v1/sync/batch", {
    method: "POST",
    body: JSON.stringify({
      actions,
      batchId,
      clientId,
    }),
    headers: {
      ...FIELD_HEADERS,
      "x-vera-client-id": clientId,
      "x-vera-sync-batch-id": batchId,
    },
  });
}
