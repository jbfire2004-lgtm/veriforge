import { fetchFieldOfflineBundle, type FieldOfflineBundle } from "@/lib/api/field-sync";
import type { LocalCacheStore } from "./cache-store";

export type OfflineBundleApplyResult = {
  applied: number;
  syncedAt: string;
};

type CachedCredential = {
  id: number;
  workerId?: number;
  certificateQrToken?: string | null;
  lastVerificationStatus?: string | null;
  expiresAt?: string | null;
  certification?: { id: number; name: string; code?: string | null };
  worker?: { id: number; firstName: string; lastName: string; qrToken?: string | null };
};

async function indexCredentialQr(
  cache: LocalCacheStore,
  record: CachedCredential,
): Promise<void> {
  if (!record.certificateQrToken) return;
  const label =
    record.certification?.name ??
    (record.worker
      ? `${record.worker.firstName} ${record.worker.lastName}`.trim()
      : undefined);
  await cache.putQrRegistry({
    id: `cert:${record.certificateQrToken}`,
    kind: "credential",
    entityId: record.id,
    label,
    cachedAt: new Date().toISOString(),
  });
}

/** Pull worker-scoped offline bundle and merge into encrypted cache. */
export async function applyOfflineBundle(
  cache: LocalCacheStore,
  params: { companyId?: number; workerId?: number },
): Promise<OfflineBundleApplyResult> {
  const bundle = await fetchFieldOfflineBundle(params);
  let applied = 0;

  applied += await mergeOfflineBundle(cache, bundle);
  await cache.setMeta("lastOfflineBundleAt", bundle.syncedAt);
  if (params.workerId != null) {
    await cache.setMeta("offlineWorkerId", String(params.workerId));
  }

  return { applied, syncedAt: bundle.syncedAt };
}

export async function mergeOfflineBundle(
  cache: LocalCacheStore,
  bundle: FieldOfflineBundle,
): Promise<number> {
  let applied = 0;

  const worker = bundle.worker as {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    qrToken?: string;
    status?: string;
  } | null;

  if (worker) {
    await cache.put("worker", worker.id, {
      id: worker.id,
      label: `${worker.firstName} ${worker.lastName}`.trim(),
      email: worker.email,
      phone: worker.phone,
      qrToken: worker.qrToken,
      status: worker.status,
      compliant: true,
    });
    await cache.put("userProfile", worker.id, worker);
    applied += 2;
  }

  for (const assignment of bundle.projectAssignments as {
    projectId: number;
    workerId: number;
    companyId: number;
    role?: string | null;
    status?: string;
  }[]) {
    await cache.put(
      "projectAssignment",
      `${assignment.workerId}:${assignment.projectId}`,
      assignment,
    );
    applied += 1;
  }

  for (const p of bundle.projects as { id: number; name?: string; status?: string }) {
    await cache.put("project", p.id, p);
    applied += 1;
  }

  for (const form of bundle.safetyForms as { id: string; projectId?: number | null }) {
    await cache.put("safetyFormDraft", form.id, form);
    applied += 1;
  }

  for (const cred of bundle.credentials as CachedCredential[]) {
    await cache.put("trainingRecord", cred.id, cred);
    await indexCredentialQr(cache, cred);
    applied += 1;
  }

  for (const def of bundle.safetyFormDefinitions as { id: string; name: string }) {
    await cache.put("safetyFormDefinition", def.id, def);
    applied += 1;
  }

  for (const tpl of bundle.safetyFormTemplates as { id: string; formType: string }) {
    await cache.put("safetyFormTemplate", tpl.id, tpl);
    applied += 1;
  }

  return applied;
}

export async function listCachedProjectSafetyForms(
  cache: LocalCacheStore,
  projectId: number,
): Promise<unknown[]> {
  const rows = await cache.listByType<{ projectId?: number | null }>("safetyFormDraft");
  return rows
    .map((r) => r.data)
    .filter((row) => row.projectId === projectId);
}
