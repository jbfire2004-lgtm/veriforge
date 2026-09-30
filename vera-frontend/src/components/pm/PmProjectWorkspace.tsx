"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  applyPmDispatch,
  applyPmSchedule,
  assignPmEquipment,
  assignPmWorker,
  createPmScheduleEntry,
  createPmTask,
  createPmWorkPackage,
  fetchPmEquipmentAssignments,
  fetchPmProjectActivity,
  fetchPmProjectDashboard,
  fetchPmProjectReadiness,
  fetchPmSchedule,
  fetchPmTasks,
  fetchPmWorkerAssignments,
  fetchPmWorkPackages,
  optimizePmSchedule,
  publishPmWorkPackage,
  runPmDispatch,
  startPmTask,
  updatePmTaskProgress,
} from "@/lib/pm-project-management";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";
import { PmProjectCompaniesPanel } from "@/src/components/pm/PmProjectCompaniesPanel";
import type { CompanyOption } from "@/src/components/core/CompanySelectField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JobProjectDocumentsPanel } from "@/components/documents/JobProjectDocumentsPanel";

type Tab =
  | "overview"
  | "tasks"
  | "schedule"
  | "assignments"
  | "readiness"
  | "activity"
  | "companies"
  | "predictive"
  | "dispatch"
  | "documents";

export function PmProjectWorkspace({
  projectId,
  companies = [],
}: {
  projectId: number;
  companies?: CompanyOption[];
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [readiness, setReadiness] = useState<Record<string, unknown> | null>(null);
  const [activity, setActivity] = useState<Record<string, unknown> | null>(null);
  const [tasks, setTasks] = useState<Array<Record<string, unknown>>>([]);
  const [schedule, setSchedule] = useState<Array<Record<string, unknown>>>([]);
  const [workPackages, setWorkPackages] = useState<Array<Record<string, unknown>>>([]);
  const [workerAssignments, setWorkerAssignments] = useState<Array<Record<string, unknown>>>([]);
  const [equipmentAssignments, setEquipmentAssignments] = useState<Array<Record<string, unknown>>>([]);
  const [predictiveResult, setPredictiveResult] = useState<Record<string, unknown> | null>(null);
  const [dispatchResult, setDispatchResult] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [assignWorkerId, setAssignWorkerId] = useState("");
  const [assignEquipmentId, setAssignEquipmentId] = useState("");
  const [wpTitle, setWpTitle] = useState("");

  const reload = useCallback(() => {
    void fetchPmProjectDashboard(projectId).then(setDashboard).catch(() => null);
    void fetchPmProjectReadiness(projectId).then(setReadiness).catch(() => null);
    void fetchPmProjectActivity(projectId).then(setActivity).catch(() => null);
    void fetchPmTasks(projectId).then(setTasks).catch(() => setTasks([]));
    void fetchPmSchedule(projectId).then(setSchedule).catch(() => setSchedule([]));
    void fetchPmWorkPackages(projectId).then(setWorkPackages).catch(() => setWorkPackages([]));
    void fetchPmWorkerAssignments(projectId).then(setWorkerAssignments).catch(() => setWorkerAssignments([]));
    void fetchPmEquipmentAssignments(projectId).then(setEquipmentAssignments).catch(() => setEquipmentAssignments([]));
  }, [projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const project = dashboard?.project as Record<string, unknown> | undefined;
  const companyId = Number(project?.companyId ?? 1);
  const metrics = dashboard?.metrics as Record<string, unknown> | undefined;

  async function handleCreateTask() {
    if (!newTaskTitle.trim()) return;
    await createPmTask(projectId, {
      title: newTaskTitle.trim(),
      code: `T-${Date.now().toString(36).slice(-4).toUpperCase()}`,
    });
    setNewTaskTitle("");
    reload();
  }

  async function handleCreateWorkPackage() {
    if (!wpTitle.trim()) return;
    await createPmWorkPackage(projectId, {
      title: wpTitle.trim(),
      code: `WP-${Date.now().toString(36).slice(-4).toUpperCase()}`,
    });
    setWpTitle("");
    reload();
  }

  async function handleAssignWorker() {
    const workerId = Number(assignWorkerId);
    if (!Number.isFinite(workerId)) return;
    await assignPmWorker(projectId, { workerId });
    setAssignWorkerId("");
    reload();
  }

  async function handleAssignEquipment() {
    const equipmentId = Number(assignEquipmentId);
    if (!Number.isFinite(equipmentId)) return;
    await assignPmEquipment(projectId, { equipmentId });
    setAssignEquipmentId("");
    reload();
  }

  async function handleOptimize() {
    try {
      const result = await optimizePmSchedule(projectId, companyId);
      setPredictiveResult(result);
      setMessage("Predictive schedule optimized — review and apply.");
    } catch {
      setMessage("Predictive scheduling requires Predictive tier subscription.");
    }
  }

  async function handleApplySchedule() {
    if (!predictiveResult?.report) return;
    await applyPmSchedule(projectId, predictiveResult.report as Record<string, unknown>);
    setMessage("Schedule applied to project.");
    reload();
  }

  async function handleRunDispatch() {
    try {
      const result = await runPmDispatch(projectId, companyId);
      setDispatchResult(result);
      setMessage("Autonomous dispatch run complete — review and apply.");
    } catch {
      setMessage("Autonomous dispatch requires Autonomous tier subscription.");
    }
  }

  async function handleApplyDispatch() {
    if (!dispatchResult?.report) return;
    await applyPmDispatch(projectId, dispatchResult.report as Record<string, unknown>);
    setMessage("Dispatch assignments applied.");
    reload();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "tasks", label: "Tasks" },
    { id: "schedule", label: "Schedule" },
    { id: "assignments", label: "Assignments" },
    { id: "readiness", label: "Readiness" },
    { id: "activity", label: "Activity" },
    { id: "documents", label: "Documents" },
    { id: "companies", label: "Companies" },
    { id: "predictive", label: "Predictive scheduling" },
    { id: "dispatch", label: "Autonomous dispatch" },
  ];

  const auditEvents =
    (activity?.auditEvents as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header>
        <Link href="/pm/projects" className="text-sm text-teal-700 hover:underline">
          ← All projects
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {String(project?.name ?? `Project #${projectId}`)}
        </h1>
        <p className="text-sm text-slate-500">
          {project?.code ? String(project.code) : ""}
          {readiness?.level ? ` · ${String(readiness.level)}` : ""}
        </p>
      </header>

      {message ? (
        <p className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm text-teal-900">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1 text-sm ${
              tab === t.id ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {metrics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Progress" value={`${readiness?.progressPct ?? metrics.progressPct ?? 0}%`} />
          <MetricCard label="Readiness" value={`${readiness?.readinessScore ?? "—"}`} />
          <MetricCard label="Tasks" value={String(metrics.taskCount ?? tasks.length)} />
          <MetricCard label="Conflicts" value={String(metrics.scheduleConflicts ?? 0)} />
        </div>
      ) : null}

      {tab === "overview" && (
        <SfCard className="space-y-4 p-4">
          <h2 className="font-semibold">Project workflow</h2>
          <p className="text-sm text-slate-600">
            Create work packages → tasks → schedule → assign workers & equipment → track
            readiness and activity.
          </p>
          <div className="flex flex-wrap gap-2">
            <Input
              value={wpTitle}
              onChange={(e) => setWpTitle(e.target.value)}
              placeholder="New work package title"
              className="max-w-xs"
            />
            <Button type="button" onClick={() => void handleCreateWorkPackage()}>
              Add work package
            </Button>
          </div>
          <ul className="divide-y text-sm">
            {workPackages.map((wp) => (
              <li key={String(wp.id)} className="flex justify-between py-2">
                <span>
                  {String(wp.code)} — {String(wp.title)}
                </span>
                <button
                  type="button"
                  className="text-teal-700 hover:underline"
                  onClick={() => void publishPmWorkPackage(String(wp.id)).then(reload)}
                >
                  Publish
                </button>
              </li>
            ))}
          </ul>
        </SfCard>
      )}

      {tab === "tasks" && (
        <SfCard className="space-y-4 p-4">
          <div className="flex flex-wrap gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              className="max-w-xs"
            />
            <Button type="button" onClick={() => void handleCreateTask()}>
              Create task
            </Button>
          </div>
          <ul className="divide-y text-sm">
            {tasks.map((t) => (
              <li key={String(t.id)} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  {String(t.code)} — {String(t.title)} ({String(t.status)})
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-teal-700 hover:underline"
                    onClick={() => void startPmTask(String(t.id)).then(reload)}
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    className="text-teal-700 hover:underline"
                    onClick={() => void updatePmTaskProgress(String(t.id), 100).then(reload)}
                  >
                    Complete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </SfCard>
      )}

      {tab === "schedule" && (
        <SfCard className="space-y-4 p-4">
          <Button
            type="button"
            onClick={() =>
              void createPmScheduleEntry(projectId, {
                title: "Manual schedule block",
                startAt: new Date().toISOString(),
                endAt: new Date(Date.now() + 4 * 3600000).toISOString(),
              }).then(reload)
            }
          >
            Add schedule block
          </Button>
          <ul className="divide-y text-sm">
            {schedule.map((s) => (
              <li key={String(s.id)} className="py-2">
                <div className="font-medium">{String(s.title)}</div>
                <div className="text-slate-500">
                  {new Date(String(s.startAt)).toLocaleString()} →{" "}
                  {new Date(String(s.endAt)).toLocaleString()}
                  {s.conflictFlag ? " · conflict" : ""}
                  {s.safetyBlocked ? " · safety blocked" : ""}
                </div>
              </li>
            ))}
          </ul>
        </SfCard>
      )}

      {tab === "assignments" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <SfCard className="space-y-3 p-4">
            <h3 className="font-medium">Worker assignments</h3>
            <div className="flex gap-2">
              <Input
                value={assignWorkerId}
                onChange={(e) => setAssignWorkerId(e.target.value)}
                placeholder="Worker ID"
                className="w-28"
              />
              <Button type="button" onClick={() => void handleAssignWorker()}>
                Assign
              </Button>
            </div>
            <ul className="divide-y text-sm">
              {workerAssignments.map((a) => (
                <li key={String(a.id)} className="py-2">
                  {(a.worker as { firstName?: string; lastName?: string })?.firstName}{" "}
                  {(a.worker as { firstName?: string; lastName?: string })?.lastName}
                  {" · "}
                  {String(a.status)}
                </li>
              ))}
            </ul>
          </SfCard>
          <SfCard className="space-y-3 p-4">
            <h3 className="font-medium">Equipment assignments</h3>
            <div className="flex gap-2">
              <Input
                value={assignEquipmentId}
                onChange={(e) => setAssignEquipmentId(e.target.value)}
                placeholder="Equipment ID"
                className="w-28"
              />
              <Button type="button" onClick={() => void handleAssignEquipment()}>
                Assign
              </Button>
            </div>
            <ul className="divide-y text-sm">
              {equipmentAssignments.map((a) => (
                <li key={String(a.id)} className="py-2">
                  {(a.equipment as { name?: string })?.name ?? `Equipment #${String(a.equipmentId)}`}
                  {" · "}
                  {String(a.status)}
                </li>
              ))}
            </ul>
          </SfCard>
        </div>
      )}

      {tab === "readiness" && readiness && (
        <SfCard className="grid gap-4 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-slate-500">Readiness score</p>
            <p className="text-3xl font-bold">{String(readiness.readinessScore)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Level</p>
            <p className="text-xl font-semibold">{String(readiness.level)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Blocked tasks</p>
            <p className="text-xl">{String(readiness.blockedTasks)}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Schedule conflicts</p>
            <p className="text-xl">{String(readiness.scheduleConflicts)}</p>
          </div>
        </SfCard>
      )}

      {tab === "activity" && (
        <SfCard className="p-4">
          <h3 className="mb-3 font-medium">Project activity feed</h3>
          <ul className="space-y-2 text-sm">
            {auditEvents.map((e) => (
              <li key={String(e.id)} className="border-b border-slate-100 py-2">
                <span className="font-medium">{String(e.eventType)}</span>
                {" · "}
                {String(e.entityType)} #{String(e.entityId)}
                <span className="block text-xs text-slate-500">
                  {new Date(String(e.createdAt)).toLocaleString()}
                  {e.actor ? ` · ${String(e.actor)}` : ""}
                </span>
              </li>
            ))}
            {auditEvents.length === 0 ? (
              <li className="text-slate-500">No activity yet.</li>
            ) : null}
          </ul>
          <Link href="/core/daily-logs" className="mt-4 inline-block text-sm text-teal-700 hover:underline">
            View daily logs →
          </Link>
        </SfCard>
      )}

      {tab === "companies" && Number.isFinite(companyId) && companyId > 0 ? (
        <PmProjectCompaniesPanel
          projectId={projectId}
          primeCompanyId={companyId}
          companies={companies}
        />
      ) : tab === "companies" ? (
        <SfCard className="p-4 text-sm text-slate-600">
          Project company is not loaded yet. Refresh the page or open from the projects list.
        </SfCard>
      ) : null}

      {tab === "predictive" && (
        <SfCard className="space-y-4 p-4">
          <p className="text-sm text-slate-600">
            Run predictive scheduling to optimize worker and equipment allocation. Requires
            Predictive tier subscription.
          </p>
          <div className="flex gap-2">
            <SfButton onClick={() => void handleOptimize()}>Run optimization</SfButton>
            {predictiveResult ? (
              <SfButton variant="secondary" onClick={() => void handleApplySchedule()}>
                Apply to project
              </SfButton>
            ) : null}
          </div>
          {predictiveResult?.allocation ? (
            <pre className="max-h-64 overflow-auto rounded bg-slate-50 p-3 text-xs">
              {JSON.stringify(predictiveResult.allocation, null, 2)}
            </pre>
          ) : null}
        </SfCard>
      )}

      {tab === "dispatch" && (
        <SfCard className="space-y-4 p-4">
          <p className="text-sm text-slate-600">
            Run autonomous dispatch to auto-assign crew based on readiness. Requires
            Autonomous tier subscription.
          </p>
          <div className="flex gap-2">
            <SfButton onClick={() => void handleRunDispatch()}>Run dispatch</SfButton>
            {dispatchResult ? (
              <SfButton variant="secondary" onClick={() => void handleApplyDispatch()}>
                Apply assignments
              </SfButton>
            ) : null}
          </div>
          {dispatchResult?.dispatch ? (
            <pre className="max-h-64 overflow-auto rounded bg-slate-50 p-3 text-xs">
              {JSON.stringify(dispatchResult.dispatch, null, 2)}
            </pre>
          ) : null}
        </SfCard>
      )}

      {tab === "documents" && (
        <JobProjectDocumentsPanel projectId={projectId} />
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <SfCard className="p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </SfCard>
  );
}
