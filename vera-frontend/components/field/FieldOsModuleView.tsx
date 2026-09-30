"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, BarChart3, CloudOff, RefreshCw, Users, Wrench } from "lucide-react";
import { FieldModuleShell } from "./FieldModuleShell";
import { useFieldMode } from "./FieldModeProvider";
import { binderQuery } from "@/lib/field/binder-sections";
import {
  formatBinderStatChip,
  loadBinderLiveStats,
  type BinderLiveStats,
} from "@/lib/field/binder-live-stats";
import type { FieldOsModuleId } from "@/lib/field/modules";
import { runOfflineIntelligence } from "@/lib/intelligence/offline";
import type { SyncQueueItem } from "@/lib/field";

type Props = {
  moduleId: FieldOsModuleId;
  projectId?: number;
  companyId?: number;
};

function fmt(n: number | null | undefined, empty = "—") {
  if (n == null) return empty;
  return String(n);
}

export function FieldOsModuleView({ moduleId, projectId, companyId }: Props) {
  const {
    queue,
    pendingCount,
    failedCount,
    isOnline,
    syncNow,
    syncing,
    preload,
    cache,
  } = useFieldMode();
  const [stats, setStats] = useState<BinderLiveStats | null>(null);
  const [tasks, setTasks] = useState<SyncQueueItem[]>([]);
  const [lastPreload, setLastPreload] = useState<string | null>(null);
  const [readiness, setReadiness] = useState<number | null>(null);
  const qs = binderQuery(projectId, companyId);

  useEffect(() => {
    void loadBinderLiveStats({ projectId, companyId }).then(setStats);
  }, [projectId, companyId, isOnline]);

  useEffect(() => {
    void queue.list().then((items) =>
      setTasks(items.filter((t) => t.status === "pending" || t.status === "failed")),
    );
  }, [queue, pendingCount, failedCount, syncing]);

  useEffect(() => {
    if (!cache) return;
    void preload(companyId).then(() => {
      void cache.getMeta("lastPreloadAt").then((t) => setLastPreload(t ?? null));
    });
  }, [cache, companyId, preload]);

  useEffect(() => {
    const intel = runOfflineIntelligence({
      companyId,
      offline: !isOnline,
      complianceOk: pendingCount === 0 && failedCount === 0,
    });
    setReadiness(intel.readiness.score);
  }, [companyId, pendingCount, failedCount, isOnline]);

  switch (moduleId) {
    case "equipment_readiness": {
      const alerts = stats?.equipmentAlerts;
      const tone =
        alerts != null && alerts > 0 ? "warn" : isOnline ? "ok" : "warn";
      return (
        <FieldModuleShell
          moduleId={moduleId}
          projectId={projectId}
          companyId={companyId}
          icon={Wrench}
          statusLabel={formatBinderStatChip(
            moduleId,
            stats,
            isOnline ? "Checking equipment…" : "Offline pack",
          )}
          statusTone={tone}
          kpis={[
            {
              label: "Equipment alerts",
              value: fmt(alerts),
              hint: "From Field Operations",
            },
            {
              label: "Queue",
              value: fmt(pendingCount),
              hint: failedCount ? `${failedCount} failed` : "Pending sync",
            },
          ]}
          actions={[
            { label: "Scan equipment", href: `/field/scan${qs}`, primary: true },
            { label: "Equipment safety", href: `/pm/equipment-safety${qs}` },
            { label: "Field operations", href: `/field/operations${qs}` },
          ]}
        >
          <p className="text-sm text-[var(--muted-foreground)]">
            Scan QR tags before use. Out-of-service and overdue inspection alerts
            surface here when Field Operations data is available.
          </p>
        </FieldModuleShell>
      );
    }

    case "crew_readiness": {
      const gaps = stats?.trainingGaps;
      const tone =
        gaps != null && gaps > 0 ? "warn" : isOnline ? "ok" : "warn";
      return (
        <FieldModuleShell
          moduleId={moduleId}
          projectId={projectId}
          companyId={companyId}
          icon={Users}
          statusLabel={formatBinderStatChip(
            moduleId,
            stats,
            isOnline ? "Checking crew…" : "Offline pack",
          )}
          statusTone={tone}
          kpis={[
            {
              label: "Training gaps",
              value: fmt(gaps),
              hint: "Expiring / missing tickets",
            },
            {
              label: "Scan queue",
              value: fmt(pendingCount),
              hint: "Pending uploads",
            },
          ]}
          actions={[
            { label: "Worker scan", href: `/field/scan${qs}`, primary: true },
            {
              label: "Training dashboard",
              href: `/admin/training/dashboard${qs}`,
            },
            { label: "Core readiness", href: `/core/readiness${qs}` },
          ]}
        >
          <p className="text-sm text-[var(--muted-foreground)]">
            Verify worker tickets at the gate or muster. Gaps queue for sync when
            you reconnect.
          </p>
        </FieldModuleShell>
      );
    }

    case "safety_pulse": {
      return (
        <FieldModuleShell
          moduleId={moduleId}
          projectId={projectId}
          companyId={companyId}
          icon={Activity}
          statusLabel={formatBinderStatChip(
            moduleId,
            stats,
            isOnline ? "Safety pulse live" : "Offline pack",
          )}
          statusTone={isOnline ? "ok" : "warn"}
          kpis={[
            {
              label: "Active permits",
              value: fmt(stats?.permitsActive),
              hint: stats?.permitsTotal != null
                ? `${stats.permitsTotal} total`
                : "Field permits",
            },
            {
              label: "Incidents open",
              value: fmt(stats?.incidentsOpen),
              hint: "Linked capture",
            },
          ]}
          actions={[
            {
              label: "Permits & forms",
              href: `/field/permits${qs}`,
              primary: true,
            },
            { label: "Safety meetings", href: `/pm/safety-meetings${qs}` },
            { label: "FLHA", href: `/field/safety/flha${qs}` },
            {
              label: "Emergency quick access",
              href: `/pm/emergency-response/quick${qs}`,
            },
            {
              label: "ERP drill",
              href: `/pm/emergency-response/drill${qs}`,
            },
          ]}
        >
          <p className="text-sm text-[var(--muted-foreground)]">
            Daily safety pulse for toolbox talks, active permits, and emergency
            routes — fill FLHA/JHA offline when needed.
          </p>
        </FieldModuleShell>
      );
    }

    case "task_sync": {
      const tone =
        failedCount > 0 || pendingCount > 0 ? "warn" : isOnline ? "ok" : "warn";
      return (
        <FieldModuleShell
          moduleId={moduleId}
          projectId={projectId}
          companyId={companyId}
          icon={RefreshCw}
          statusLabel={
            failedCount > 0
              ? `${failedCount} failed`
              : pendingCount > 0
                ? `${pendingCount} pending`
                : isOnline
                  ? "Queue clear"
                  : "Offline — queue held"
          }
          statusTone={tone}
          kpis={[
            { label: "Pending", value: fmt(pendingCount) },
            { label: "Failed", value: fmt(failedCount) },
            {
              label: "In view",
              value: fmt(tasks.length),
              hint: "Queued actions",
            },
          ]}
          actions={[
            { label: "Open sync queue", href: `/field/pending${qs}`, primary: true },
            { label: "Resolve conflicts", href: `/field/conflicts${qs}` },
            { label: "Permits tasks", href: `/field/permits${qs}` },
          ]}
        >
          <ul className="space-y-1.5 text-sm">
            {tasks.length === 0 ? (
              <li className="text-[var(--muted-foreground)]">
                No pending or failed sync items.
              </li>
            ) : (
              tasks.slice(0, 8).map((t) => (
                <li
                  key={t.id}
                  className="flex justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5"
                >
                  <span className="font-medium">{t.type.replace(/\./g, " · ")}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {t.status}
                  </span>
                </li>
              ))
            )}
          </ul>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-teal-800 underline-offset-2 hover:underline"
            disabled={syncing}
            onClick={() => void syncNow()}
          >
            {syncing ? "Syncing…" : "Sync binder now"}
          </button>
        </FieldModuleShell>
      );
    }

    case "incident_capture": {
      const open = stats?.incidentsOpen;
      const tone =
        open != null && open > 0 ? "warn" : isOnline ? "ok" : "warn";
      return (
        <FieldModuleShell
          moduleId={moduleId}
          projectId={projectId}
          companyId={companyId}
          icon={AlertTriangle}
          statusLabel={formatBinderStatChip(
            moduleId,
            stats,
            isOnline ? "Ready to capture" : "Offline pack",
          )}
          statusTone={tone}
          kpis={[
            {
              label: "Open incidents",
              value: fmt(open),
              hint: "Project scope",
            },
            {
              label: "Queued uploads",
              value: fmt(pendingCount),
              hint: failedCount ? `${failedCount} failed` : "Sync later",
            },
          ]}
          actions={[
            {
              label: "Capture incident",
              href: `/pm/incidents/new${qs}`,
              primary: true,
            },
            { label: "Incident list", href: `/pm/incidents${qs}` },
            {
              label: "Emergency quick access",
              href: `/pm/emergency-response/quick${qs}`,
            },
          ]}
        >
          <p className="text-sm text-[var(--muted-foreground)]">
            Log events in the field. OHS dangerous-occurrence flags apply when
            connected; offline captures stay in the Task Sync queue.
          </p>
        </FieldModuleShell>
      );
    }

    case "offline_mode": {
      const tone = !isOnline || failedCount > 0 ? "warn" : "ok";
      return (
        <FieldModuleShell
          moduleId={moduleId}
          projectId={projectId}
          companyId={companyId}
          icon={CloudOff}
          statusLabel={
            isOnline
              ? `Online · readiness ${readiness ?? "—"}/100`
              : `Offline · readiness ${readiness ?? "—"}/100`
          }
          statusTone={tone}
          kpis={[
            {
              label: "Connectivity",
              value: isOnline ? "Online" : "Offline",
            },
            {
              label: "Readiness",
              value: readiness != null ? `${readiness}` : "—",
              hint: "/100",
            },
            {
              label: "Pending",
              value: fmt(pendingCount),
              hint: failedCount ? `${failedCount} failed` : "Queue",
            },
            {
              label: "Cache",
              value: lastPreload
                ? new Date(lastPreload).toLocaleString()
                : "—",
              hint: "Last preload",
            },
          ]}
          actions={[
            { label: "Pending queue", href: `/field/pending${qs}`, primary: true },
            { label: "Conflicts", href: `/field/conflicts${qs}` },
            { label: "Offline scan", href: `/field/scan${qs}` },
          ]}
        >
          <p className="text-sm text-[var(--muted-foreground)]">
            Work continues without connectivity. Preload packs when online; sync
            from Task Sync when you reconnect.
          </p>
        </FieldModuleShell>
      );
    }

    case "analytics_snapshot": {
      return (
        <FieldModuleShell
          moduleId={moduleId}
          projectId={projectId}
          companyId={companyId}
          icon={BarChart3}
          statusLabel={formatBinderStatChip(
            moduleId,
            stats,
            isOnline ? "Snapshot ready" : "Offline — limited",
          )}
          statusTone={isOnline ? "ok" : "warn"}
          kpis={[
            {
              label: "Permits active",
              value: fmt(stats?.permitsActive),
            },
            {
              label: "Equip alerts",
              value: fmt(stats?.equipmentAlerts),
            },
            {
              label: "Incidents open",
              value: fmt(stats?.incidentsOpen),
            },
            {
              label: "Training gaps",
              value: fmt(stats?.trainingGaps),
            },
          ]}
          actions={[
            {
              label: "Field operations",
              href: `/field/operations${qs}`,
              primary: true,
            },
            {
              label: "Safety Intelligence",
              href: `/pm/safety-intelligence${qs}`,
            },
            { label: "Projects", href: `/pm/projects${qs}` },
            {
              label: "Action Management",
              href: `/pm/action-management${qs}`,
            },
          ]}
        >
          <p className="text-sm text-[var(--muted-foreground)]">
            Compact binder KPIs. Open Field Operations for trends, regional risk,
            and AI anomaly detail.
          </p>
          {stats?.sourceNotes?.length ? (
            <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">
              Sources: {stats.sourceNotes.join(", ")}
            </p>
          ) : null}
        </FieldModuleShell>
      );
    }

    default:
      return null;
  }
}
