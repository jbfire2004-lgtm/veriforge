/**
 * Live FieldOS binder packet stats — best-effort fetches with offline-safe fallbacks.
 */

import { fetchFieldOsPermits } from "@/lib/veripm-fieldos-permits";
import { listPmIncidents } from "@/lib/pm-incidents";
import { fetchPmTrainingAnalytics } from "@/lib/pm-training";
import type { FieldBinderSectionId } from "./binder-sections";

export type BinderLiveStats = {
  loadedAt: string;
  online: boolean;
  permitsActive: number | null;
  permitsTotal: number | null;
  trainingGaps: number | null;
  equipmentAlerts: number | null;
  incidentsOpen: number | null;
  meetingsHint: string | null;
  sourceNotes: string[];
};

const EMPTY: BinderLiveStats = {
  loadedAt: new Date().toISOString(),
  online: typeof navigator === "undefined" ? true : navigator.onLine,
  permitsActive: null,
  permitsTotal: null,
  trainingGaps: null,
  equipmentAlerts: null,
  incidentsOpen: null,
  meetingsHint: null,
  sourceNotes: [],
};

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) {
    return Number(v);
  }
  return null;
}

export async function loadBinderLiveStats(opts?: {
  projectId?: number;
  companyId?: number;
}): Promise<BinderLiveStats> {
  const projectId = opts?.projectId ?? 1;
  const companyId = opts?.companyId ?? 1;
  const online = typeof navigator === "undefined" ? true : navigator.onLine;
  const notes: string[] = [];

  if (!online) {
    return {
      ...EMPTY,
      online: false,
      loadedAt: new Date().toISOString(),
      sourceNotes: ["Offline — showing sync queue status only"],
    };
  }

  const stats: BinderLiveStats = {
    ...EMPTY,
    online: true,
    loadedAt: new Date().toISOString(),
    sourceNotes: notes,
  };

  const results = await Promise.allSettled([
    fetchFieldOsPermits({ projectId, companyId }),
    fetch(`/api/v1/fieldos-operations?regionCode=GLB&period=2026-Q2`).then((r) =>
      r.ok ? r.json() : Promise.reject(new Error("ops")),
    ),
    listPmIncidents(projectId),
    fetchPmTrainingAnalytics(companyId, projectId),
  ]);

  if (results[0].status === "fulfilled") {
    const res = results[0].value as {
      total?: number;
      countsByStatus?: Record<string, number>;
      permits?: unknown[];
    };
    const counts = res.countsByStatus ?? {};
    const active =
      (counts.active ?? 0) +
      (counts.open ?? 0) +
      (counts.in_progress ?? 0) +
      (counts.issued ?? 0);
    stats.permitsTotal = num(res.total) ?? res.permits?.length ?? 0;
    stats.permitsActive = active || stats.permitsTotal;
    notes.push("permits:live");
  } else {
    notes.push("permits:unavailable");
  }

  if (results[1].status === "fulfilled") {
    const dash = results[1].value as {
      data?: { equipmentAlerts?: unknown[]; kpis?: { openFindings?: number } };
      equipmentAlerts?: unknown[];
      kpis?: { openFindings?: number };
    };
    const body = dash.data ?? dash;
    const alerts = body.equipmentAlerts;
    if (Array.isArray(alerts)) {
      stats.equipmentAlerts = alerts.length;
    } else if (body.kpis?.openFindings != null) {
      stats.equipmentAlerts = Number(body.kpis.openFindings);
    }
    notes.push("equipment:live");
  } else {
    notes.push("equipment:unavailable");
  }

  if (results[2].status === "fulfilled") {
    const list = results[2].value as
      | unknown[]
      | { items?: unknown[]; events?: unknown[]; data?: unknown[] };
    const rows = Array.isArray(list)
      ? list
      : Array.isArray(list.items)
        ? list.items
        : Array.isArray(list.events)
          ? list.events
          : Array.isArray(list.data)
            ? list.data
            : [];
    const open = rows.filter((row) => {
      const s = String(
        (row as { status?: string }).status ?? "",
      ).toLowerCase();
      return s === "open" || s === "draft" || s === "submitted" || s === "";
    });
    stats.incidentsOpen = open.length || rows.length;
    notes.push("incidents:live");
  } else {
    notes.push("incidents:unavailable");
  }

  if (results[3].status === "fulfilled") {
    const analytics = results[3].value as Record<string, unknown>;
    const gaps =
      num(analytics.gapCount) ??
      num(analytics.gaps) ??
      num(analytics.expiringSoon) ??
      num(analytics.expiring_soon) ??
      (Array.isArray(analytics.gapList) ? analytics.gapList.length : null) ??
      (Array.isArray(analytics.gapsList) ? analytics.gapsList.length : null);
    stats.trainingGaps = gaps;
    notes.push(gaps != null ? "training:live" : "training:partial");
  } else {
    notes.push("training:unavailable");
  }

  stats.meetingsHint = "Open safety meetings";
  stats.sourceNotes = notes;
  return stats;
}

export function formatBinderStatChip(
  id: FieldBinderSectionId,
  stats: BinderLiveStats | null,
  fallback: string,
): string {
  if (!stats) return fallback;
  if (!stats.online) {
    if (id === "task_sync" || id === "offline_mode") return fallback;
    return "Offline pack";
  }
  switch (id) {
    case "equipment_readiness":
      if (stats.equipmentAlerts != null) {
        return stats.equipmentAlerts > 0
          ? `${stats.equipmentAlerts} alerts`
          : "Ready";
      }
      return fallback;
    case "crew_readiness":
      if (stats.trainingGaps != null) {
        return stats.trainingGaps > 0
          ? `${stats.trainingGaps} gaps`
          : "Crew OK";
      }
      return fallback;
    case "safety_pulse":
      if (stats.permitsActive != null) {
        return `${stats.permitsActive} permits`;
      }
      return stats.meetingsHint ?? fallback;
    case "incident_capture":
      if (stats.incidentsOpen != null) {
        return `${stats.incidentsOpen} open`;
      }
      return fallback;
    case "analytics_snapshot":
      if (stats.equipmentAlerts != null || stats.incidentsOpen != null) {
        const parts = [
          stats.permitsActive != null ? `${stats.permitsActive} permits` : null,
          stats.equipmentAlerts != null
            ? `${stats.equipmentAlerts} alerts`
            : null,
          stats.incidentsOpen != null ? `${stats.incidentsOpen} incidents` : null,
        ].filter(Boolean);
        return parts.slice(0, 2).join(" · ") || fallback;
      }
      return fallback;
    default:
      return fallback;
  }
}
