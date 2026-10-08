"use client";

import { WorkerProjectReadinessPanel, WorkerTrainingHydrationPanel } from "@/components/training";
import { useCallback, useEffect, useState } from "react";
import {
  evaluateWorkerEnforcement,
  fetchWorkerCailInsights,
  fetchWorkerSafetyAnalytics,
  fetchWorkerSafetyProfile,
  rebuildWorkerSafetyProfile,
} from "@/lib/pm-worker-safety-profile";
import { SfButton } from "@/src/components/safety-forms/ui";
import { TrainingCompetencyEnginePanel } from "@/src/components/pm/TrainingCompetencyEnginePanel";
import {
  PmFilterChips,
  PmMetricCard,
  PmMetricGrid,
  PmPageShell,
  PmSurfaceCard,
} from "@/src/components/pm/layout";

type Tab = "overview" | "training" | "access" | "insights";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "training", label: "Training" },
  { id: "access", label: "Access logs" },
  { id: "insights", label: "CAIL" },
] as const;

export default function PmWorkerSafetyProfileDashboard({
  workerId = 1,
  projectId,
}: {
  workerId?: number;
  projectId?: number;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [insights, setInsights] = useState<Array<Record<string, unknown>>>([]);
  const [enforcement, setEnforcement] = useState<Record<string, unknown> | null>(null);

  const reload = useCallback(() => {
    void fetchWorkerSafetyProfile(workerId, projectId).then(setData).catch(() => undefined);
    void fetchWorkerSafetyAnalytics(workerId).then(setAnalytics).catch(() => undefined);
    void fetchWorkerCailInsights(workerId, projectId).then(setInsights).catch(() => undefined);
  }, [workerId, projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const profile = data?.profile as Record<string, unknown> | null | undefined;
  const identity = data?.identity as Record<string, unknown> | undefined;

  async function runEnforcement() {
    if (!projectId) return;
    const r = await evaluateWorkerEnforcement({ workerId, projectId });
    setEnforcement(r);
  }

  return (
    <PmPageShell
      title="Worker safety profile"
      description={
        <>
          {String(identity?.name ?? `Worker #${workerId}`)}
          {projectId ? ` · project #${projectId}` : ""}
        </>
      }
      actions={
        <>
          <SfButton onClick={() => void rebuildWorkerSafetyProfile(workerId, projectId).then(reload)}>
            Rebuild profile
          </SfButton>
          {projectId ? (
            <SfButton variant="secondary" onClick={() => void runEnforcement()}>
              Run enforcement check
            </SfButton>
          ) : null}
        </>
      }
      filters={
        <PmFilterChips
          items={[...TABS]}
          active={tab}
          onChange={(id) => setTab(id as Tab)}
          ariaLabel="Worker profile sections"
        />
      }
    >
      {projectId ? (
        <PmSurfaceCard title="Project readiness (today)">
          <WorkerProjectReadinessPanel
            workerId={workerId}
            projectId={projectId}
            workerName={String(identity?.name ?? "")}
          />
        </PmSurfaceCard>
      ) : null}

      {profile || analytics ? (
        <PmMetricGrid columns={4}>
          <PmMetricCard
            label="Safety score"
            value={String(profile?.safetyScore ?? analytics?.currentScore ?? "—")}
          />
          <PmMetricCard
            label="Risk level"
            value={String(profile?.riskLevel ?? analytics?.riskLevel ?? "—")}
          />
          <PmMetricCard
            label="Training compliance"
            value={`${String(analytics?.trainingCompliancePct ?? "—")}%`}
          />
          <PmMetricCard
            label="Access denials (30d)"
            value={`${String(analytics?.accessDenialRate30d ?? 0)}%`}
          />
        </PmMetricGrid>
      ) : null}

      {enforcement ? (
        <PmSurfaceCard title="Enforcement check">
          <p className="text-sm font-medium">
            {enforcement.allowed ? "Access allowed" : "Access blocked"}
          </p>
          {Array.isArray(enforcement.violations) && enforcement.violations.length > 0 ? (
            <ul className="mt-2 list-disc pl-5 text-sm">
              {(enforcement.violations as string[]).map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          ) : null}
        </PmSurfaceCard>
      ) : null}

      {tab === "overview" ? (
        <PmSurfaceCard title="Profile summary">
          <p className="text-sm text-[var(--muted-foreground)]">
            Use the Training, Access logs, and CAIL tabs for detailed worker safety data hydrated
            from Vera Core.
          </p>
        </PmSurfaceCard>
      ) : null}

      {tab === "training" ? (
        <>
          <WorkerTrainingHydrationPanel workerId={workerId} projectId={projectId} />
          <TrainingCompetencyEnginePanel workerId={workerId} projectId={projectId} />
        </>
      ) : null}

      {tab === "access" && profile ? (
        <PmSurfaceCard title="Access logs">
          <ul className="divide-y divide-[var(--border)] text-sm">
            {((profile.accessLogs as Array<Record<string, unknown>>) ?? []).map((l) => (
              <li key={String(l.id)} className="py-2">
                {l.granted ? "Granted" : "Denied"} ·{" "}
                {new Date(String(l.createdAt)).toLocaleString()}
              </li>
            ))}
          </ul>
        </PmSurfaceCard>
      ) : null}

      {tab === "insights" ? (
        <PmSurfaceCard title="CAIL insights">
          <ul className="space-y-3 text-sm">
            {insights.map((i) => (
              <li key={String(i.title)} className="border-b border-[var(--border)] pb-2 last:border-0">
                <p className="font-medium">{String(i.title)}</p>
                <p className="text-[var(--muted-foreground)]">{String(i.explanation)}</p>
              </li>
            ))}
          </ul>
        </PmSurfaceCard>
      ) : null}
    </PmPageShell>
  );
}
