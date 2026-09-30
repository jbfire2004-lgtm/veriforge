"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchPmTrainingAnalytics,
  fetchPmTrainingMatrix,
  listPmTrainingCourses,
} from "@/lib/pm-training";
import { SfCard } from "@/src/components/safety-forms/ui";

export default function PmTrainingDashboard({
  companyId = 1,
}: {
  companyId?: number;
}) {
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [matrix, setMatrix] = useState<Record<string, unknown> | null>(null);
  const [courses, setCourses] = useState<Record<string, unknown> | null>(null);

  const load = useCallback(() => {
    void fetchPmTrainingAnalytics(companyId).then(setAnalytics);
    void fetchPmTrainingMatrix(companyId).then(setMatrix);
    void listPmTrainingCourses(companyId).then(setCourses);
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  const roles = (matrix?.roles ?? {}) as Record<string, unknown[]>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Training & competency</h1>
        <p className="text-sm text-[var(--sf-text-muted)]">
          Courses, role matrix, expiry tracking, and worker compliance — company #{companyId}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <SfCard className="p-4">
          <p className="text-xs text-[var(--sf-text-muted)]">Compliance</p>
          <p className="text-2xl font-semibold">
            {String(analytics?.trainingCompliancePct ?? "—")}%
          </p>
        </SfCard>
        <SfCard className="p-4">
          <p className="text-xs text-[var(--sf-text-muted)]">Matrix rules</p>
          <p className="text-2xl font-semibold">{String(analytics?.matrixRules ?? "—")}</p>
        </SfCard>
        <SfCard className="p-4">
          <p className="text-xs text-[var(--sf-text-muted)]">Expiring (30d)</p>
          <p className="text-2xl font-semibold">
            {String(
              (analytics?.expiryTrends as Record<string, unknown>)?.expiringSoon ?? "—",
            )}
          </p>
        </SfCard>
      </div>

      <SfCard className="space-y-3 p-5">
        <h2 className="font-medium">Training matrix by role</h2>
        {Object.keys(roles).length === 0 ? (
          <p className="text-sm text-[var(--sf-text-muted)]">
            No matrix rules yet. Configure in{" "}
            <Link href="/pm/company-safety-context" className="text-[var(--sf-primary)] hover:underline">
              Company safety context
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {Object.entries(roles).map(([role, items]) => (
              <li key={role}>
                <span className="font-medium">{role}</span>: {(items as unknown[]).length}{" "}
                required course(s)
              </li>
            ))}
          </ul>
        )}
      </SfCard>

      <SfCard className="space-y-3 p-5">
        <h2 className="font-medium">Quick links</h2>
        <ul className="list-inside list-disc text-sm text-[var(--sf-primary)]">
          <li>
            <Link href="/pm/worker-safety-profile" className="hover:underline">
              Worker training profiles
            </Link>
          </li>
          <li>
            <Link href="/pm/company-safety-context" className="hover:underline">
              Matrix editor (company context)
            </Link>
          </li>
        </ul>
      </SfCard>

      {courses ? (
        <p className="text-xs text-[var(--sf-text-muted)]">
          {(courses.matrixCourses as unknown[])?.length ?? 0} matrix courses ·{" "}
          {(courses.certifications as unknown[])?.length ?? 0} certifications catalog
        </p>
      ) : null}
    </div>
  );
}
