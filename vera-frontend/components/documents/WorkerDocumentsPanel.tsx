"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import {
  DOCUMENT_TYPE_LABELS,
  fetchWorkerDocuments,
  type DocumentSummary,
  type WorkerDocumentsResponse,
} from "@/lib/documents";

const STATUS_BADGE: Record<string, string> = {
  Completed:
    "inline-flex rounded-[3px] border border-[#3D8F58] bg-[#4FAF6F] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#0F1A12]",
  RequiresReview:
    "inline-flex rounded-[3px] border border-[#174F86] bg-[#1E6FB8] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#F4F6F8]",
  InProgress:
    "inline-flex rounded-[3px] border border-[#174F86] bg-[#1E6FB8]/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#1E6FB8]",
  Archived:
    "inline-flex rounded-[3px] border border-[#5A6169] bg-[#3B3F45] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#F4F6F8]",
  Draft:
    "inline-flex rounded-[3px] border border-[#5A6169] bg-[#F4F6F8] px-2 py-0.5 text-[10px] font-semibold uppercase text-[#5A6169]",
};

function dateLabel(row: DocumentSummary) {
  const iso = row.completed_at ?? row.updated_at;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** Worker profile Documents panel — grouped by document type. */
export function WorkerDocumentsPanel({
  workerId,
  className,
}: {
  workerId: string | number;
  className?: string;
}) {
  const id = String(workerId);
  const [data, setData] = React.useState<WorkerDocumentsResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    let cancelled = false;
    void fetchWorkerDocuments(id)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          const initial: Record<string, boolean> = {};
          for (const g of res.groups) initial[g.document_type] = true;
          setOpen(initial);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load documents");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

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
            Involved as assignee, crew, creator, or signer
          </h3>
        </div>
        <Link
          href={`/documents/completed?worker_id=${encodeURIComponent(id)}`}
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
        <p className="text-sm text-[#5A6169]">No documents for this worker.</p>
      ) : (
        <div className="space-y-2">
          {data.groups.map((g) => (
            <div
              key={g.document_type}
              className="rounded-[3px] border border-[#2A2E33]/12"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold text-[#2A2E33] hover:bg-[#F4F6F8]"
                onClick={() =>
                  setOpen((o) => ({
                    ...o,
                    [g.document_type]: !o[g.document_type],
                  }))
                }
              >
                <span>
                  {DOCUMENT_TYPE_LABELS[g.document_type] ?? g.label}{" "}
                  <span className="font-normal text-[#5A6169]">({g.count})</span>
                </span>
                <span className="text-[#5A6169]">
                  {open[g.document_type] ? "−" : "+"}
                </span>
              </button>
              {open[g.document_type] ? (
                <ul className="divide-y divide-[#2A2E33]/10 border-t border-[#2A2E33]/10">
                  {g.items.map((row) => (
                    <li
                      key={row.document_id}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-[#E8F1F8]"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-[#2A2E33] truncate">
                          {row.title ?? DOCUMENT_TYPE_LABELS[row.document_type]}
                        </p>
                        <p className="text-xs text-[#5A6169]">
                          {row.job_name ?? row.asset_tag ?? row.location_label ?? "—"}{" "}
                          · {dateLabel(row)}
                        </p>
                      </div>
                      <span className={STATUS_BADGE[row.status] ?? STATUS_BADGE.Draft}>
                        {row.status}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
