"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getSubstanceTestDashboard,
  listSubstanceTests,
  listTestPools,
  randomPoolSelect,
  TEST_TYPE_LABELS,
  OUTCOME_LABELS,
  OUTCOME_COLORS,
  type SubstanceTestEvent,
} from "@/lib/pm-substance-testing";
import { WorkspaceHero, WorkspaceMetricCard, WorkspaceSection } from "@/components/theme/workspace";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubstanceTestingDashboard({
  companyId = 1,
  projectId = 1,
}: {
  companyId?: number;
  projectId?: number;
}) {
  const [stats, setStats] = useState<{
    pending: number;
    nonNegative: number;
    recent: SubstanceTestEvent[];
  } | null>(null);
  const [tests, setTests] = useState<SubstanceTestEvent[]>([]);
  const [pools, setPools] = useState<Array<{ id: string; name: string; _count: { members: number } }>>([]);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    void getSubstanceTestDashboard(companyId, projectId).then(setStats);
    void listSubstanceTests({ companyId, projectId }).then(setTests);
    void listTestPools(companyId).then(setPools).catch(() => undefined);
  }, [companyId, projectId]);

  async function runRandom(poolId: string) {
    const test = await randomPoolSelect(poolId, { projectId });
    window.location.href = `/pm/substance-testing/${test.id}?projectId=${projectId}`;
  }

  const filtered = filter
    ? tests.filter((t) => t.testType === filter)
    : tests;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <WorkspaceHero
        title="Drug & Alcohol Testing"
        description="Random, post-incident, and reasonable suspicion testing with chain of custody, result recording, and automated compliance."
        actions={
          <Link href={`/pm/substance-testing/new?companyId=${companyId}&projectId=${projectId}`}>
            <Button type="button" size="sm">
              + Schedule test
            </Button>
          </Link>
        }
      />

      {!stats ? (
        <Skeleton className="h-24 w-full rounded-2xl" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <WorkspaceMetricCard label="Pending tests" value={stats.pending} />
          <WorkspaceMetricCard label="Non-negative / refusal / tampered" value={stats.nonNegative} accent="warning" />
          <WorkspaceMetricCard label="Recent activity" value={stats.recent.length} />
        </div>
      )}

      {pools.length > 0 ? (
        <WorkspaceSection title="Random selection pools">
          <div className="flex flex-wrap gap-3">
            {pools.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-[#2A2E33]/10 bg-white px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#2A2E33]">{p.name}</p>
                  <p className="text-xs text-[#64748b]">{p._count.members} workers</p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => void runRandom(p.id)}>
                  Random select
                </Button>
              </div>
            ))}
          </div>
        </WorkspaceSection>
      ) : null}

      <WorkspaceSection title="All tests">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-full px-3 py-1 text-xs font-medium ${!filter ? "bg-[#2A2E33] text-white" : "bg-[#f1f5f9] text-[#64748b]"}`}
            onClick={() => setFilter("")}
          >
            All
          </button>
          {(Object.keys(TEST_TYPE_LABELS) as Array<keyof typeof TEST_TYPE_LABELS>).map((t) => (
            <button
              key={t}
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-medium ${filter === t ? "bg-[#2A2E33] text-white" : "bg-[#f1f5f9] text-[#64748b]"}`}
              onClick={() => setFilter(t)}
            >
              {TEST_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="divide-y divide-[#2A2E33]/10 rounded-2xl border border-[#2A2E33]/10 bg-white">
          {filtered.length ? (
            filtered.map((t) => (
              <Link
                key={t.id}
                href={`/pm/substance-testing/${t.id}?projectId=${projectId}`}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-[#f8fafc]"
              >
                <div>
                  <p className="text-sm font-medium text-[#2A2E33]">
                    {t.worker.firstName} {t.worker.lastName}
                  </p>
                  <p className="text-xs text-[#64748b]">
                    {TEST_TYPE_LABELS[t.testType]} · {t.status.replace(/_/g, " ")}
                    {t.project?.name ? ` · ${t.project.name}` : ""}
                  </p>
                </div>
                {t.result ? (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${OUTCOME_COLORS[t.result.outcome]}`}
                  >
                    {OUTCOME_LABELS[t.result.outcome]}
                  </span>
                ) : (
                  <span className="text-xs text-[#64748b]">Pending result</span>
                )}
              </Link>
            ))
          ) : (
            <p className="p-6 text-sm text-[#64748b]">No tests found.</p>
          )}
        </div>
      </WorkspaceSection>
    </div>
  );
}
