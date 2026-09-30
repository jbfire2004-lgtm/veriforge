"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { VeraPageHeader } from "@/src/components/layout/VeraPageHeader";
import {
  DOCUMENT_DOMAINS,
  DOCUMENT_TYPE_LABELS,
  HUB_DOCUMENT_STATUSES,
  documentTypesForDomain,
  type DocumentDomain,
  type DocumentStatus,
  type DocumentSummary,
  type DocumentType,
  DocumentServiceUnavailableError,
  fetchCompletedDocuments,
  buildCompletedDocumentsSearchParams,
} from "@/lib/documents";

const STATUS_BADGE: Record<string, string> = {
  Completed:
    "inline-flex rounded-[3px] border border-[#3D8F58] bg-[#4FAF6F] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#0F1A12]",
  RequiresReview:
    "inline-flex rounded-[3px] border border-[#174F86] bg-[#1E6FB8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#F4F6F8]",
  Archived:
    "inline-flex rounded-[3px] border border-[#5A6169] bg-[#3B3F45] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#F4F6F8]",
};

function formatCompleted(iso: string | null | undefined) {
  if (!iso) return { date: "—", time: "" };
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      time: d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  } catch {
    return { date: iso, time: "" };
  }
}

function jobOrAsset(row: DocumentSummary) {
  if (row.asset_name || row.asset_tag) {
    return row.asset_tag
      ? `${row.asset_tag}${row.asset_name ? ` · ${row.asset_name}` : ""}`
      : row.asset_name;
  }
  return row.job_name ?? row.project_name ?? "—";
}

type FilterState = {
  domain: "" | DocumentDomain;
  document_type: "" | DocumentType;
  status: DocumentStatus[];
  completed_from: string;
  completed_to: string;
  q: string;
  page: number;
};

function parseFilters(sp: URLSearchParams): FilterState {
  const domain = (sp.get("domain") ?? "") as FilterState["domain"];
  const document_type = (sp.get("document_type") ?? "") as FilterState["document_type"];
  const statusRaw = sp.get("status");
  const status = (
    statusRaw
      ? statusRaw.split(",").filter(Boolean)
      : [...HUB_DOCUMENT_STATUSES]
  ) as DocumentStatus[];
  return {
    domain: DOCUMENT_DOMAINS.includes(domain as DocumentDomain) ? domain : "",
    document_type: document_type || "",
    status: status.length ? status : [...HUB_DOCUMENT_STATUSES],
    completed_from: sp.get("completed_from") ?? "",
    completed_to: sp.get("completed_to") ?? "",
    q: sp.get("q") ?? "",
    page: Math.max(1, Number(sp.get("page") ?? "1") || 1),
  };
}

/**
 * Completed Documents hub — industrial list with server-side filters.
 * Shows unavailable state until Document Service API is deployed.
 */
export function CompletedDocumentsHub() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = React.useMemo(
    () => parseFilters(searchParams),
    [searchParams],
  );

  const [draft, setDraft] = React.useState(filters);
  const [items, setItems] = React.useState<DocumentSummary[]>([]);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [unavailable, setUnavailable] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<DocumentSummary | null>(null);

  React.useEffect(() => {
    setDraft(filters);
  }, [filters]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setUnavailable(null);

    void fetchCompletedDocuments({
      domain: filters.domain || undefined,
      document_type: filters.document_type || undefined,
      status: filters.status,
      completed_from: filters.completed_from || undefined,
      completed_to: filters.completed_to || undefined,
      q: filters.q || undefined,
      page: filters.page,
      page_size: 25,
    })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setItems([]);
        setTotal(0);
        setTotalPages(0);
        if (err instanceof DocumentServiceUnavailableError) {
          setUnavailable(err.message);
        } else {
          setUnavailable("Could not load completed documents.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  function applyFilters(next: FilterState) {
    const params = buildCompletedDocumentsSearchParams({
      domain: next.domain || undefined,
      document_type: next.document_type || undefined,
      status: next.status,
      completed_from: next.completed_from || undefined,
      completed_to: next.completed_to || undefined,
      q: next.q || undefined,
      page: next.page,
      page_size: 25,
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  const typeOptions = draft.domain
    ? documentTypesForDomain(draft.domain)
    : (Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]);

  return (
    <>
      <VeraPageHeader
        title="Completed documents"
        description="Finished safety and maintenance records across VERICore and VERIPM. Binary uploads for attachments live in Document Storage (purpose completed_document)."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/core/documents?purpose=completed_document"
          className="rounded-[3px] border border-[#2A2E33]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1E22] hover:bg-[#F4F6F8]"
        >
          Document storage · completed_document
        </Link>
        <Link
          href="/core/upload"
          className="rounded-[3px] border border-[#2A2E33]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1E22] hover:bg-[#F4F6F8]"
        >
          Upload Core file
        </Link>
        <Link
          href="/core/training-ingest"
          className="rounded-[3px] border border-[#2A2E33]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1E22] hover:bg-[#F4F6F8]"
        >
          Training ingestion
        </Link>
      </div>

      {unavailable ? (
        <div
          role="status"
          className="mb-4 rounded-[3px] border border-[#C89F3D]/50 bg-[#2A2820] px-4 py-3 text-sm text-[#F2E8C8]"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#C89F3D]">
            Document Service · Unavailable
          </p>
          <p className="mt-1 leading-relaxed">{unavailable}</p>
        </div>
      ) : (
        <div
          role="status"
          className="mb-4 rounded-[3px] border border-[#2F8F8C]/40 bg-[#1F2A28] px-4 py-3 text-sm text-[#D4EEDC]"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#2F8F8C]">
            Preview store
          </p>
          <p className="mt-1 leading-relaxed text-[#D5DBE0]">
            Results are served from an in-memory Document Service preview.
            Seed examples: worker <span className="font-mono text-xs">42</span>,
            project <span className="font-mono text-xs">1</span>, asset{" "}
            <span className="font-mono text-xs">1</span>. Replace with Postgres
            using{" "}
            <span className="font-mono text-xs">docs/sql/001_document_service.sql</span>.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Filter panel */}
        <aside className="h-fit rounded-[6px] border border-[#2A2E33]/14 bg-white p-4 shadow-none">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5A6169]">
            Filters
          </p>

          <div className="mt-3 space-y-3">
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6169]">
                Domain
              </span>
              <select
                value={draft.domain}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    domain: e.target.value as FilterState["domain"],
                    document_type: "",
                  }))
                }
                className="h-10 w-full rounded-[3px] border border-[#2A2E33]/20 bg-white px-2 text-sm text-[#2A2E33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]"
              >
                <option value="">All</option>
                <option value="VERICORE">VERICore</option>
                <option value="VERIPM">VERIPM</option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6169]">
                Document type
              </span>
              <select
                value={draft.document_type}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    document_type: e.target.value as FilterState["document_type"],
                  }))
                }
                className="h-10 w-full rounded-[3px] border border-[#2A2E33]/20 bg-white px-2 text-sm text-[#2A2E33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]"
              >
                <option value="">All</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {DOCUMENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="space-y-1.5">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6169]">
                Status
              </legend>
              {HUB_DOCUMENT_STATUSES.map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2 text-sm text-[#2A2E33]"
                >
                  <input
                    type="checkbox"
                    checked={draft.status.includes(s)}
                    onChange={(e) => {
                      setDraft((d) => ({
                        ...d,
                        status: e.target.checked
                          ? [...d.status, s]
                          : d.status.filter((x) => x !== s),
                      }));
                    }}
                    className="h-4 w-4 rounded-[3px] border border-[#2A2E33]/30 accent-[#1E6FB8]"
                  />
                  {s}
                </label>
              ))}
            </fieldset>

            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6169]">
                  From
                </span>
                <input
                  type="date"
                  value={draft.completed_from}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, completed_from: e.target.value }))
                  }
                  className="h-10 w-full rounded-[3px] border border-[#2A2E33]/20 bg-white px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6169]">
                  To
                </span>
                <input
                  type="date"
                  value={draft.completed_to}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, completed_to: e.target.value }))
                  }
                  className="h-10 w-full rounded-[3px] border border-[#2A2E33]/20 bg-white px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6169]">
                Keyword
              </span>
              <input
                type="search"
                value={draft.q}
                placeholder="Title or external ref"
                onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
                className="h-10 w-full rounded-[3px] border border-[#2A2E33]/20 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]"
              />
            </label>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => applyFilters({ ...draft, page: 1 })}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-[3px] border border-[#174F86] bg-[#1E6FB8] px-3 text-sm font-medium text-[#F4F6F8] hover:bg-[#1A63A6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  const reset: FilterState = {
                    domain: "",
                    document_type: "",
                    status: [...HUB_DOCUMENT_STATUSES],
                    completed_from: "",
                    completed_to: "",
                    q: "",
                    page: 1,
                  };
                  setDraft(reset);
                  applyFilters(reset);
                }}
                className="inline-flex h-10 items-center justify-center rounded-[3px] border border-[#2A2E33] bg-[#3B3F45] px-3 text-sm font-medium text-[#F4F6F8] hover:bg-[#454A51] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E6FB8]"
              >
                Reset
              </button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-[#5A6169]">
              {loading
                ? "Loading…"
                : unavailable
                  ? "0 results · service offline"
                  : `${total.toLocaleString()} results · page ${filters.page}${totalPages ? `/${totalPages}` : ""}`}
            </p>
            <Link
              href="/core/documents"
              className="text-sm font-medium text-[#1E6FB8] hover:underline"
            >
              Core file library →
            </Link>
          </div>

          <div className="overflow-hidden rounded-[6px] border border-[#2A2E33]/14 bg-white shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#2A2E33] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#A8B0B8]">
                    <th className="px-3 py-2.5">Type</th>
                    <th className="px-3 py-2.5">Domain</th>
                    <th className="px-3 py-2.5">Worker / crew</th>
                    <th className="px-3 py-2.5">Job / asset</th>
                    <th className="px-3 py-2.5">Location</th>
                    <th className="px-3 py-2.5">Completed</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr
                        key={i}
                        className={cn(
                          "border-b border-[#2A2E33]/10",
                          i % 2 === 0 ? "bg-white" : "bg-[#F0F2F4]",
                        )}
                      >
                        <td colSpan={8} className="px-3 py-3">
                          <div className="h-4 w-full animate-pulse rounded-[3px] bg-[#E8ECF0]" />
                        </td>
                      </tr>
                    ))
                  ) : items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-sm text-[#5A6169]"
                      >
                        {unavailable
                          ? "No completed documents available until the Document Service is connected."
                          : "No completed documents match these filters."}
                      </td>
                    </tr>
                  ) : (
                    items.map((row, i) => {
                      const ts = formatCompleted(row.completed_at);
                      const active = selected?.document_id === row.document_id;
                      return (
                        <tr
                          key={row.document_id}
                          onClick={() => setSelected(row)}
                          className={cn(
                            "cursor-pointer border-b border-[#2A2E33]/10 transition-colors",
                            i % 2 === 0 ? "bg-white" : "bg-[#F0F2F4]",
                            "hover:bg-[#E8F1F8]",
                            active &&
                              "bg-[rgba(30,111,184,0.12)] shadow-[inset_3px_0_0_#1E6FB8]",
                          )}
                        >
                          <td className="px-3 py-3 font-medium text-[#2A2E33]">
                            {DOCUMENT_TYPE_LABELS[row.document_type] ??
                              row.document_type}
                            {row.title ? (
                              <p className="mt-0.5 text-xs font-normal text-[#5A6169] line-clamp-1">
                                {row.title}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-3 py-3 text-[#3B3F45]">
                            {row.domain === "VERICORE" ? "Core" : "PM"}
                          </td>
                          <td className="px-3 py-3 text-[#3B3F45]">
                            {row.worker_name ?? "—"}
                            {row.crew_summary ? (
                              <p className="text-xs text-[#5A6169]">
                                {row.crew_summary}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-3 py-3 text-[#3B3F45]">
                            {jobOrAsset(row)}
                          </td>
                          <td className="px-3 py-3 text-[#3B3F45]">
                            {row.location_label ?? "—"}
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-semibold text-[#2A2E33]">
                              {ts.date}
                            </p>
                            {ts.time ? (
                              <p className="font-mono text-[11px] text-[#5A6169]">
                                {ts.time}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={
                                STATUS_BADGE[row.status] ?? STATUS_BADGE.Archived
                              }
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              className="text-sm font-medium text-[#1E6FB8] hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(row);
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && !unavailable ? (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={filters.page <= 1}
                onClick={() =>
                  applyFilters({ ...filters, page: filters.page - 1 })
                }
                className="h-9 rounded-[3px] border border-[#2A2E33]/20 px-3 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={filters.page >= totalPages}
                onClick={() =>
                  applyFilters({ ...filters, page: filters.page + 1 })
                }
                className="h-9 rounded-[3px] border border-[#2A2E33]/20 px-3 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
      </div>

      {/* Detail drawer */}
      {selected ? (
        <div className="fixed inset-0 z-[80] flex justify-end bg-[#1C1F24]/50">
          <button
            type="button"
            className="flex-1 cursor-default"
            aria-label="Close detail"
            onClick={() => setSelected(null)}
          />
          <aside
            role="dialog"
            aria-label="Document detail"
            className="flex h-full w-full max-w-md flex-col border-l border-[#5A6169] bg-[#2A2E33] text-[#F4F6F8] shadow-none"
          >
            <header className="border-b border-[#5A6169] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#2F8F8C]">
                {selected.domain === "VERICORE" ? "VERICore" : "VERIPM"} ·{" "}
                {DOCUMENT_TYPE_LABELS[selected.document_type]}
              </p>
              <h2 className="mt-1 text-base font-semibold">
                {selected.title ?? DOCUMENT_TYPE_LABELS[selected.document_type]}
              </h2>
              <span
                className={cn("mt-2", STATUS_BADGE[selected.status])}
              >
                {selected.status}
              </span>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm text-[#D5DBE0]">
              <p>
                <span className="text-[#A8B0B8]">Worker</span>
                <br />
                {selected.worker_name ?? "—"}
              </p>
              <p>
                <span className="text-[#A8B0B8]">Job / asset</span>
                <br />
                {jobOrAsset(selected)}
              </p>
              <p>
                <span className="text-[#A8B0B8]">Location</span>
                <br />
                {selected.location_label ?? "—"}
              </p>
              <p>
                <span className="text-[#A8B0B8]">Completed</span>
                <br />
                {formatCompleted(selected.completed_at).date}{" "}
                {formatCompleted(selected.completed_at).time}
              </p>
              <p className="font-mono text-xs text-[#8A9199]">
                {selected.document_id}
              </p>
            </div>
            <footer className="flex flex-wrap gap-2 border-t border-[#5A6169] px-5 py-4">
              <button
                type="button"
                disabled
                title="Requires Document Service"
                className="h-9 rounded-[3px] border border-[#174F86] bg-[#1E6FB8] px-3 text-sm font-medium text-[#F4F6F8] opacity-50"
              >
                Export PDF
              </button>
              <button
                type="button"
                disabled
                title="Requires Document Service"
                className="h-9 rounded-[3px] border border-[#2A2E33] bg-[#3B3F45] px-3 text-sm font-medium text-[#F4F6F8] opacity-50"
              >
                Add to report pack
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="ml-auto h-9 rounded-[3px] border border-[#5A6169] px-3 text-sm text-[#F4F6F8] hover:bg-[#3B3F45]"
              >
                Close
              </button>
            </footer>
          </aside>
        </div>
      ) : null}
    </>
  );
}
