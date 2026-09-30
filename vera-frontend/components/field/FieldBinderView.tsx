"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  CloudOff,
  HardHat,
  RefreshCw,
  Users,
  Wrench,
} from "lucide-react";
import { useFieldMode } from "./FieldModeProvider";
import { SyncStatusBar } from "./SyncStatusBar";
import { Button } from "@/components/ui/button";
import { VeraPageLayout } from "@/src/components/navigation";
import { cn } from "@/src/lib/utils";
import {
  getFieldBinderSections,
  type FieldBinderSectionId,
} from "@/lib/field/binder-sections";
import {
  formatBinderStatChip,
  loadBinderLiveStats,
  type BinderLiveStats,
} from "@/lib/field/binder-live-stats";
import type { SyncQueueItem } from "@/lib/field";
import { runOfflineIntelligence } from "@/lib/intelligence/offline";
import { smsCoreSiblingIntegrations } from "@/lib/sms-core-integrations";
import { SmsCoreFederationStrip } from "@/components/verisuite-intelligence-ui/SmsCoreFederationStrip";

type Props = {
  role: string | null;
  companyId?: number;
  projectId?: number;
};

const SECTION_ICON: Record<
  FieldBinderSectionId,
  ComponentType<{ className?: string }>
> = {
  equipment_readiness: Wrench,
  crew_readiness: Users,
  safety_pulse: Activity,
  task_sync: RefreshCw,
  incident_capture: AlertTriangle,
  offline_mode: CloudOff,
  analytics_snapshot: BarChart3,
};

export function FieldBinderView({ role, companyId, projectId }: Props) {
  const { queue, syncNow, syncing, preload, cache, pendingCount, failedCount, isOnline } =
    useFieldMode();
  const [tasks, setTasks] = useState<SyncQueueItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [offlineReadiness, setOfflineReadiness] = useState<number | null>(null);
  const [liveStats, setLiveStats] = useState<BinderLiveStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activePacket, setActivePacket] = useState<FieldBinderSectionId | null>(
    "equipment_readiness",
  );

  const sections = useMemo(
    () => getFieldBinderSections(projectId, companyId),
    [projectId, companyId],
  );

  useEffect(() => {
    void (async () => {
      const items = await queue.list();
      setTasks(items.filter((t) => t.status === "pending" || t.status === "failed"));
    })();
  }, [queue, pendingCount, syncing]);

  useEffect(() => {
    if (!cache) return;
    void preload(companyId).then(() => {
      void cache.getMeta("lastPreloadAt").then((t) => setLastUpdated(t ?? null));
    });
  }, [cache, companyId, preload]);

  useEffect(() => {
    const intel = runOfflineIntelligence({
      companyId,
      offline: !isOnline,
      complianceOk: pendingCount === 0 && failedCount === 0,
    });
    setOfflineReadiness(intel.readiness.score);
  }, [companyId, pendingCount, failedCount, isOnline]);

  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    void loadBinderLiveStats({ projectId, companyId })
      .then((s) => {
        if (!cancelled) setLiveStats(s);
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, companyId, isOnline]);

  function sectionTone(id: FieldBinderSectionId): "ok" | "warn" | "neutral" {
    if (id === "task_sync") {
      if (failedCount > 0) return "warn";
      if (pendingCount > 0) return "warn";
      return "ok";
    }
    if (id === "offline_mode") {
      if (!isOnline || failedCount > 0) return "warn";
      return "ok";
    }
    if (id === "analytics_snapshot") return isOnline ? "ok" : "neutral";
    if (id === "equipment_readiness" && (liveStats?.equipmentAlerts ?? 0) > 0)
      return "warn";
    if (id === "crew_readiness" && (liveStats?.trainingGaps ?? 0) > 0) return "warn";
    if (id === "incident_capture" && (liveStats?.incidentsOpen ?? 0) > 0)
      return "warn";
    if (id === "safety_pulse" && (liveStats?.permitsActive ?? 0) > 0) return "ok";
    return isOnline ? "ok" : "warn";
  }

  function sectionStatus(id: FieldBinderSectionId): string {
    if (id === "task_sync") {
      if (failedCount > 0) return `${failedCount} failed`;
      if (pendingCount > 0) return `${pendingCount} pending`;
      return isOnline ? "Queue clear" : "Offline — queue held";
    }
    if (id === "offline_mode") {
      return isOnline
        ? `Online · ${offlineReadiness ?? "—"}/100`
        : `Offline · ${offlineReadiness ?? "—"}/100`;
    }
    const fallback = isOnline
      ? statsLoading
        ? "Loading…"
        : "Live"
      : "Offline ready";
    return formatBinderStatChip(id, liveStats, fallback);
  }

  return (
    <VeraPageLayout
      title="FieldOS live binder"
      description="On-site modules: Equipment Readiness, Crew Readiness, Safety Pulse, Task Sync, Incident Capture, Offline Mode, and Analytics Snapshot."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <SyncStatusBar />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={syncing}
            onClick={() => void syncNow()}
          >
            <RefreshCw
              className={cn("mr-1 h-4 w-4", syncing && "animate-spin")}
              aria-hidden
            />
            Sync binder
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <SmsCoreFederationStrip
          title="SMS Core federation"
          items={smsCoreSiblingIntegrations("fieldos", {
            companyId,
            projectId,
          })}
        />
        <div
          className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 px-4 py-3 text-sm"
          role="status"
        >
          <BookOpen className="h-5 w-5 text-[var(--foreground)]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[var(--foreground)]">
              Live field binder
              {role ? (
                <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">
                  · {role}
                </span>
              ) : null}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {isOnline ? "Online" : "Offline"} · readiness{" "}
              {offlineReadiness != null ? `${offlineReadiness}/100` : "—"}
              {lastUpdated
                ? ` · cache ${new Date(lastUpdated).toLocaleString()}`
                : " · preload when online"}
              {liveStats?.permitsActive != null
                ? ` · ${liveStats.permitsActive} permits`
                : ""}
              {liveStats?.equipmentAlerts != null
                ? ` · ${liveStats.equipmentAlerts} equip alerts`
                : ""}
            </p>
          </div>
          <HardHat className="hidden h-5 w-5 text-[var(--muted-foreground)] sm:block" aria-hidden />
        </div>

        <section
          aria-label="Binder integrations"
          className="grid gap-2 sm:grid-cols-3"
        >
          {[
            { label: "Projects", href: `/pm/projects${qs(projectId, companyId)}` },
            {
              label: "Action Management",
              href: `/pm/action-management${qs(projectId, companyId)}`,
            },
            {
              label: "Safety Intelligence",
              href: `/pm/safety-intelligence${qs(projectId, companyId)}`,
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-center text-xs font-semibold hover:bg-[var(--muted)]"
            >
              {link.label}
            </Link>
          ))}
        </section>

        <div className="space-y-3" role="list" aria-label="FieldOS modules">
          {sections.map((section) => {
            const Icon = SECTION_ICON[section.id];
            const tone = sectionTone(section.id);
            const open = activePacket === section.id;
            return (
              <article
                key={section.id}
                role="listitem"
                className={cn(
                  "overflow-hidden rounded-xl border-2 bg-[var(--background)] shadow-sm",
                  tone === "warn"
                    ? "border-amber-500/50"
                    : tone === "ok"
                      ? "border-teal-800/25"
                      : "border-[var(--border)]",
                )}
              >
                <div className="flex border-l-4 border-l-teal-800/80">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-left"
                    onClick={() =>
                      setActivePacket(open ? null : section.id)
                    }
                    aria-expanded={open}
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-teal-800" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                        {section.eyebrow}
                      </span>
                      <span className="block text-base font-semibold text-[var(--foreground)]">
                        {section.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                        {section.description}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        tone === "warn"
                          ? "bg-amber-100 text-amber-900"
                          : tone === "ok"
                            ? "bg-teal-100 text-teal-900"
                            : "bg-[var(--muted)] text-[var(--muted-foreground)]",
                      )}
                    >
                      {sectionStatus(section.id)}
                    </span>
                  </button>
                </div>

                {open ? (
                  <div className="space-y-3 border-t border-[var(--border)] bg-[var(--muted)]/20 px-4 py-3">
                    {section.id === "task_sync" ? (
                      <ul className="space-y-1.5 text-sm">
                        {tasks.length === 0 ? (
                          <li className="text-[var(--muted-foreground)]">
                            No pending sync items in the binder queue.
                          </li>
                        ) : (
                          tasks.slice(0, 6).map((t) => (
                            <li
                              key={t.id}
                              className="flex justify-between gap-2 rounded-md bg-[var(--background)] px-2 py-1.5"
                            >
                              <span className="font-medium">
                                {t.type.replace(/\./g, " · ")}
                              </span>
                              <span className="text-xs text-[var(--muted-foreground)]">
                                {t.status}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    ) : null}

                    {section.offlineCapable ? (
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        Offline capable — changes queue until sync.
                      </p>
                    ) : (
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        Requires connectivity for full module view.
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Link href={section.href}>
                        <Button variant="primary" size="sm">
                          Open {section.label}
                        </Button>
                      </Link>
                      {section.secondary?.map((s) => (
                        <Link key={s.href} href={s.href}>
                          <Button variant="outline" size="sm">
                            {s.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </VeraPageLayout>
  );
}

function qs(projectId?: number, companyId?: number) {
  const q = new URLSearchParams();
  if (projectId != null) q.set("projectId", String(projectId));
  if (companyId != null) q.set("companyId", String(companyId));
  const s = q.toString();
  return s ? `?${s}` : "";
}
