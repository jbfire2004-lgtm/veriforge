"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  HardHat,
  GraduationCap,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  fetchHubWidgetsSummary,
  type HubWidgetsBundle,
} from "@/lib/hub/hub-dashboard-api";
import { HubWidgetShell } from "./HubWidgetShell";

type Props = {
  /** When true, renders expanded layout for /hub/readiness */
  expanded?: boolean;
};

export function HubDailyWidgets({ expanded }: Props) {
  const [data, setData] = useState<HubWidgetsBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchHubWidgetsSummary());
    } catch {
      setData(null);
      setError("Could not load operational widgets. Check that the API is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const vis = data?.visibility ?? {
    workerReadiness: true,
    equipmentReadiness: true,
    trainingExpiring: true,
    safetyAlerts: true,
    projectActivity: true,
  };

  const visibleCount = Object.values(vis).filter(Boolean).length;

  return (
    <section aria-labelledby="hub-widgets-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="hub-widgets-heading" className="text-lg font-semibold text-[#2A2E33]">
            {expanded ? "Readiness dashboard" : "Daily pulse"}
          </h2>
          <p className="text-sm text-[#5a6b7c]">
            {expanded
              ? "Detailed operational readiness across workers, equipment, training, and safety."
              : "Readiness, training, safety, and project activity for today."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-[#5a6b7c] hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={cnIcon(loading)} aria-hidden />
          Refresh
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          {error}
        </div>
      ) : null}

      {!loading && visibleCount === 0 ? (
        <p className="text-sm text-[#5a6b7c]">
          No operational widgets are available for your role. Check back from a supervisor or
          admin account.
        </p>
      ) : (
        <div
          className={
            expanded
              ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          {vis.workerReadiness ? (
            <HubWidgetShell
              title="Worker readiness"
              href={data?.workerReadiness?.href ?? "/admin/workers"}
              loading={loading}
            >
              {data?.workerReadiness ? (
                <WidgetStats
                  icon={Users}
                  primary={`${data.workerReadiness.complianceRate}%`}
                  primaryLabel="compliant"
                  lines={[
                    `${data.workerReadiness.compliant} ready`,
                    `${data.workerReadiness.nonCompliant} need attention`,
                    `${data.workerReadiness.expiringSoon} expiring soon`,
                  ]}
                  footer={
                    data.workerReadiness.topIssues.length > 0 ? (
                      <ul className="mt-2 space-y-0.5 border-t border-slate-100 pt-2">
                        {data.workerReadiness.topIssues.slice(0, 3).map((issue) => (
                          <li key={issue.label} className="text-xs text-[#5a6b7c]">
                            {issue.label}: {issue.count}
                          </li>
                        ))}
                      </ul>
                    ) : null
                  }
                />
              ) : (
                <EmptyWidget message="No worker data yet" />
              )}
            </HubWidgetShell>
          ) : null}

          {vis.equipmentReadiness ? (
            <HubWidgetShell
              title="Equipment readiness"
              href={data?.equipmentReadiness?.href ?? "/admin/equipment"}
              loading={loading}
            >
              {data?.equipmentReadiness ? (
                <WidgetStats
                  icon={HardHat}
                  primary={`${data.equipmentReadiness.complianceRate}%`}
                  primaryLabel="compliant"
                  lines={[
                    `${data.equipmentReadiness.compliant} / ${data.equipmentReadiness.total} units`,
                    `${data.equipmentReadiness.overdueInspection} overdue inspections`,
                  ]}
                />
              ) : (
                <EmptyWidget message="No equipment data yet" />
              )}
            </HubWidgetShell>
          ) : null}

          {vis.trainingExpiring ? (
            <HubWidgetShell
              title="Training expiring"
              href={data?.trainingExpiring?.href ?? "/admin/training"}
              loading={loading}
            >
              {data?.trainingExpiring ? (
                <WidgetStats
                  icon={GraduationCap}
                  primary={String(data.trainingExpiring.expiring30)}
                  primaryLabel="in 30 days"
                  lines={[
                    `${data.trainingExpiring.expired} expired`,
                    `${data.trainingExpiring.expiring60} in 60 days`,
                    `${data.trainingExpiring.expiring90} in 90 days`,
                    `${data.trainingExpiring.gaps} training gaps`,
                  ]}
                  alert={data.trainingExpiring.highRisk > 0}
                />
              ) : (
                <EmptyWidget message="No training records" />
              )}
            </HubWidgetShell>
          ) : null}

          {vis.safetyAlerts ? (
            <HubWidgetShell
              title="Safety alerts"
              href={data?.safetyAlerts?.href ?? "/pm/incidents"}
              loading={loading}
            >
              {data?.safetyAlerts ? (
                <div className="space-y-2">
                  <WidgetStats
                    icon={AlertTriangle}
                    primary={String(data.safetyAlerts.openCount)}
                    primaryLabel="open incidents"
                    lines={[`${data.safetyAlerts.highSeverityCount} high severity`]}
                    alert={data.safetyAlerts.highSeverityCount > 0}
                  />
                  <ul className="space-y-1 border-t border-slate-100 pt-2">
                    {data.safetyAlerts.items.slice(0, expanded ? 8 : 3).map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className="line-clamp-1 text-xs text-[#5a6b7c] hover:text-teal-700"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <EmptyWidget message="No open alerts" />
              )}
            </HubWidgetShell>
          ) : null}

          {vis.projectActivity ? (
            <HubWidgetShell
              title="Project activity"
              href={data?.projectActivity?.href ?? "/pm"}
              loading={loading}
            >
              {data?.projectActivity && data.projectActivity.items.length > 0 ? (
                <div className="space-y-2">
                  <ClipboardList className="h-5 w-5 text-teal-600" aria-hidden />
                  <ul className="space-y-2">
                    {data.projectActivity.items.slice(0, expanded ? 10 : 4).map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className="block text-sm font-medium text-[#2A2E33] hover:text-teal-700"
                        >
                          {item.title}
                        </Link>
                        {item.summary ? (
                          <p className="line-clamp-1 text-xs text-[#5a6b7c]">{item.summary}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <EmptyWidget message="No recent project logs" />
              )}
            </HubWidgetShell>
          ) : null}
        </div>
      )}

      {!expanded && visibleCount > 0 ? (
        <Link
          href="/hub/readiness"
          className="inline-block text-sm font-medium text-teal-700 hover:underline"
        >
          View full readiness dashboard →
        </Link>
      ) : null}
    </section>
  );
}

function cnIcon(spinning: boolean) {
  return spinning ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5";
}

function WidgetStats({
  icon: Icon,
  primary,
  primaryLabel,
  lines,
  alert,
  footer,
}: {
  icon: typeof Users;
  primary: string;
  primaryLabel: string;
  lines: string[];
  alert?: boolean;
  footer?: ReactNode;
}) {
  return (
    <div>
      <Icon
        className={`h-5 w-5 ${alert ? "text-amber-600" : "text-teal-600"}`}
        aria-hidden
      />
      <p className={`mt-2 text-2xl font-bold ${alert ? "text-amber-700" : "text-[#2A2E33]"}`}>
        {primary}
      </p>
      <p className="text-xs text-[#5a6b7c]">{primaryLabel}</p>
      <ul className="mt-2 space-y-0.5">
        {lines.map((line) => (
          <li key={line} className="text-xs text-[#5a6b7c]">
            {line}
          </li>
        ))}
      </ul>
      {footer}
    </div>
  );
}

function EmptyWidget({ message }: { message: string }) {
  return <p className="text-sm text-[#5a6b7c]">{message}</p>;
}
