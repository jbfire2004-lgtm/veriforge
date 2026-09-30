"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  FileText,
  GraduationCap,
  RefreshCw,
  Upload,
} from "lucide-react";
import {
  fetchCoreDocuments,
  type CoreDocument,
} from "@/lib/core/vera-core-platform";
import {
  CORE_FILE_PURPOSE_OPTIONS,
  normalizeCoreFilePurpose,
  purposeLabel,
} from "@/lib/core/core-file-purposes";
import { CoreFileUpload } from "@/src/components/core/CoreFileUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type CompanyOption = { id: number; name: string };

type Props = {
  companies?: CompanyOption[];
  defaultCompanyId?: number;
  defaultProjectId?: number;
  lockCompany?: boolean;
  initialPurpose?: string;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function CoreDocumentLibrary({
  companies = [],
  defaultCompanyId,
  defaultProjectId,
  lockCompany = false,
  initialPurpose = "",
}: Props) {
  const [companyId, setCompanyId] = useState(
    defaultCompanyId != null ? String(defaultCompanyId) : "",
  );
  const [projectId, setProjectId] = useState(
    defaultProjectId != null ? String(defaultProjectId) : "",
  );
  const [purpose, setPurpose] = useState(
    normalizeCoreFilePurpose(initialPurpose) ?? "",
  );
  const [docs, setDocs] = useState<CoreDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);

  const resolvedCompanyId = useMemo(() => {
    const n = Number(companyId);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [companyId]);

  const resolvedProjectId = useMemo(() => {
    const n = Number(projectId);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [projectId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDocs(
        await fetchCoreDocuments({
          companyId: resolvedCompanyId,
          projectId: resolvedProjectId,
          purpose: purpose.trim() || undefined,
          limit: 100,
        }),
      );
    } catch {
      setError("Could not load documents.");
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedCompanyId, resolvedProjectId, purpose]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (defaultCompanyId != null && !companyId) {
      setCompanyId(String(defaultCompanyId));
    }
  }, [defaultCompanyId, companyId]);

  return (
    <div className="space-y-6">
      <section
        aria-label="Related workflows"
        className="grid gap-2 sm:grid-cols-2"
      >
        <Link
          href="/core/training-ingest"
          className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 hover:bg-[var(--muted)]/40"
        >
          <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-teal-800" aria-hidden />
          <span>
            <span className="block text-sm font-semibold">Training ingestion</span>
            <span className="text-xs text-[var(--muted-foreground)]">
              OCR pipeline — files land here with purpose{" "}
              <code className="text-[10px]">training_ingestion</code>
            </span>
          </span>
        </Link>
        <Link
          href="/documents/completed"
          className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 hover:bg-[var(--muted)]/40"
        >
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-teal-800" aria-hidden />
          <span>
            <span className="block text-sm font-semibold">Completed documents</span>
            <span className="text-xs text-[var(--muted-foreground)]">
              VeriForge completed forms hub — attach binaries with purpose{" "}
              <code className="text-[10px]">completed_document</code>
            </span>
          </span>
        </Link>
      </section>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-4">
        <div>
          <Label htmlFor="doc-company" className="text-xs font-medium">
            Company ID
          </Label>
          {companies.length > 0 && !lockCompany ? (
            <select
              id="doc-company"
              className="mt-1 flex h-10 min-w-[12rem] rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            >
              <option value="">All / JWT default</option>
              {companies.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name} (#{c.id})
                </option>
              ))}
            </select>
          ) : (
            <Input
              id="doc-company"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              readOnly={lockCompany}
              placeholder="Auto from account"
              className="mt-1 w-36"
            />
          )}
          {lockCompany ? (
            <p className="mt-1 text-[10px] text-slate-500">Locked to your company</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="doc-purpose" className="text-xs font-medium">
            Purpose
          </Label>
          <select
            id="doc-purpose"
            className="mt-1 flex h-10 min-w-[12rem] rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          >
            <option value="">All purposes</option>
            {CORE_FILE_PURPOSE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="doc-project" className="text-xs font-medium">
            Linked project ID
          </Label>
          <Input
            id="doc-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Optional"
            className="mt-1 w-36"
          />
        </div>

        <Button type="button" onClick={() => void load()} disabled={loading}>
          <RefreshCw
            className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            aria-hidden
          />
          Refresh
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowUpload((v) => !v)}
        >
          <Upload className="mr-1 h-4 w-4" aria-hidden />
          {showUpload ? "Hide upload" : "Upload"}
        </Button>

        <Link href="/core/upload">
          <Button type="button" variant="ghost" size="sm">
            Full upload page
          </Button>
        </Link>
      </div>

      {showUpload ? (
        <div className="rounded-xl border border-teal-800/20 bg-teal-50/30 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-900">
            Upload to Document Storage
          </p>
          <CoreFileUpload
            key={uploadKey}
            allowPurposeSelect
            purpose={purpose || "document_storage"}
            companyId={resolvedCompanyId}
            projectId={resolvedProjectId}
            onUploaded={() => {
              setUploadKey((k) => k + 1);
              void load();
            }}
          />
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-amber-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          {loading
            ? "Loading…"
            : `${docs.length} document${docs.length === 1 ? "" : "s"}`}
          {resolvedCompanyId != null ? ` · company #${resolvedCompanyId}` : ""}
          {purpose ? ` · ${purposeLabel(purpose)}` : ""}
        </p>
        {purpose === "training_ingestion" ? (
          <Link
            href="/core/training-ingest"
            className="text-xs font-medium text-teal-800 hover:underline"
          >
            Open Training Ingestion
          </Link>
        ) : null}
        {purpose === "completed_document" ? (
          <Link
            href="/documents/completed"
            className="text-xs font-medium text-teal-800 hover:underline"
          >
            Open Completed Documents
          </Link>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading documents…</p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-slate-500">
          No documents found. Upload a file or clear filters and refresh.
        </p>
      ) : (
        <ul className="divide-y rounded-xl border border-slate-200 bg-white">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start"
            >
              <FileText
                className="mt-0.5 h-5 w-5 shrink-0 text-teal-600"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  {doc.file_name ?? doc.originalName}
                </p>
                <dl className="mt-1 grid gap-x-4 gap-y-0.5 text-xs text-slate-500 sm:grid-cols-2">
                  <div>
                    <dt className="inline text-slate-400">file_id: </dt>
                    <dd className="inline tabular-nums">
                      {doc.file_id ?? doc.id}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-400">Purpose: </dt>
                    <dd className="inline">{purposeLabel(doc.purpose)}</dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-400">file_type: </dt>
                    <dd className="inline">
                      {doc.file_type ?? doc.mimeType}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-400">Size: </dt>
                    <dd className="inline">{formatBytes(doc.sizeBytes)}</dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-400">Company: </dt>
                    <dd className="inline">
                      {doc.companyName
                        ? `${doc.companyName} (#${doc.companyId})`
                        : doc.companyId != null
                          ? `#${doc.companyId}`
                          : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-400">
                      linked_project_id:{" "}
                    </dt>
                    <dd className="inline">
                      {doc.linked_project_id != null || doc.projectId != null
                        ? `${doc.projectName ? `${doc.projectName} · ` : ""}#${
                            doc.linked_project_id ?? doc.projectId
                          }`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-400">uploaded_at: </dt>
                    <dd className="inline">
                      {formatWhen(doc.uploaded_at ?? doc.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline text-slate-400">uploaded_by: </dt>
                    <dd className="inline">
                      {doc.uploaded_by?.email ??
                        doc.uploadedBy?.email ??
                        "—"}
                    </dd>
                  </div>
                  {doc.ingestionRun ? (
                    <div className="sm:col-span-2">
                      <dt className="inline text-slate-400">Ingestion: </dt>
                      <dd className="inline">
                        <Link
                          href={`/core/training-ingest?runId=${doc.ingestionRun.id}`}
                          className="font-medium text-teal-800 hover:underline"
                        >
                          Run #{doc.ingestionRun.id}
                        </Link>
                        {" · "}
                        {doc.ingestionRun.status}
                        {doc.ingestionRun.ocrConfidence != null
                          ? ` · OCR ${(doc.ingestionRun.ocrConfidence * 100).toFixed(0)}%`
                          : ""}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
                {doc.publicUrl ? (
                  <a
                    href={doc.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-teal-700 hover:underline"
                  >
                    Open <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                ) : null}
                {doc.purpose === "training_ingestion" || doc.ingestionRun ? (
                  <Link
                    href="/core/training-ingest"
                    className="text-sm text-slate-600 hover:underline"
                  >
                    Training ingest
                  </Link>
                ) : null}
                {doc.purpose === "completed_document" ? (
                  <Link
                    href="/documents/completed"
                    className="text-sm text-slate-600 hover:underline"
                  >
                    Completed docs
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
