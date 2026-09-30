"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Shield } from "lucide-react";
import { VerifiedByVeraBadge } from "@/src/components/verification/VerifiedByVeraBadge";
import { WorkerFitTestPanel } from "@/components/workers/WorkerFitTestPanel";
import { WorkerSafetyKnowledgeSummaryCard } from "@/components/workers/WorkerSafetyKnowledgeSummaryCard";
import { getWorkerProfile } from "@/lib/api/vera-core";
import { fetchWorkerReadiness } from "@/lib/core/vera-core-platform";

type Props = { workerId: number };

export function CoreWorkerProfileView({ workerId }: Props) {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [readiness, setReadiness] = useState<Awaited<
    ReturnType<typeof fetchWorkerReadiness>
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      getWorkerProfile(workerId).catch(() => null),
      fetchWorkerReadiness(workerId).catch(() => null),
    ])
      .then(([p, r]) => {
        setProfile(p as Record<string, unknown> | null);
        setReadiness(r);
      })
      .catch(() => setError("Could not load worker profile"))
      .finally(() => setLoading(false));
  }, [workerId]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading profile…</p>;
  }

  if (error || !profile) {
    return <p className="text-sm text-amber-700">{error ?? "Worker not found"}</p>;
  }

  const firstName = String(profile.firstName ?? "");
  const lastName = String(profile.lastName ?? "");
  const trainingRecords = (profile.trainingRecords as Array<Record<string, unknown>>) ?? [];
  const companyLinks = (profile.companyLinks as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="space-y-8">
      <Link href="/core/workers" className="inline-flex items-center gap-1 text-sm text-teal-700 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to workers
      </Link>

      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {firstName} {lastName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Worker ID {workerId}
          {profile.email ? ` · ${String(profile.email)}` : ""}
        </p>
        {readiness ? (
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="rounded-xl bg-teal-50 px-4 py-2">
              <p className="text-xs font-semibold uppercase text-teal-800">Readiness score</p>
              <p className="text-2xl font-bold text-teal-900">{readiness.score}%</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2">
              <p className="text-xs font-semibold uppercase text-slate-600">Compliance</p>
              <p className="text-lg font-semibold">
                {readiness.isCompliant ? "Compliant" : "Needs attention"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-2">
              <p className="text-xs font-semibold uppercase text-slate-600">Training</p>
              <p className="text-lg font-semibold">
                {readiness.training.expired} expired · {readiness.training.expiring30} expiring
              </p>
            </div>
            {readiness.fitTest ? (
              <div
                className={`rounded-xl px-4 py-2 ${
                  readiness.fitTest.pass ? "bg-teal-50" : "bg-amber-50"
                }`}
              >
                <p className="text-xs font-semibold uppercase text-slate-600">Fit test</p>
                <p className="text-lg font-semibold">{readiness.fitTest.statusLabel}</p>
              </div>
            ) : null}
            {readiness.safetyKnowledge ? (
              <div className="rounded-xl bg-slate-50 px-4 py-2">
                <p className="text-xs font-semibold uppercase text-slate-600">SKE</p>
                <p className="text-lg font-semibold">
                  {readiness.safetyKnowledge.overallStatus} · {readiness.safetyKnowledge.overallScore}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      {readiness && readiness.issues.length > 0 ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="flex items-center gap-2 font-semibold text-amber-900">
            <Shield className="h-4 w-4" aria-hidden />
            Compliance issues
          </h2>
          <ul className="mt-2 space-y-1">
            {readiness.issues.map((issue, i) => (
              <li key={i} className="text-sm text-amber-950">
                {issue.type}: {issue.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <WorkerFitTestPanel workerId={workerId} />

      <WorkerSafetyKnowledgeSummaryCard
        workerId={workerId}
        summary={readiness?.safetyKnowledge}
      />

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <GraduationCap className="h-5 w-5 text-teal-600" aria-hidden />
          Training records
        </h2>
        <ul className="divide-y rounded-xl border border-slate-200 bg-white">
          {trainingRecords.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">No training records</li>
          ) : (
            trainingRecords.slice(0, 20).map((r) => (
              <li
                key={String(r.id)}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span>
                    {(r.certification as { name?: string })?.name ??
                      `Record #${String(r.id)}`}
                  </span>
                  <VerifiedByVeraBadge trainingRecordId={Number(r.id)} />
                </span>
                <span className="text-slate-500">
                  {r.expiresAt
                    ? `Expires ${new Date(String(r.expiresAt)).toLocaleDateString()}`
                    : "No expiry"}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Company assignments</h2>
        <ul className="divide-y rounded-xl border border-slate-200 bg-white">
          {companyLinks.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">No company links</li>
          ) : (
            companyLinks.map((l) => (
              <li key={String(l.id)} className="px-4 py-3 text-sm">
                {(l.company as { name?: string })?.name ?? `Company #${String(l.companyId)}`}
                {l.active ? " · Active" : " · Inactive"}
              </li>
            ))
          )}
        </ul>
      </section>

      <Link
        href={`/verify/${workerId}`}
        className="inline-block text-sm font-medium text-teal-700 hover:underline"
      >
        Open worker wallet →
      </Link>
    </div>
  );
}
