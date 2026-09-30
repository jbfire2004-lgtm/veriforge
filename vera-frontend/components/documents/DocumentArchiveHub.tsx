"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, FileText, RefreshCw, Upload } from "lucide-react";
import {
  ARCHIVE_KIND_LABELS,
  ARCHIVE_STATUS_OPTIONS,
  type ArchiveKind,
  type DocumentArchiveItem,
  type DocumentArchiveResponse,
} from "@/lib/document-archive";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";

const KIND_OPTIONS: Array<"" | ArchiveKind> = [
  "",
  "form",
  "report",
  "assessment",
  "attachment",
];

type FilterState = {
  projectId: string;
  kind: "" | ArchiveKind;
  typeKey: string;
  status: string[];
  dateFrom: string;
  dateTo: string;
  q: string;
  page: number;
  companyId: string;
};

function parseFilters(sp: URLSearchParams): FilterState {
  const statusRaw = sp.get("status");
  const status = statusRaw
    ? statusRaw.split(",").filter(Boolean)
    : [...ARCHIVE_STATUS_OPTIONS];
  const kind = (sp.get("kind") ?? "") as FilterState["kind"];
  return {
    projectId: sp.get("projectId") ?? "",
    kind: KIND_OPTIONS.includes(kind) ? kind : "",
    typeKey: sp.get("type") ?? "",
    status: status.length ? status : [...ARCHIVE_STATUS_OPTIONS],
    dateFrom: sp.get("dateFrom") ?? "",
    dateTo: sp.get("dateTo") ?? "",
    q: sp.get("q") ?? "",
    page: Math.max(1, Number(sp.get("page") ?? "1") || 1),
    companyId: sp.get("companyId") ?? "",
  };
}

function toParams(f: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.projectId) p.set("projectId", f.projectId);
  if (f.kind) p.set("kind", f.kind);
  if (f.typeKey) p.set("type", f.typeKey);
  if (f.status.length) p.set("status", f.status.join(","));
  if (f.dateFrom) p.set("dateFrom", f.dateFrom);
  if (f.dateTo) p.set("dateTo", f.dateTo);
  if (f.q) p.set("q", f.q);
  if (f.companyId) p.set("companyId", f.companyId);
  if (f.page > 1) p.set("page", String(f.page));
  return p;
}

function formatWhen(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const STATUS_CLASS: Record<string, string> = {
  Completed:
    "border-[#3D8F58] bg-[#4FAF6F]/20 text-[#0F1A12]",
  RequiresReview:
    "border-[#174F86] bg-[#1E6FB8]/15 text-[#0F1A12]",
  Archived: "border-[#5A6169] bg-[#3B3F45]/15 text-[#2A2E33]",
  Pending: "border-[#C89F3D] bg-[#C89F3D]/15 text-[#2A2E33]",
  Failed: "border-[#B33A3A] bg-[#B33A3A]/10 text-[#2A2E33]",
};

type Props = {
  defaultCompanyId?: number;
  defaultProjectId?: number;
};

/**
 * Unified Document Archive — finalized forms, reports, assessments + storage files.
 * Filters: project, type (kind/typeKey), date, status.
 */
export function DocumentArchiveHub({
  defaultCompanyId,
  defaultProjectId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = React.useMemo(() => {
    const f = parseFilters(searchParams);
    if (!f.companyId && defaultCompanyId) f.companyId = String(defaultCompanyId);
    if (!f.projectId && defaultProjectId) f.projectId = String(defaultProjectId);
    return f;
  }, [searchParams, defaultCompanyId, defaultProjectId]);

  const [draft, setDraft] = React.useState(filters);
  const [data, setData] = React.useState<DocumentArchiveResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<DocumentArchiveItem | null>(
    null,
  );

  React.useEffect(() => {
    setDraft(filters);
  }, [filters]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = toParams(filters);
    params.set("pageSize", "50");
    void fetch(`/api/v1/document-archive?${params}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Archive error (${res.status})`);
        return (await res.json()) as DocumentArchiveResponse;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setData(null);
        setError(err instanceof Error ? err.message : "Could not load archive");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  function apply(next: FilterState) {
    router.push(`${pathname}?${toParams({ ...next, page: 1 }).toString()}`);
  }

  const highlight = searchParams.get("highlight");

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5A6169]">
          VeriPM · Records
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1A1E22]">
          Document Archive
        </h1>
        <p className="max-w-3xl text-sm text-[#5A6169]">
          Unified archive for finalized forms, reports, and assessments, plus
          Document Storage binaries. Filter by project, type, date, and status.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/core/upload"
          className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#2A2E33]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1E22] hover:bg-[#F4F6F8]"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden />
          Upload file
        </Link>
        <Link
          href="/core/training-ingest"
          className="rounded-[3px] border border-[#2A2E33]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1E22] hover:bg-[#F4F6F8]"
        >
          Training evidence
        </Link>
        <Link
          href="/core/training-competency"
          className="rounded-[3px] border border-[#2A2E33]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1E22] hover:bg-[#F4F6F8]"
        >
          Competency profiles
        </Link>
        <Link
          href="/pm/sds-document-control"
          className="rounded-[3px] border border-[#2A2E33]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A1E22] hover:bg-[#F4F6F8]"
        >
          SDS & Document Control
        </Link>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => apply(draft)}
        >
          <RefreshCw
            className={cn("mr-1 h-3.5 w-3.5", loading && "animate-spin")}
            aria-hidden
          />
          Refresh
        </Button>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-[3px] border border-[#C89F3D]/40 bg-[#C89F3D]/10 px-4 py-3 text-sm text-[#2A2E33]"
        >
          {error}
        </div>
      ) : null}

      {data ? (
        <p className="text-xs text-[#64748b]">
          Showing {data.items.length} of {data.total} · forms ingested{" "}
          {data.sources.forms} · files {data.sources.files}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-[6px] border border-[#2A2E33]/14 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5A6169]">
            Filters
          </p>
          <div className="mt-3 space-y-3">
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6169]">
                Project
              </span>
              <select
                value={draft.projectId}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, projectId: e.target.value }))
                }
                className="h-10 w-full rounded-[3px] border border-[#2A2E33]/20 bg-white px-2 text-sm"
              >
                <option value="">All projects</option>
                {(data?.projects ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6169]">
                Type
              </span>
              <select
                value={draft.kind}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    kind: e.target.value as FilterState["kind"],
                  }))
                }
                className="h-10 w-full rounded-[3px] border border-[#2A2E33]/20 bg-white px-2 text-sm"
              >
                <option value="">All kinds</option>
                {(Object.keys(ARCHIVE_KIND_LABELS) as ArchiveKind[]).map(
                  (k) => (
                    <option key={k} value={k}>
                      {ARCHIVE_KIND_LABELS[k]}
                    </option>
                  ),
                )}
              </select>
              <select
                value={draft.typeKey}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, typeKey: e.target.value }))
                }
                className="mt-2 h-10 w-full rounded-[3px] border border-[#2A2E33]/20 bg-white px-2 text-sm"
              >
                <option value="">All subtypes</option>
                {(data?.typeKeys ?? []).map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="space-y-1.5">
              <legend className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6169]">
                Status
              </legend>
              {ARCHIVE_STATUS_OPTIONS.map((s) => (
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
                  value={draft.dateFrom}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, dateFrom: e.target.value }))
                  }
                  className="h-10 w-full rounded-[3px] border border-[#2A2E33]/20 px-2 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6169]">
                  To
                </span>
                <input
                  type="date"
                  value={draft.dateTo}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, dateTo: e.target.value }))
                  }
                  className="h-10 w-full rounded-[3px] border border-[#2A2E33]/20 px-2 text-sm"
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6169]">
                Search
              </span>
              <input
                type="search"
                value={draft.q}
                onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
                placeholder="Title, project…"
                className="h-10 w-full rounded-[3px] border border-[#2A2E33]/20 px-2 text-sm"
              />
            </label>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                className="flex-1"
                onClick={() => apply(draft)}
              >
                Apply
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  apply({
                    projectId: "",
                    kind: "",
                    typeKey: "",
                    status: [...ARCHIVE_STATUS_OPTIONS],
                    dateFrom: "",
                    dateTo: "",
                    q: "",
                    page: 1,
                    companyId: draft.companyId,
                  })
                }
              >
                Reset
              </Button>
            </div>
          </div>
        </aside>

        <div className="space-y-3">
          <div className="overflow-hidden rounded-[6px] border border-[#2A2E33]/14 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-[#2A2E33]/10 bg-[#F8FAFC] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5A6169]">
                <tr>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Project</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2E33]/08">
                {loading && !data ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center text-[#64748b]"
                    >
                      Loading archive…
                    </td>
                  </tr>
                ) : null}
                {!loading && data && data.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center text-[#64748b]"
                    >
                      No archived forms, reports, or assessments match these
                      filters.
                    </td>
                  </tr>
                ) : null}
                {data?.items.map((row) => {
                  const active =
                    selected?.id === row.id ||
                    (highlight != null && row.id.includes(highlight));
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "cursor-pointer hover:bg-[#F8FAFC]",
                        active && "bg-[#2F8F8C]/8",
                      )}
                      onClick={() => setSelected(row)}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-start gap-2">
                          <FileText
                            className="mt-0.5 h-4 w-4 shrink-0 text-[#64748b]"
                            aria-hidden
                          />
                          <div>
                            <p className="font-medium text-[#1A1E22]">
                              {row.title}
                            </p>
                            <p className="text-[11px] text-[#64748b]">
                              {row.source === "form" ? "Form record" : "File"} ·{" "}
                              {ARCHIVE_KIND_LABELS[row.kind]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[#2A2E33]">
                        {row.typeLabel}
                      </td>
                      <td className="px-3 py-2.5 text-[#2A2E33]">
                        {row.projectName ??
                          (row.projectId ? `#${row.projectId}` : "—")}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={cn(
                            "inline-flex rounded-[3px] border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]",
                            STATUS_CLASS[row.status] ??
                              "border-[#5A6169] text-[#2A2E33]",
                          )}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums text-[#5A6169]">
                        {formatWhen(row.date)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {row.purpose === "training_ingestion" ||
                          row.typeKey === "training_ingestion" ? (
                            <>
                              <Link
                                href={
                                  row.href ??
                                  "/core/training-ingest"
                                }
                                className="text-xs font-semibold text-[#2F8F8C]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Ingest
                              </Link>
                              <Link
                                href="/core/training-competency"
                                className="text-xs font-semibold text-[#2F8F8C]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Competency
                              </Link>
                            </>
                          ) : null}
                          {row.openUrl ? (
                            <a
                              href={row.openUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E6FB8]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Open
                              <ExternalLink className="h-3 w-3" aria-hidden />
                            </a>
                          ) : (
                            <span className="text-xs text-[#94a3b8]">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 ? (
            <div className="flex items-center justify-between text-sm">
              <p className="text-[#64748b]">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={data.page <= 1}
                  onClick={() =>
                    router.push(
                      `${pathname}?${toParams({ ...filters, page: data.page - 1 })}`,
                    )
                  }
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={data.page >= data.totalPages}
                  onClick={() =>
                    router.push(
                      `${pathname}?${toParams({ ...filters, page: data.page + 1 })}`,
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}

          {selected ? (
            <div className="rounded-[6px] border border-[#2A2E33]/14 bg-white p-4 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5A6169]">
                    Record detail
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-[#1A1E22]">
                    {selected.title}
                  </h2>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelected(null)}
                >
                  Close
                </Button>
              </div>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-[10px] uppercase text-[#64748b]">Kind</dt>
                  <dd>{ARCHIVE_KIND_LABELS[selected.kind]}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-[#64748b]">Type</dt>
                  <dd>{selected.typeLabel}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-[#64748b]">
                    Status
                  </dt>
                  <dd>{selected.status}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-[#64748b]">Date</dt>
                  <dd>{formatWhen(selected.date)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-[#64748b]">
                    Project
                  </dt>
                  <dd>
                    {selected.projectName ?? selected.projectId ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-[#64748b]">
                    Source
                  </dt>
                  <dd>
                    {selected.source === "form"
                      ? "Finalized form / report / assessment"
                      : "Document Storage file"}
                  </dd>
                </div>
              </dl>
              {selected.openUrl ? (
                <a
                  href={selected.openUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#1E6FB8]"
                >
                  Open file
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : null}
              {selected.purpose === "training_ingestion" ||
              selected.typeKey === "training_ingestion" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={selected.href ?? "/core/training-ingest"}
                    className="text-sm font-semibold text-[#2F8F8C] underline"
                  >
                    Training ingestion
                  </Link>
                  <Link
                    href="/core/training-competency"
                    className="text-sm font-semibold text-[#2F8F8C] underline"
                  >
                    Competency profiles
                  </Link>
                  <Link
                    href="/core/verification"
                    className="text-sm font-semibold text-[#2F8F8C] underline"
                  >
                    Verification queue
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
