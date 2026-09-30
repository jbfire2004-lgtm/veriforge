"use client";

import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CAIL_SOURCE_LABELS,
  fetchCailProjectDashboard,
  fetchDashboardRevision,
  generateVsiPresentation,
  type CailProjectDashboard,
} from "@/lib/safety-intelligence";
import { SfButton, SfCard, SfFloatingInput, SfKpiCard } from "@/src/components/safety-forms/ui";

export default function CailDashboardPage() {
  const [projectId, setProjectId] = useState("1");
  const [data, setData] = useState<CailProjectDashboard | null>(null);
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const parsedId = useMemo(() => {
    const n = Number(projectId);
    return Number.isSafeInteger(n) && n > 0 ? n : undefined;
  }, [projectId]);

  async function loadDashboard() {
    if (!parsedId) return;
    setLoading(true);
    setError(null);
    try {
      const dash = await fetchCailProjectDashboard(parsedId);
      setData(dash);
      if (dash.dashboardRevision != null) setRevision(dash.dashboardRevision);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dashboard failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, [parsedId]);

  useEffect(() => {
    if (!parsedId) return;
    const timer = setInterval(() => {
      void fetchDashboardRevision(parsedId).then((r) => {
        if (r.revision > revision) {
          setRevision(r.revision);
          void loadDashboard();
        }
      });
    }, 15000);
    return () => clearInterval(timer);
  }, [parsedId, revision]);

  async function exportBrief() {
    if (!parsedId) return;
    const result = await generateVsiPresentation(parsedId);
    setBrief(result.narrative);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <Link
        href="/pm/safety-intelligence"
        className="inline-flex items-center gap-1 text-sm text-[var(--sf-text-muted)]"
      >
        <ArrowLeft className="h-4 w-4" />
        CAIL
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--sf-text)]">
            Safety intelligence dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--sf-text-muted)]">
            CAIL, BBO, lessons learned, and source mix for the project.
          </p>
        </div>
        {parsedId && (
          <SfButton variant="secondary" type="button" onClick={() => void exportBrief()}>
            <FileText className="h-4 w-4" />
            Generate brief
          </SfButton>
        )}
      </header>

      <SfCard className="p-6">
        <SfFloatingInput
          label="Project ID"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="max-w-[160px]"
        />
      </SfCard>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && (
        <p className="text-sm text-[var(--sf-text-muted)]">Loading…</p>
      )}

      {data && !loading && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <SfKpiCard label="Total CAIL" value={data.total} />
            <SfKpiCard label="Open" value={data.open} tone="warning" />
            <SfKpiCard label="Overdue" value={data.overdue} tone="danger" />
            <SfKpiCard
              label="Closure rate"
              value={`${Math.round(data.closureRate * 100)}%`}
              tone="success"
            />
            {data.bbo && (
              <SfKpiCard
                label="BBO positive"
                value={`${Math.round(data.bbo.positiveRatio * 100)}%`}
                tone="success"
              />
            )}
          </div>

          {data.meanTimeToResolveHours != null && (
            <p className="text-sm text-[var(--sf-text-muted)]">
              Mean time to resolve: {data.meanTimeToResolveHours.toFixed(1)} hours
            </p>
          )}

          {data.predictiveRisk && (
            <SfCard className="border-l-4 border-l-[var(--sf-primary)] p-6">
              <h2 className="font-medium">Predictive risk (90-day)</h2>
              <p className="mt-2 text-sm capitalize text-[var(--sf-text)]">
                Level: <strong>{data.predictiveRisk.predictedLevel}</strong> · Score{" "}
                {data.predictiveRisk.score}/100
              </p>
              {data.predictiveRisk.precursors.length > 0 && (
                <ul className="mt-3 list-inside list-disc text-sm text-[var(--sf-text-muted)]">
                  {data.predictiveRisk.precursors.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
            </SfCard>
          )}

          {data.bySource && Object.keys(data.bySource).length > 0 && (
            <SfCard className="p-6">
              <h2 className="font-medium">Source mix</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {Object.entries(data.bySource).map(([k, v]) => (
                  <li key={k} className="text-sm">
                    {CAIL_SOURCE_LABELS[k as keyof typeof CAIL_SOURCE_LABELS] ?? k}:{" "}
                    <strong>{v}</strong>
                  </li>
                ))}
              </ul>
            </SfCard>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <SfCard className="p-6">
              <h2 className="font-medium">Recent CAIL</h2>
              <ul className="mt-4 space-y-2">
                {data.recent.length === 0 ? (
                  <li className="text-sm text-[var(--sf-text-muted)]">None</li>
                ) : (
                  data.recent.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/pm/safety-intelligence/${r.id}`}
                        className="text-sm hover:text-[var(--sf-primary)]"
                      >
                        {r.title} — {r.status}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </SfCard>

            <SfCard className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Recent lessons</h2>
                <Link href="/pm/safety-intelligence/lessons" className="text-xs text-[var(--sf-primary)]">
                  View all
                </Link>
              </div>
              <ul className="mt-4 space-y-2">
                {(data.lessonsRecent ?? []).length === 0 ? (
                  <li className="text-sm text-[var(--sf-text-muted)]">
                    Verify CAIL entries to publish lessons
                  </li>
                ) : (
                  data.lessonsRecent!.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/pm/safety-intelligence/lessons/${l.id}`}
                        className="text-sm hover:text-[var(--sf-primary)]"
                      >
                        {l.title}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </SfCard>
          </div>
        </>
      )}

      {brief && (
        <SfCard className="p-6">
          <h2 className="font-medium">Executive brief</h2>
          <pre className="mt-4 whitespace-pre-wrap text-sm text-[var(--sf-text-muted)]">
            {brief}
          </pre>
        </SfCard>
      )}
    </div>
  );
}
