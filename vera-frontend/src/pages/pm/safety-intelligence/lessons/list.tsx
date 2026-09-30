"use client";

import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CAIL_SOURCE_LABELS,
  fetchLessonClusters,
  fetchLessonsLearned,
  reclusterLessons,
  type LessonCluster,
  type LessonLearnedSummary,
} from "@/lib/safety-intelligence";
import { SfButton, SfCard, SfFloatingInput } from "@/src/components/safety-forms/ui";

export default function LessonsListPage() {
  const [rows, setRows] = useState<LessonLearnedSummary[]>([]);
  const [clusters, setClusters] = useState<LessonCluster[]>([]);
  const [projectId, setProjectId] = useState("1");
  const [loading, setLoading] = useState(true);
  const [reclusterBusy, setReclusterBusy] = useState(false);

  const parsed = useMemo(() => {
    const n = Number(projectId);
    return Number.isSafeInteger(n) && n > 0 ? n : undefined;
  }, [projectId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchLessonsLearned(parsed),
      parsed ? fetchLessonClusters(parsed) : Promise.resolve([]),
    ])
      .then(([lessons, clusterRows]) => {
        setRows(lessons);
        setClusters(clusterRows);
      })
      .finally(() => setLoading(false));
  }, [parsed]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <BookOpen className="h-6 w-6 text-[var(--sf-primary)]" />
          Lessons learned
        </h1>
        <p className="text-sm text-[var(--sf-text-muted)]">
          Published when CAIL entries are verified.
        </p>
      </header>

      <SfCard className="flex flex-wrap items-end gap-4 p-6">
        <SfFloatingInput
          label="Project ID"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="max-w-[140px]"
        />
        {parsed && (
          <SfButton
            type="button"
            variant="secondary"
            disabled={reclusterBusy}
            onClick={() => {
              setReclusterBusy(true);
              void reclusterLessons(parsed)
                .then(() =>
                  fetchLessonClusters(parsed).then((c) => {
                    setClusters(c);
                    return fetchLessonsLearned(parsed);
                  }),
                )
                .then(setRows)
                .finally(() => setReclusterBusy(false));
            }}
          >
            {reclusterBusy ? "Clustering…" : "Recluster (AI embeddings)"}
          </SfButton>
        )}
      </SfCard>

      {clusters.length > 0 && (
        <SfCard className="p-6">
          <h2 className="font-medium">Lesson clusters</h2>
          <ul className="mt-4 space-y-4">
            {clusters.map((c) => (
              <li key={c.clusterId} className="border-b border-[var(--sf-border)] pb-4 last:border-0">
                <p className="text-sm font-medium capitalize">
                  {c.label ?? c.clusterId} ({c.count})
                  {c.embedding ? ` · ${c.embeddingModel ?? "embedded"}` : ""}
                </p>
                {c.meetingTopics && c.meetingTopics.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-xs text-[var(--sf-text-muted)]">
                    {c.meetingTopics.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </SfCard>
      )}

      {loading ? (
        <p className="text-sm text-[var(--sf-text-muted)]">Loading…</p>
      ) : rows.length === 0 ? (
        <SfCard className="p-8 text-center text-sm text-[var(--sf-text-muted)]">
          No lessons yet. Verify CAIL closures to build the library.
        </SfCard>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/pm/safety-intelligence/lessons/${r.id}`}>
                <SfCard className="group flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-xs uppercase text-[var(--sf-text-muted)]">
                      {CAIL_SOURCE_LABELS[r.sourceType]}
                    </p>
                    <h2 className="mt-1 font-medium">{r.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--sf-text-muted)]">
                      {r.summary}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[var(--sf-text-muted)] group-hover:text-[var(--sf-primary)]" />
                </SfCard>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
