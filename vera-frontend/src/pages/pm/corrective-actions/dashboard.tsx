"use client";

import { VeraPageLayout } from "@/src/components/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchPmCapaAnalytics,
  listPmCorrectiveActions,
  autoSyncPmCapa,
  runPmCapaEscalations,
  type PmCorrectiveAction,
} from "@/lib/pm-corrective-actions";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

export default function PmCapaDashboardPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const [actions, setActions] = useState<PmCorrectiveAction[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(
    null,
  );

  useEffect(() => {
    void listPmCorrectiveActions(projectId).then(setActions).catch(() => undefined);
    void fetchPmCapaAnalytics(projectId)
      .then(setAnalytics)
      .catch(() => undefined);
  }, [projectId]);

  return (
    <VeraPageLayout
      title="Corrective Actions"
      description={`Action Management — assignment, escalation, verification — project #${projectId}`}

      >

      {analytics ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Open</p>
            <p className="text-2xl font-semibold">{String(analytics.open)}</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Overdue</p>
            <p className="text-2xl font-semibold text-red-600">
              {String(analytics.overdue)}
            </p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Closure rate</p>
            <p className="text-2xl font-semibold">{String(analytics.closureRate)}%</p>
          </SfCard>
          <SfCard className="p-4">
            <p className="text-xs uppercase text-[var(--sf-text-muted)]">Leading index</p>
            <p className="text-2xl font-semibold">
              {String(analytics.leadingIndicatorScore)}
            </p>
          </SfCard>
        </div>
      ) : null}

      <SfCard className="p-5">
        <div className="mb-3 flex flex-wrap justify-between gap-2">
          <h2 className="font-medium">Action log</h2>
          <div className="flex gap-2">
            <SfButton
              type="button"
              variant="secondary"
              onClick={() => void runPmCapaEscalations(projectId)}
            >
              Run escalations
            </SfButton>
            <SfButton
              type="button"
              variant="secondary"
              onClick={() => void autoSyncPmCapa(projectId)}
            >
              Sync from modules
            </SfButton>
            <Link href={`/pm/corrective-actions/new?projectId=${projectId}&companyId=${companyId}`}>
              <SfButton type="button">New action</SfButton>
            </Link>
          </div>
        </div>
        <ul className="divide-y text-sm">
          {actions.map((a) => (
            <li key={a.id} className="flex justify-between py-2">
              <Link
                href={`/pm/corrective-actions/${a.id}?projectId=${projectId}`}
                className="hover:text-[var(--sf-primary)]"
              >
                {a.title}
              </Link>
              <span className="text-[var(--sf-text-muted)]">
                P{a.priorityScore} · L{a.escalationLevel} · {a.status}
              </span>
            </li>
          ))}
        </ul>
      </SfCard>
    </VeraPageLayout>
  );
}
