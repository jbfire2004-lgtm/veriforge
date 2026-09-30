"use client";

import { VeraPageLayout } from "@/src/components/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  evaluateUnifiedCapaEnforcement,
  fetchUnifiedCapaCailInsights,
  fetchUnifiedCapaDashboard,
  fetchUnifiedCapaList,
  generateUnifiedCapaBatch,
  runUnifiedCapaEscalationSweep,
} from "@/lib/pm-unified-corrective-action";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

type Tab = "actions" | "escalation" | "enforcement" | "insights";

export default function PmUnifiedCorrectiveActionDashboard({
  companyId = 1,
  projectId,
}: {
  companyId?: number;
  projectId?: number;
}) {
  const [tab, setTab] = useState<Tab>("actions");
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [actions, setActions] = useState<Array<Record<string, unknown>>>([]);
  const [insights, setInsights] = useState<Array<Record<string, unknown>>>([]);
  const [enforcement, setEnforcement] = useState<Record<string, unknown> | null>(null);

  const reload = useCallback(() => {
    void fetchUnifiedCapaDashboard(companyId, projectId).then(setDashboard).catch(() => undefined);
    void fetchUnifiedCapaList(companyId, projectId).then(setActions).catch(() => undefined);
    void fetchUnifiedCapaCailInsights(companyId, projectId).then(setInsights).catch(() => undefined);
  }, [companyId, projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const metrics = dashboard?.metrics as Record<string, unknown> | undefined;

  async function runBatchGenerate() {
    if (!projectId) return;
    await generateUnifiedCapaBatch(projectId);
    reload();
  }

  async function runEscalation() {
    if (!projectId) return;
    await runUnifiedCapaEscalationSweep(projectId);
    reload();
  }

  async function runEnforcement() {
    const r = await evaluateUnifiedCapaEnforcement({ companyId, projectId });
    setEnforcement(r);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "actions", label: "Corrective actions" },
    { id: "escalation", label: "Escalation" },
    { id: "enforcement", label: "Enforcement" },
    { id: "insights", label: "CAIL" },
  ];

  return (
    <VeraPageLayout
      title="Unified corrective actions"
      description={`Company #${companyId}${projectId ? ` · Project #${projectId}` : ""}`}
    >
      {metrics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Open</p>
            <p className="text-2xl font-semibold">{String(metrics.open ?? 0)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Overdue</p>
            <p className="text-2xl font-semibold">{String(metrics.overdue ?? 0)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Critical</p>
            <p className="text-2xl font-semibold">{String(metrics.critical ?? 0)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Escalated</p>
            <p className="text-2xl font-semibold">{String(metrics.escalated ?? 0)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">CAPA score</p>
            <p className="text-2xl font-semibold">{String(metrics.companyCapaScore ?? "—")}</p>
          </SfCard>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1 text-sm ${
              tab === t.id
                ? "bg-[var(--sf-primary)] text-white"
                : "bg-[var(--sf-surface-muted)] text-[var(--sf-text-muted)]"
            }`}
          >
            {t.label}
          </button>
        ))}
        <Link href="/pm/corrective-actions/new" className="ml-auto text-sm text-[var(--sf-primary)] hover:underline">
          + New action (legacy form)
        </Link>
      </div>

      {tab === "actions" && (
        <SfCard className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Actions ({actions.length})</h2>
            {projectId ? (
              <SfButton variant="secondary" onClick={() => void runBatchGenerate()}>
                Generate from all modules
              </SfButton>
            ) : null}
          </div>
          <ul className="space-y-2 text-sm">
            {actions.map((a) => (
              <li key={String(a.id)} className="flex justify-between border-b py-2">
                <Link
                  href={`/pm/unified-corrective-action/${String(a.id)}${projectId ? `?projectId=${projectId}` : ""}`}
                  className="hover:underline"
                >
                  {String(a.title)}
                </Link>
                <span className="capitalize text-[var(--sf-text-muted)]">{String(a.status)}</span>
              </li>
            ))}
          </ul>
        </SfCard>
      )}

      {tab === "escalation" && (
        <SfCard className="space-y-3 p-4">
          <h2 className="font-medium">Escalation engine</h2>
          <p className="text-sm text-[var(--sf-text-muted)]">
            Levels 1–5: Reminder → Supervisor → Safety → PM → Company. Triggers on overdue, SIF/HECA, and unsafe equipment.
          </p>
          {projectId ? (
            <SfButton variant="secondary" onClick={() => void runEscalation()}>
              Run escalation sweep
            </SfButton>
          ) : null}
        </SfCard>
      )}

      {tab === "enforcement" && (
        <SfCard className="space-y-3 p-4">
          <h2 className="font-medium">Cross-module enforcement</h2>
          <p className="text-sm text-[var(--sf-text-muted)]">
            Blocks worker access, equipment, zones, task start, permits, JHA approval, and PM scheduling when CAPA rules fail.
          </p>
          <SfButton variant="secondary" onClick={() => void runEnforcement()}>
            Evaluate enforcement
          </SfButton>
          {enforcement ? (
            <div className="text-sm">
              <p className="font-medium">
                {enforcement.allowed ? "Allowed" : "Blocked"}
              </p>
              {Array.isArray(enforcement.blockers) ? (
                <ul className="mt-2 list-disc pl-5 text-[var(--sf-text-muted)]">
                  {(enforcement.blockers as string[]).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </SfCard>
      )}

      {tab === "insights" && (
        <div className="space-y-3">
          {insights.map((i) => (
            <SfCard key={String(i.id)} className="p-4">
              <p className="text-xs uppercase text-[var(--sf-text-muted)]">
                {String(i.category)} · {String(i.severity)}
              </p>
              <h3 className="font-medium">{String(i.title)}</h3>
              <p className="mt-1 text-sm">{String(i.explanation)}</p>
              <p className="mt-2 text-sm text-[var(--sf-primary)]">{String(i.recommendation)}</p>
            </SfCard>
          ))}
        </div>
      )}
    </VeraPageLayout>
  );
}
