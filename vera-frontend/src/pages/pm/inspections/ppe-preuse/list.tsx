"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchPpePreUseList, type PpePreUseSummary } from "@/lib/ppe-preuse";
import { VeraPageLayout } from "@/src/components/navigation";
import {
  SfButton,
  SfCard,
  SfFloatingInput,
} from "@/src/components/safety-forms/ui";

export default function PpePreUseListPage() {
  const [rows, setRows] = useState<PpePreUseSummary[]>([]);
  const [projectId, setProjectId] = useState("1");
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(true);

  const filters = useMemo(() => {
    const p = Number(projectId);
    const c = Number(companyId);
    return {
      projectId: Number.isSafeInteger(p) && p > 0 ? p : undefined,
      companyId: Number.isSafeInteger(c) && c > 0 ? c : undefined,
    };
  }, [projectId, companyId]);

  useEffect(() => {
    setLoading(true);
    fetchPpePreUseList(filters)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [filters.projectId, filters.companyId]);

  return (
    <VeraPageLayout
      title="PPE pre-use inspections"
      description="Worker kit checks visible to company and project management."
      actions={
        <Link href="/pm/inspections/ppe-preuse/new">
          <SfButton type="button">New pre-use</SfButton>
        </Link>
      }
    >
      <div className="space-y-6">
        <SfCard className="flex flex-wrap gap-4 p-6">
          <SfFloatingInput
            label="Project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="max-w-[140px]"
          />
          <SfFloatingInput
            label="Company ID (optional)"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="max-w-[160px]"
          />
        </SfCard>

        {loading ? (
          <p className="text-sm text-[var(--sf-text-muted)]">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-[var(--sf-text-muted)]">
            No pre-use inspections yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/pm/inspections/ppe-preuse/${r.id}`}>
                  <SfCard className="p-5 transition-colors hover:border-[#1E6FB8]">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide">
                      <span
                        className={
                          r.overallResult === "fail"
                            ? "text-[#B33A3A]"
                            : r.overallResult === "conditional"
                              ? "text-[#C89F3D]"
                              : "text-[#4FAF6F]"
                        }
                      >
                        {r.overallResult}
                      </span>
                      {r.removedFromService && (
                        <span className="rounded-[3px] border border-[#B33A3A]/40 px-1.5 py-0.5 text-[#B33A3A]">
                          Removed from service
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-medium">
                      {r.workerUser?.username ?? `User #${r.workerUserId}`}
                      {r.project ? ` · ${r.project.name}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-[var(--sf-text-muted)]">
                      {new Date(r.inspectedAt).toLocaleString()}
                      {r.company ? ` · ${r.company.name}` : ""}
                    </p>
                  </SfCard>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </VeraPageLayout>
  );
}
