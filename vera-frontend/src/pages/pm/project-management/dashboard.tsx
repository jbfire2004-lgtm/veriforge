"use client";

import { useCallback, useEffect, useState } from "react";
import {
  configurePmProject,
  fetchPmProjectAnalytics,
  fetchPmProjectCailInsights,
  fetchPmProjectDashboard,
  fetchPmPermits,
  fetchPmSchedule,
  fetchPmTasks,
  fetchPmWorkPackages,
} from "@/lib/pm-project-management";
import { SfButton } from "@/src/components/safety-forms/ui";
import {
  PmFilterChips,
  PmMetricCard,
  PmMetricGrid,
  PmPageShell,
  PmSurfaceCard,
} from "@/src/components/pm/layout";

type Tab = "overview" | "work-packages" | "tasks" | "schedule" | "permits" | "insights";

export default function PmProjectManagementDashboard({
  projectId = 1,
}: {
  projectId?: number;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [insights, setInsights] = useState<Array<Record<string, unknown>>>([]);
  const [workPackages, setWorkPackages] = useState<Array<Record<string, unknown>>>([]);
  const [tasks, setTasks] = useState<Array<Record<string, unknown>>>([]);
  const [schedule, setSchedule] = useState<Array<Record<string, unknown>>>([]);
  const [permits, setPermits] = useState<Array<Record<string, unknown>>>([]);

  const reload = useCallback(() => {
    void fetchPmProjectDashboard(projectId).then(setDashboard).catch(() => undefined);
    void fetchPmProjectAnalytics(projectId).then(setAnalytics).catch(() => undefined);
    void fetchPmProjectCailInsights(projectId).then(setInsights).catch(() => undefined);
    void fetchPmWorkPackages(projectId).then(setWorkPackages).catch(() => undefined);
    void fetchPmTasks(projectId).then(setTasks).catch(() => undefined);
    void fetchPmSchedule(projectId).then(setSchedule).catch(() => undefined);
    void fetchPmPermits(projectId).then(setPermits).catch(() => undefined);
  }, [projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const project = dashboard?.project as Record<string, unknown> | undefined;
  const metrics = (dashboard?.metrics ?? analytics) as Record<string, unknown> | undefined;
  const forecast = (dashboard?.cail as Record<string, unknown> | undefined)?.forecast as
    | Record<string, unknown>
    | undefined;

  async function runSetup() {
    await configurePmProject(projectId, {
      projectType: "construction",
      scopeOfWorkJson: { summary: "Full PM module setup" },
      zonesJson: [{ code: "SITE", name: "General site" }],
    });
    reload();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "work-packages", label: "Work packages" },
    { id: "tasks", label: "Tasks" },
    { id: "schedule", label: "Schedule" },
    { id: "permits", label: "Permits" },
    { id: "insights", label: "CAIL insights" },
  ];

  return (
    <PmPageShell
      title="Project management"
      description={
        <>
          {String(project?.name ?? `Project #${projectId}`)}
          {project?.code ? ` · ${String(project.code)}` : ""}
        </>
      }
      actions={
        <SfButton variant="secondary" onClick={() => void runSetup()}>
          Run project setup
        </SfButton>
      }
      filters={
        <PmFilterChips
          items={tabs}
          active={tab}
          onChange={(id) => setTab(id as Tab)}
          ariaLabel="Project views"
        />
      }
    >
      {metrics ? (
        <PmMetricGrid columns={4}>
          <PmMetricCard label="Progress" value={`${String(metrics.progressPct ?? 0)}%`} />
          <PmMetricCard
            label="Safety score"
            value={String(metrics.safetyScore ?? forecast?.forecastScore ?? "—")}
          />
          <PmMetricCard label="Blocked tasks" value={String(metrics.blockedTasks ?? 0)} />
          <PmMetricCard label="Schedule conflicts" value={String(metrics.scheduleConflicts ?? 0)} />
        </PmMetricGrid>
      ) : null}

      {tab === "overview" && (
        <PmSurfaceCard
          title="Safety-integrated workflow"
          description="Configure project → publish work packages → schedule tasks with JHA, training, and equipment gating → assign workers and equipment → track progress with CAIL forecasting."
        />
      )}

      {tab === "work-packages" && (
        <PmSurfaceCard title={`Work packages (${workPackages.length})`}>
          <ul className="space-y-2 text-sm">
            {workPackages.map((wp) => (
              <li key={String(wp.id)} className="flex justify-between border-b border-[var(--sf-border)] py-2">
                <span>
                  {String(wp.code)} — {String(wp.title)}
                </span>
                <span className="capitalize text-[var(--sf-text-muted)]">{String(wp.status)}</span>
              </li>
            ))}
            {workPackages.length === 0 ? (
              <li className="text-[var(--sf-text-muted)]">No work packages yet.</li>
            ) : null}
          </ul>
        </PmSurfaceCard>
      )}

      {tab === "tasks" && (
        <PmSurfaceCard title={`Tasks (${tasks.length})`}>
          <ul className="space-y-2 text-sm">
            {tasks.map((t) => (
              <li key={String(t.id)} className="flex justify-between border-b border-[var(--sf-border)] py-2">
                <span>
                  {String(t.code)} — {String(t.title)}
                </span>
                <span className="capitalize text-[var(--sf-text-muted)]">{String(t.status)}</span>
              </li>
            ))}
          </ul>
        </PmSurfaceCard>
      )}

      {tab === "schedule" && (
        <PmSurfaceCard title="Schedule (Gantt data)">
          <ul className="space-y-2 text-sm">
            {schedule.map((s) => (
              <li key={String(s.id)} className="border-b border-[var(--sf-border)] py-2">
                <div className="font-medium">{String(s.title)}</div>
                <div className="text-[var(--sf-text-muted)]">
                  {new Date(String(s.startAt)).toLocaleString()} →{" "}
                  {new Date(String(s.endAt)).toLocaleString()}
                  {s.safetyBlocked ? " · safety blocked" : ""}
                  {s.conflictFlag ? " · conflict" : ""}
                </div>
              </li>
            ))}
          </ul>
        </PmSurfaceCard>
      )}

      {tab === "permits" && (
        <PmSurfaceCard title="Permits">
          <ul className="space-y-2 text-sm">
            {permits.map((p) => (
              <li key={String(p.id)} className="flex justify-between border-b border-[var(--sf-border)] py-2">
                <span>
                  {String(p.permitType)} — {String(p.title)}
                </span>
                <span className="capitalize">{String(p.status)}</span>
              </li>
            ))}
          </ul>
        </PmSurfaceCard>
      )}

      {tab === "insights" && (
        <div className="space-y-3">
          {insights.map((i) => (
            <PmSurfaceCard key={String(i.id)}>
              <p className="text-xs uppercase text-[var(--sf-text-muted)]">
                {String(i.category)} · {String(i.severity)}
              </p>
              <h3 className="font-medium">{String(i.title)}</h3>
              <p className="mt-1 text-sm">{String(i.explanation)}</p>
              <p className="mt-2 text-sm text-[var(--primary)]">{String(i.recommendation)}</p>
            </PmSurfaceCard>
          ))}
          {insights.length === 0 ? (
            <PmSurfaceCard>
              <p className="text-sm text-[var(--muted-foreground)]">
                No CAIL insights for this project.
              </p>
            </PmSurfaceCard>
          ) : null}
        </div>
      )}
    </PmPageShell>
  );
}
