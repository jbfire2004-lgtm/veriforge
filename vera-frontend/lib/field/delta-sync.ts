import { fetchFieldDelta } from "@/lib/api/field-sync";
import type { LocalCacheStore } from "./cache-store";

export type DeltaSyncResult = {
  applied: number;
  evicted: number;
  errors: string[];
  syncedAt: string;
};

/**
 * Pull server deltas and merge into encrypted local cache.
 * Supports incremental sync, tasks, work packages, form definitions, and tombstones.
 */
export async function applyDeltaSync(
  cache: LocalCacheStore,
  companyId: number,
): Promise<DeltaSyncResult> {
  const since = await cache.getMeta("lastDeltaSyncAt");
  const bundle = await fetchFieldDelta(companyId, since ?? undefined);
  let applied = 0;
  let evicted = 0;
  const errors: string[] = [];

  try {
    for (const w of bundle.workers as {
      id: number;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      qrToken?: string;
      status?: string;
    }[]) {
      await cache.put("worker", w.id, {
        id: w.id,
        label: `${w.firstName} ${w.lastName}`.trim(),
        email: w.email,
        phone: w.phone,
        qrToken: w.qrToken,
        status: w.status,
        compliant: true,
      });
      applied += 1;
    }

    for (const e of bundle.equipment as {
      equipmentId: number;
      equipment?: { name?: string; safetyStatus?: string };
      complianceStatus?: string;
    }[]) {
      await cache.put("equipment", e.equipmentId, {
        id: e.equipmentId,
        label: e.equipment?.name ?? `Equipment ${e.equipmentId}`,
        lockedOut: e.complianceStatus === "LOCKED_OUT",
        safetyStatus: e.equipment?.safetyStatus,
      });
      applied += 1;
    }

    for (const p of bundle.projects as { id: number; name?: string; status?: string }) {
      await cache.put("project", p.id, p);
      applied += 1;
    }

    for (const t of bundle.trainingRecords as {
      id: number;
      workerId?: number;
      certificateQrToken?: string | null;
      lastVerificationStatus?: string | null;
      certification?: { name?: string };
      worker?: { firstName?: string; lastName?: string };
    }[]) {
      await cache.put("trainingRecord", t.id, t);
      if (t.certificateQrToken) {
        await cache.putQrRegistry({
          id: `cert:${t.certificateQrToken}`,
          kind: "credential",
          entityId: t.id,
          label:
            t.certification?.name ??
            (t.worker
              ? `${t.worker.firstName ?? ""} ${t.worker.lastName ?? ""}`.trim()
              : undefined),
          cachedAt: new Date().toISOString(),
        });
      }
      applied += 1;
    }

    for (const i of bundle.inspections as { id: number }) {
      await cache.put("inspection", i.id, i);
      applied += 1;
    }

    for (const f of bundle.safetyForms as {
      id: string;
      formType?: string | null;
      title?: string | null;
      status?: string;
      projectId?: number | null;
    }[]) {
      await cache.put("safetyFormDraft", f.id, f);
      applied += 1;
    }

    for (const wp of (bundle.workPackages ?? []) as { id: string; projectId: number }) {
      await cache.put("workPackage", wp.id, wp);
      applied += 1;
    }

    for (const task of (bundle.tasks ?? []) as { id: string; projectId: number }) {
      await cache.put("task", task.id, task);
      applied += 1;
    }

    for (const def of (bundle.safetyFormDefinitions ?? []) as {
      id: string;
      name: string;
      category: string;
    }[]) {
      await cache.put("safetyFormDefinition", def.id, def);
      applied += 1;
    }

    for (const snap of bundle.workerWalletSnapshots ?? []) {
      await cache.put("workerWalletBundle", snap.workerId, snap);
      applied += 1;
    }

    for (const tomb of bundle.deleted ?? []) {
      if (tomb.type === "task") {
        await cache.delete("task", tomb.id);
        evicted += 1;
      } else if (tomb.type === "workPackage") {
        await cache.delete("workPackage", tomb.id);
        evicted += 1;
      }
    }

    await cache.setMeta("lastDeltaSyncAt", bundle.syncedAt);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Delta merge failed");
  }

  return { applied, evicted, errors, syncedAt: bundle.syncedAt };
}
