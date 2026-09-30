"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPpePreUse, type PpePreUseSummary } from "@/lib/ppe-preuse";
import { PPE_PREUSE_CHECKLIST } from "@/lib/ppe-preuse-checklist";
import { VeraPageLayout } from "@/src/components/navigation";
import { SfCard } from "@/src/components/safety-forms/ui";

export default function PpePreUseDetailPage({ id }: { id: string }) {
  const [row, setRow] = useState<PpePreUseSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPpePreUse(id)
      .then(setRow)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      );
  }, [id]);

  if (error) {
    return (
      <VeraPageLayout title="PPE pre-use">
        <p className="text-sm text-red-600">{error}</p>
      </VeraPageLayout>
    );
  }

  if (!row) {
    return (
      <VeraPageLayout title="PPE pre-use">
        <p className="text-sm text-[var(--sf-text-muted)]">Loading…</p>
      </VeraPageLayout>
    );
  }

  const labelById = new Map(PPE_PREUSE_CHECKLIST.map((d) => [d.id, d]));

  return (
    <VeraPageLayout
      title="PPE pre-use detail"
      description={`${row.workerUser?.username ?? "Worker"} · ${row.overallResult}`}
      actions={
        <Link
          href="/pm/inspections/ppe-preuse"
          className="text-sm text-[var(--sf-primary)]"
        >
          ← All submissions
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <SfCard className="space-y-2 p-6 text-sm">
          <p>
            <span className="text-[var(--sf-text-muted)]">Project:</span>{" "}
            {row.project?.name ?? row.projectId}
          </p>
          <p>
            <span className="text-[var(--sf-text-muted)]">Company:</span>{" "}
            {row.company?.name ?? row.companyId}
          </p>
          <p>
            <span className="text-[var(--sf-text-muted)]">Inspected:</span>{" "}
            {new Date(row.inspectedAt).toLocaleString()}
          </p>
          {row.locationNote && (
            <p>
              <span className="text-[var(--sf-text-muted)]">Location:</span>{" "}
              {row.locationNote}
            </p>
          )}
          {row.taskType && (
            <p>
              <span className="text-[var(--sf-text-muted)]">Task:</span>{" "}
              {row.taskType}
            </p>
          )}
          <p>
            <span className="text-[var(--sf-text-muted)]">Result:</span>{" "}
            <strong className="uppercase">{row.overallResult}</strong>
          </p>
          {row.removedFromService && (
            <p className="text-[#B33A3A]">Damaged PPE removed from service</p>
          )}
          {row.acknowledgedSafeToWork && (
            <p className="text-[#4FAF6F]">Worker acknowledged safe to work</p>
          )}
          {row.deficiencies && (
            <p>
              <span className="text-[var(--sf-text-muted)]">Notes:</span>{" "}
              {row.deficiencies}
            </p>
          )}
        </SfCard>

        <SfCard className="p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">
            Checklist results
          </h2>
          <ul className="space-y-3">
            {(Array.isArray(row.items) ? row.items : []).map((item) => {
              const def = labelById.get(item.id);
              return (
                <li
                  key={item.id}
                  className="border-b border-[var(--sf-border)] pb-2 text-sm last:border-0"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <span>{def?.label ?? item.id}</span>
                    <span className="uppercase tracking-wide">{item.result}</span>
                  </div>
                  {item.note && (
                    <p className="mt-1 text-[var(--sf-text-muted)]">{item.note}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </SfCard>
      </div>
    </VeraPageLayout>
  );
}
