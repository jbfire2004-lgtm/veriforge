"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import {
  DOCUMENT_TYPE_LABELS,
  fetchJobDocuments,
  fetchProjectDocuments,
  type JobProjectDocumentsResponse,
} from "@/lib/documents";

/** Job or Project Documents panel — Safety / Maintenance sections. */
export function JobProjectDocumentsPanel({
  jobId,
  projectId,
  className,
}: {
  jobId?: string | number;
  projectId?: string | number;
  className?: string;
}) {
  const [data, setData] = React.useState<JobProjectDocumentsResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const hubHref = projectId
    ? `/documents/completed?project_id=${encodeURIComponent(String(projectId))}`
    : `/documents/completed?job_id=${encodeURIComponent(String(jobId))}`;

  React.useEffect(() => {
    let cancelled = false;
    const load = projectId
      ? fetchProjectDocuments(String(projectId))
      : fetchJobDocuments(String(jobId));
    void load
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load documents");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [jobId, projectId]);

  return (
    <section
      className={cn(
        "rounded-[6px] border border-[#2A2E33]/14 bg-white p-4 shadow-none",
        className,
      )}
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]">
            Documents
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[#2A2E33]">
            Safety (VERICore) and maintenance (VERIPM)
          </h3>
        </div>
        <Link
          href={hubHref}
          className="text-sm font-medium text-[#1E6FB8] hover:underline"
        >
          Open in hub →
        </Link>
      </header>

      {error ? (
        <p className="text-sm text-[#C89F3D]">{error}</p>
      ) : !data ? (
        <p className="text-sm text-[#5A6169]">Loading documents…</p>
      ) : data.total === 0 ? (
        <p className="text-sm text-[#5A6169]">No documents for this context.</p>
      ) : (
        <div className="space-y-4">
          {data.sections.map((section) => (
            <div key={section.id}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]">
                {section.label}{" "}
                <span className="text-[#5A6169]">({section.count})</span>
              </p>
              {section.items.length === 0 ? (
                <p className="text-sm text-[#5A6169]">None</p>
              ) : (
                <div className="overflow-hidden rounded-[3px] border border-[#2A2E33]/12">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#2A2E33] text-[10px] uppercase tracking-[0.06em] text-[#A8B0B8]">
                      <tr>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">
                          {section.domain === "VERIPM" ? "Asset" : "Worker"}
                        </th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.items.map((row, i) => (
                        <tr
                          key={row.document_id}
                          className={cn(
                            "border-t border-[#2A2E33]/10",
                            i % 2 === 0 ? "bg-white" : "bg-[#F0F2F4]",
                          )}
                        >
                          <td className="px-3 py-2 font-medium text-[#2A2E33]">
                            {DOCUMENT_TYPE_LABELS[row.document_type]}
                            {row.title ? (
                              <span className="block text-xs font-normal text-[#5A6169]">
                                {row.title}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-3 py-2 text-[#3B3F45]">
                            {section.domain === "VERIPM"
                              ? row.asset_tag ?? row.asset_name ?? "—"
                              : row.worker_name ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-[#3B3F45]">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
