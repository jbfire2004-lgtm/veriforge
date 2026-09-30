import { loadDashboardWidgetsBundle } from "@/lib/dashboard/widgets-api";
import {
  getCompanyEquipment,
  getCompanyProjects,
  getCompanyWorkers,
} from "@/lib/api/vera-core";
import { listInspectionChecklists } from "@/lib/api/inspection";
import type { LocalCacheStore } from "./cache-store";
import type { PreloadScope } from "./types";
import { applyDeltaSync } from "./delta-sync";
import { applyOfflineBundle } from "./offline-bundle";

/**
 * Preload essential field data when online (§2 cache policies).
 */
export async function preloadFieldCache(
  cache: LocalCacheStore,
  scope: PreloadScope
): Promise<{ loaded: number; errors: string[] }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { loaded: 0, errors: ["Offline — using existing cache only"] };
  }

  let loaded = 0;
  const errors: string[] = [];

  if (scope.companyId != null) {
    const companyId = scope.companyId;

    try {
      const workers = await getCompanyWorkers(companyId);
      for (const link of workers) {
        await cache.put("worker", link.workerId, {
          id: link.workerId,
          label: link.worker
            ? `${link.worker.firstName} ${link.worker.lastName}`.trim()
            : `Worker ${link.workerId}`,
          compliant: true,
        });
        await cache.put("companyLink", `${link.workerId}:${companyId}`, link);
        loaded += 2;
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Workers preload failed");
    }

    try {
      const equipment = await getCompanyEquipment(companyId);
      for (const link of equipment) {
        await cache.put("equipment", link.equipmentId, {
          id: link.equipmentId,
          label: link.equipment?.name ?? `Equipment ${link.equipmentId}`,
          compliant: link.complianceStatus === "COMPLIANT",
          lockedOut: link.complianceStatus === "LOCKED_OUT",
        });
        loaded += 1;
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Equipment preload failed");
    }

    try {
      const projects = await getCompanyProjects(companyId);
      for (const p of projects) {
        await cache.put("project", p.id, p);
        loaded += 1;
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Projects preload failed");
    }
  }

  try {
    const checklists = await listInspectionChecklists();
    for (const c of checklists) {
      await cache.put("inspectionChecklist", c.id, c);
      loaded += 1;
    }
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Checklists preload failed");
  }

  try {
    const dash = await loadDashboardWidgetsBundle({ companyId: scope.companyId });
    if (dash.ok) {
      await cache.put("dashboardSummary", "main", dash.data);
      loaded += 1;
    }
  } catch {
    /* optional */
  }

  if (scope.companyId != null) {
    try {
      const delta = await applyDeltaSync(cache, scope.companyId);
      loaded += delta.applied;
      if (delta.errors.length) errors.push(...delta.errors);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Delta sync failed");
    }

    if (scope.workerId != null) {
      try {
        const bundle = await applyOfflineBundle(cache, {
          companyId: scope.companyId,
          workerId: scope.workerId,
        });
        loaded += bundle.applied;
      } catch (e) {
        errors.push(e instanceof Error ? e.message : "Offline bundle failed");
      }
    }
  }

  await cache.setMeta("lastPreloadAt", new Date().toISOString());
  return { loaded, errors };
}
