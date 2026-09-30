"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileJson,
  FileText,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import {
  confirmTrainingIngest,
  fetchTrainingIngestRun,
  previewTrainingIngestFile,
  TRAINING_INGEST_METADATA_FIELDS,
  uploadTrainingIngestFile,
  type IngestionPreview,
  type TrainingIngestionRun,
} from "@/lib/training-ingestion-v1";
import { TrainingQrIngestPanel } from "@/src/components/core/TrainingQrIngestPanel";
import { unknownToErrorMessage } from "@/lib/core";
import { CoreAlert } from "@/src/components/core/CoreAlert";
import {
  CompanySelectField,
  type CompanyOption,
} from "@/src/components/core/CompanySelectField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const METADATA_PLACEHOLDER = `Example single row:
{
  "workerId": 1,
  "certificationCode": "FIRST-AID",
  "issuedAt": "2025-01-15",
  "expiresAt": "2027-01-15",
  "providerName": "Acme Training"
}`;

export type TrainingIngestPipelineProps = {
  className?: string;
  companies?: CompanyOption[];
  defaultCompanyId?: number;
  lockCompany?: boolean;
};

function resolveInitialCompanyId(
  companies: CompanyOption[],
  defaultCompanyId?: number,
): string {
  if (defaultCompanyId != null && defaultCompanyId > 0) {
    return String(defaultCompanyId);
  }
  if (companies.length === 1) {
    return String(companies[0]!.id);
  }
  return "";
}

// ---------------------------------------------------------------------------
// Presentation helpers (pure UI — no backend changes)
// ---------------------------------------------------------------------------

type StageState = "pending" | "active" | "done" | "error";

const REQUIRED_FIELD_KEYS = ["workerId", "issuedAt", "expiresAt"] as const;
const CERT_KEYS = ["certificationId", "certificationCode", "certificationName"] as const;
const KNOWN_FIELD_ORDER = [
  "workerId",
  "certificationId",
  "certificationCode",
  "certificationName",
  "issuedAt",
  "expiresAt",
  "providerName",
] as const;

type ExtractedRow = {
  index: number;
  fields: Array<{ key: string; value: string; required: boolean; missing: boolean }>;
  confidence: number | null;
  missingRequired: string[];
};

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function toDisplayValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

/** Normalize a confidence value (0–1 or 0–100) to a 0–100 percentage, or null. */
function normalizeConfidence(raw: unknown): number | null {
  if (typeof raw !== "number" || Number.isNaN(raw)) return null;
  const pct = raw <= 1 ? raw * 100 : raw;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

/** Defensively pull row records out of an unknown metadata snapshot. */
function extractRows(snapshot: unknown): ExtractedRow[] {
  if (snapshot == null) return [];
  let raw: unknown[];
  if (Array.isArray(snapshot)) {
    raw = snapshot;
  } else if (
    typeof snapshot === "object" &&
    Array.isArray((snapshot as { rows?: unknown }).rows)
  ) {
    raw = (snapshot as { rows: unknown[] }).rows;
  } else if (typeof snapshot === "object") {
    raw = [snapshot];
  } else {
    return [];
  }

  return raw.map((entry, index) => {
    const obj =
      entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};
    const confidence =
      normalizeConfidence(obj.confidence) ??
      normalizeConfidence((obj.meta as Record<string, unknown> | undefined)?.confidence);

    const hasCert = CERT_KEYS.some((k) => obj[k] != null && obj[k] !== "");
    const keys = Array.from(
      new Set([...KNOWN_FIELD_ORDER, ...Object.keys(obj)]),
    ).filter((k) => k !== "confidence" && k !== "meta");

    const fields = keys
      .filter((k) => KNOWN_FIELD_ORDER.includes(k as (typeof KNOWN_FIELD_ORDER)[number]) || obj[k] != null)
      .map((key) => {
        const required = REQUIRED_FIELD_KEYS.includes(
          key as (typeof REQUIRED_FIELD_KEYS)[number],
        );
        const value = toDisplayValue(obj[key]);
        return { key, value, required, missing: required && value === "" };
      });

    const missingRequired = REQUIRED_FIELD_KEYS.filter(
      (k) => obj[k] == null || obj[k] === "",
    );
    if (!hasCert) missingRequired.push("certification");

    return { index, fields, confidence, missingRequired };
  });
}

function StageBadge({ state }: { state: StageState }) {
  if (state === "done") {
    return <CheckCircle2 className="h-5 w-5 text-[#247A78]" aria-hidden />;
  }
  if (state === "active") {
    return <Loader2 className="h-5 w-5 animate-spin text-[#2F8F8C]" aria-hidden />;
  }
  if (state === "error") {
    return <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden />;
  }
  return (
    <span
      className="h-2.5 w-2.5 rounded-full bg-[#2A2E33]/25"
      aria-hidden
    />
  );
}

function StageStepper({
  stages,
}: {
  stages: Array<{ key: string; label: string; hint: string; state: StageState }>;
}) {
  return (
    <ol className="grid gap-3 sm:grid-cols-3" aria-label="Ingestion pipeline progress">
      {stages.map((stage, i) => {
        const tone =
          stage.state === "done"
            ? "border-[#247A78]/40 bg-[#E4F3F2]"
            : stage.state === "active"
              ? "border-[#2F8F8C]/50 bg-white ring-1 ring-[#2F8F8C]/20"
              : stage.state === "error"
                ? "border-red-200 bg-red-50"
                : "border-[#2A2E33]/10 bg-white";
        return (
          <li
            key={stage.key}
            className={`relative flex items-start gap-3 rounded-xl border p-4 shadow-sm transition ${tone}`}
            aria-current={stage.state === "active" ? "step" : undefined}
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center">
              <StageBadge state={stage.state} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5a6b7c]">
                Step {i + 1}
              </p>
              <p className="text-sm font-semibold text-[#2A2E33]">{stage.label}</p>
              <p className="mt-0.5 text-xs text-[#5a6b7c]">{stage.hint}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function TimelineStep({
  state,
  title,
  detail,
  last,
}: {
  state: StageState;
  title: string;
  detail?: string;
  last?: boolean;
}) {
  const dotTone =
    state === "done"
      ? "border-[#247A78] bg-[#247A78] text-white"
      : state === "active"
        ? "border-[#2F8F8C] bg-white text-[#2F8F8C]"
        : state === "error"
          ? "border-red-500 bg-red-500 text-white"
          : "border-[#2A2E33]/20 bg-white text-transparent";
  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!last ? (
        <span
          className="absolute left-[11px] top-6 h-[calc(100%-1rem)] w-px bg-[#2A2E33]/12"
          aria-hidden
        />
      ) : null}
      <span
        className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${dotTone}`}
      >
        {state === "active" ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        ) : state === "error" ? (
          <AlertTriangle className="h-3 w-3" aria-hidden />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        )}
      </span>
      <div className="min-w-0 pt-0.5">
        <p
          className={`text-sm font-medium ${
            state === "pending" ? "text-[#5a6b7c]" : "text-[#2A2E33]"
          }`}
        >
          {title}
        </p>
        {detail ? <p className="mt-0.5 text-xs text-[#5a6b7c]">{detail}</p> : null}
      </div>
    </li>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const tone =
    value >= 80
      ? "bg-[#247A78]"
      : value >= 60
        ? "bg-amber-500"
        : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#2A2E33]/10">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-[#2A2E33]">{value}%</span>
    </div>
  );
}

/** Compact badge for overall confidence (0–1). */
function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round((value <= 1 ? value * 100 : value));
  const tone =
    pct >= 80
      ? "bg-emerald-100 text-emerald-900"
      : pct >= 55
        ? "bg-amber-100 text-amber-900"
        : "bg-red-100 text-red-900";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone}`}>
      {pct}% confidence
    </span>
  );
}

export function TrainingIngestPipeline({
  className,
  companies = [],
  defaultCompanyId,
  lockCompany = false,
}: TrainingIngestPipelineProps) {
  const [companyId, setCompanyId] = useState(() =>
    resolveInitialCompanyId(companies, defaultCompanyId),
  );
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState("");
  const [progress, setProgress] = useState(0);
  const [op, setOp] = useState<"idle" | "uploading" | "refreshing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<TrainingIngestionRun | null>(null);
  const [preview, setPreview] = useState<IngestionPreview | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const busy = op !== "idle";

  useEffect(() => {
    if (companyId !== "") return;
    const next = resolveInitialCompanyId(companies, defaultCompanyId);
    if (next !== "") setCompanyId(next);
  }, [companies, defaultCompanyId, companyId]);

  // Local image thumbnail preview (client-side only — no upload required).
  useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
    return undefined;
  }, [file]);

  const submit = useCallback(async () => {
    const cid = parseInt(companyId, 10);
    if (!Number.isFinite(cid) || cid < 1) {
      setError(companies.length > 0 ? "Select a company." : "Enter a valid company ID.");
      return;
    }
    if (!file) {
      setError("Choose a file.");
      return;
    }
    const isJsonFile =
      file.type === "application/json" ||
      file.name.toLowerCase().endsWith(".json");
    if (!isJsonFile && metadata.trim() === "") {
      setError("Metadata JSON is required for PDF/image ingestion.");
      return;
    }

    let metadataPayload: string | undefined;
    const trimmedMeta = metadata.trim();
    if (trimmedMeta !== "") {
      try {
        JSON.parse(trimmedMeta);
        metadataPayload = trimmedMeta;
      } catch {
        setError("Metadata must be valid JSON.");
        return;
      }
    }

    setOp("uploading");
    setError(null);
    setProgress(0);
    setRun(null);
    setPreview(null);

    try {
      const result = await previewTrainingIngestFile(file, cid, {
        metadata: metadataPayload,
        onProgress: setProgress,
      });
      setPreview(result);
      if (result.rows.length > 0 && trimmedMeta === "") {
        setMetadata(JSON.stringify({ rows: result.rows }, null, 2));
      }
    } catch (e: unknown) {
      setError(unknownToErrorMessage(e));
      setProgress(0);
    } finally {
      setOp("idle");
    }
  }, [companyId, file, metadata, companies.length]);

  const confirmPreview = useCallback(async () => {
    const cid = parseInt(companyId, 10);
    if (!preview?.canConfirm) {
      setError("Fix validation issues before confirming.");
      return;
    }
    let rows: Array<Record<string, unknown>>;
    try {
      const parsed = JSON.parse(metadata.trim() || "{}") as unknown;
      if (Array.isArray(parsed)) rows = parsed;
      else if (
        typeof parsed === "object" &&
        parsed != null &&
        "rows" in parsed &&
        Array.isArray((parsed as { rows: unknown }).rows)
      ) {
        rows = (parsed as { rows: Array<Record<string, unknown>> }).rows;
      } else {
        rows = [parsed as Record<string, unknown>];
      }
    } catch {
      setError("Metadata must be valid JSON with ingest rows.");
      return;
    }

    setOp("uploading");
    setError(null);
    try {
      const summary = await confirmTrainingIngest(cid, rows, preview.correlationId);
      const runDetail = await fetchTrainingIngestRun(summary.runId);
      setRun(runDetail);
      setPreview(null);
    } catch (e: unknown) {
      setError(unknownToErrorMessage(e));
    } finally {
      setOp("idle");
    }
  }, [companyId, metadata, preview]);

  const quickUpload = useCallback(async () => {
    const cid = parseInt(companyId, 10);
    if (!file || !Number.isFinite(cid)) return;
    let metadataPayload: string | undefined;
    const trimmedMeta = metadata.trim();
    if (trimmedMeta !== "") {
      try {
        JSON.parse(trimmedMeta);
        metadataPayload = trimmedMeta;
      } catch {
        setError("Metadata must be valid JSON.");
        return;
      }
    }
    setOp("uploading");
    setError(null);
    try {
      const result = await uploadTrainingIngestFile(file, cid, {
        metadata: metadataPayload,
        onProgress: setProgress,
      });
      setRun(result);
      setPreview(null);
    } catch (e: unknown) {
      setError(unknownToErrorMessage(e));
    } finally {
      setOp("idle");
    }
  }, [companyId, file, metadata]);

  const refreshRun = useCallback(async () => {
    if (!run?.id) return;
    setOp("refreshing");
    setError(null);
    try {
      const r = await fetchTrainingIngestRun(run.id);
      setRun(r);
    } catch (e: unknown) {
      setError(unknownToErrorMessage(e));
    } finally {
      setOp("idle");
    }
  }, [run]);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDragActive(false);
      if (busy) return;
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) {
        setFile(dropped);
        setError(null);
      }
    },
    [busy],
  );

  // -- Derived UI state --------------------------------------------------------

  const rows = useMemo(() => extractRows(run?.metadataSnapshot), [run?.metadataSnapshot]);
  const lowConfidenceRows = rows.filter(
    (r) => r.confidence != null && r.confidence < 70,
  );
  const missingFieldRows = rows.filter((r) => r.missingRequired.length > 0);
  const hasValidationErrors =
    run?.validationErrors != null &&
    (Array.isArray(run.validationErrors)
      ? run.validationErrors.length > 0
      : true);

  const stages = useMemo<
    Array<{ key: string; label: string; hint: string; state: StageState }>
  >(() => {
    const uploadState: StageState = run
      ? "done"
      : op === "uploading"
        ? "active"
        : error
          ? "error"
          : "active";

    let parseState: StageState = "pending";
    if (run) {
      parseState =
        run.status === "FAILED"
          ? "error"
          : run.status === "PROCESSING"
            ? "active"
            : "done";
    } else if (op === "uploading") {
      parseState = "pending";
    }

    let verifyState: StageState = "pending";
    if (run) {
      if (run.status === "FAILED") verifyState = "error";
      else if (run.status === "PROCESSING") verifyState = "pending";
      else if ((run.resultSummary?.errors?.length ?? 0) > 0) verifyState = "error";
      else if ((run.resultSummary?.recordIds?.length ?? 0) > 0) verifyState = "done";
      else verifyState = "active";
    }

    return [
      {
        key: "upload",
        label: "Upload",
        hint:
          op === "uploading"
            ? `Transferring… ${progress}%`
            : run
              ? run.originalFilename
              : "Choose or drop a file",
        state: uploadState,
      },
      {
        key: "parse",
        label: "Parse",
        hint:
          parseState === "active"
            ? "Extracting & parsing…"
            : parseState === "done"
              ? `${rows.length || 0} row(s) parsed`
              : parseState === "error"
                ? "Processing failed"
                : "OCR + metadata extraction",
        state: parseState,
      },
      {
        key: "verify",
        label: "Verify",
        hint:
          verifyState === "done"
            ? `${run?.resultSummary?.recordIds?.length ?? 0} record(s) ready`
            : verifyState === "error"
              ? "Resolve errors below"
              : "Confirm & verify records",
        state: verifyState,
      },
    ];
  }, [run, op, error, progress, rows.length]);

  const timeline = useMemo<
    Array<{ key: string; title: string; detail?: string; state: StageState }>
  >(() => {
    if (!run) return [];
    const processing = run.status === "PROCESSING";
    const failed = run.status === "FAILED";
    const completed = run.status === "COMPLETED";
    return [
      {
        key: "received",
        title: "File received",
        detail: `${run.originalFilename} · ${run.sourceMime} · ${formatBytes(run.sizeBytes)}`,
        state: "done",
      },
      {
        key: "ocr",
        title: "OCR / vision extraction",
        detail: run.ocrText
          ? `${run.ocrText.length} characters extracted`
          : processing
            ? "Running…"
            : "No OCR text (structured source)",
        state: processing ? "active" : failed ? "error" : "done",
      },
      {
        key: "metadata",
        title: "Metadata parsed",
        detail:
          rows.length > 0
            ? `${rows.length} row(s) detected`
            : processing
              ? "Pending"
              : "No structured rows",
        state:
          run.metadataSnapshot != null
            ? "done"
            : processing
              ? "pending"
              : failed
                ? "error"
                : "done",
      },
      {
        key: "validation",
        title: "Validation",
        detail: hasValidationErrors
          ? "Issues found — see details"
          : processing
            ? "Pending"
            : "Passed",
        state: hasValidationErrors
          ? "error"
          : processing
            ? "pending"
            : completed
              ? "done"
              : "pending",
      },
      {
        key: "records",
        title: "Training records created",
        detail:
          run.resultSummary?.created != null
            ? `${run.resultSummary.created} created${
                run.resultSummary.errors?.length
                  ? ` · ${run.resultSummary.errors.length} failed`
                  : ""
              }`
            : failed
              ? "Not created"
              : processing
                ? "Pending"
                : "—",
        state: failed
          ? "error"
          : (run.resultSummary?.created ?? 0) > 0
            ? "done"
            : (run.resultSummary?.errors?.length ?? 0) > 0
              ? "error"
              : processing
                ? "pending"
                : completed
                  ? "done"
                  : "pending",
      },
    ];
  }, [run, rows.length, hasValidationErrors]);

  const FileIcon = !file
    ? UploadCloud
    : file.type === "application/json" || file.name.toLowerCase().endsWith(".json")
      ? FileJson
      : file.type.startsWith("image/")
        ? ImageIcon
        : FileText;

  return (
    <div className={className}>
      <StageStepper stages={stages} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ---------------------------------------------------------------- */}
        {/* Left: upload form                                                 */}
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-4">
          {companies.length > 0 ? (
            <CompanySelectField
              id="ingest-company"
              companies={companies}
              value={companyId}
              onChange={setCompanyId}
              disabled={busy}
              locked={lockCompany}
              addCompanyHref="/admin/companies/new"
            />
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="ingest-company">Company ID</Label>
              <Input
                id="ingest-company"
                inputMode="numeric"
                placeholder="e.g. 1"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                disabled={busy}
              />
              <p className="text-xs text-slate-500">
                Company directory unavailable — enter an ID manually, or open{" "}
                <Link href="/admin/companies" className="text-teal-700 underline">
                  Admin → Companies
                </Link>
                .
              </p>
            </div>
          )}

          {/* Drag-and-drop upload zone */}
          <div className="space-y-1.5">
            <Label htmlFor="ingest-file">Source document</Label>
            <label
              htmlFor="ingest-file"
              onDragOver={(e) => {
                e.preventDefault();
                if (!busy) setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200 ${
                busy ? "cursor-not-allowed opacity-60" : ""
              } ${
                dragActive
                  ? "scale-[1.01] border-[#2F8F8C] bg-[#E4F3F2] shadow-md"
                  : "border-[#2A2E33]/20 bg-white hover:border-[#2F8F8C]/60 hover:bg-[#E4F3F2]/60"
              }`}
            >
              <span
                className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 ${
                  dragActive
                    ? "-translate-y-0.5 bg-[#2F8F8C] text-white"
                    : "bg-[#247A78]/10 text-[#247A78] group-hover:-translate-y-0.5"
                }`}
              >
                <FileIcon className="h-6 w-6" aria-hidden />
              </span>
              {file ? (
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#2A2E33]">
                    {file.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-[#5a6b7c]">
                    {formatBytes(file.size)} · click or drop to replace
                  </span>
                </span>
              ) : (
                <span>
                  <span className="block text-sm font-semibold text-[#2A2E33]">
                    Drag &amp; drop your file here
                  </span>
                  <span className="mt-0.5 block text-xs text-[#5a6b7c]">
                    or click to browse — PDF, PNG, JPG, or JSON
                  </span>
                </span>
              )}
            </label>
            <Input
              id="ingest-file"
              type="file"
              className="sr-only"
              accept=".pdf,.png,.jpg,.jpeg,.json,application/pdf,image/png,image/jpeg,application/json"
              disabled={busy}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ingest-meta">
              Metadata JSON{" "}
              <span className="font-normal text-slate-500">
                (required for PDF/images; optional override for JSON files)
              </span>
            </Label>
            <textarea
              id="ingest-meta"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[140px] w-full rounded-md border px-3 py-2 font-mono text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={METADATA_PLACEHOLDER}
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              disabled={busy}
            />
            <p className="text-xs text-slate-500">
              Fields: {TRAINING_INGEST_METADATA_FIELDS.join(" · ")}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-2 overflow-hidden rounded-full bg-[#2A2E33]/10">
              <div
                className="bg-gradient-to-r from-[#247A78] to-[#2F8F8C] transition-[width] duration-150"
                style={{
                  width: `${op === "uploading" ? progress : run ? 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-500" aria-live="polite">
              {op === "uploading"
                ? `Uploading… ${progress}%`
                : op === "refreshing"
                  ? "Refreshing run status…"
                  : run
                    ? "Done"
                    : "Idle"}
            </p>
          </div>

          {preview && (
            <div className="rounded-xl border border-[#2A2E33]/10 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#2A2E33]">Parsed preview</p>
                <ConfidenceBadge value={preview.confidence.overall} />
              </div>
              {preview.validationErrors.length > 0 ? (
                <CoreAlert variant="warning">
                  {preview.validationErrors.join(" · ")}
                </CoreAlert>
              ) : null}
              {preview.confidence.blocked ? (
                <CoreAlert variant="error">
                  Confidence too low — correct metadata before saving.
                </CoreAlert>
              ) : preview.confidence.needsReview ? (
                <CoreAlert variant="warning">
                  Low confidence — records will be flagged for supervisor review.
                </CoreAlert>
              ) : null}
              <pre className="max-h-40 overflow-auto rounded-md border bg-slate-50 p-2 text-xs">
                {JSON.stringify(preview.rows, null, 2)}
              </pre>
            </div>
          )}

          {error && <CoreAlert>{error}</CoreAlert>}

          <div className="flex flex-wrap gap-2">
            <Button className="min-h-11" type="button" disabled={busy} onClick={() => void submit()}>
              {op === "uploading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Parsing…
                </>
              ) : (
                <>
                  <ScanLine className="mr-2 h-4 w-4" aria-hidden />
                  Preview extraction
                </>
              )}
            </Button>
            {preview?.canConfirm ? (
              <Button
                className="min-h-11"
                type="button"
                disabled={busy}
                onClick={() => void confirmPreview()}
              >
                <ShieldCheck className="mr-2 h-4 w-4" aria-hidden />
                Confirm &amp; save
              </Button>
            ) : null}
            <Button
              className="min-h-11"
              type="button"
              variant="outline"
              disabled={busy || !file}
              onClick={() => void quickUpload()}
            >
              <UploadCloud className="mr-2 h-4 w-4" aria-hidden />
              Quick upload
            </Button>
            {run && (
              <Button
                className="min-h-11"
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void refreshRun()}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${op === "refreshing" ? "animate-spin" : ""}`}
                  aria-hidden
                />
                Refresh run
              </Button>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Right: document preview + extracted fields                        */}
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#2A2E33]/10 bg-white p-4 shadow-sm">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#5a6b7c]">
              <ScanLine className="h-4 w-4 text-[#247A78]" aria-hidden />
              Document preview
            </p>
            <div className="flex gap-4">
              <div className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#2A2E33]/10 bg-[#f8fafc]">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={file?.name ?? "Document preview"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileIcon className="h-9 w-9 text-[#2A2E33]/30" aria-hidden />
                )}
              </div>
              <dl className="min-w-0 flex-1 space-y-1.5 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-[#5a6b7c]">File</dt>
                  <dd className="truncate font-medium text-[#2A2E33]">
                    {file?.name ?? run?.originalFilename ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#5a6b7c]">Type</dt>
                  <dd className="font-medium text-[#2A2E33]">
                    {file?.type || run?.sourceMime || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[#5a6b7c]">Size</dt>
                  <dd className="font-medium text-[#2A2E33]">
                    {file ? formatBytes(file.size) : run ? formatBytes(run.sizeBytes) : "—"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Extracted fields + confidence (after a run completes parsing) */}
          {run && rows.length > 0 ? (
            <div className="rounded-2xl border border-[#2A2E33]/10 bg-white p-4 shadow-sm">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#5a6b7c]">
                <FileText className="h-4 w-4 text-[#247A78]" aria-hidden />
                Extracted fields
              </p>
              <div className="space-y-4">
                {rows.map((row) => (
                  <div
                    key={row.index}
                    className="rounded-xl border border-[#2A2E33]/10 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#2A2E33]">
                        Row {row.index + 1}
                      </span>
                      {row.confidence != null ? (
                        <ConfidenceBar value={row.confidence} />
                      ) : (
                        <span className="text-xs text-[#5a6b7c]">Not scored</span>
                      )}
                    </div>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                      {row.fields.map((f) => (
                        <div
                          key={f.key}
                          className="flex items-center justify-between gap-2"
                        >
                          <dt className="text-[#5a6b7c]">{f.key}</dt>
                          <dd
                            className={`truncate font-medium ${
                              f.missing ? "text-red-600" : "text-[#2A2E33]"
                            }`}
                          >
                            {f.missing ? "missing" : f.value || "—"}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {row.missingRequired.length > 0 ? (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                        <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                        Missing required: {row.missingRequired.join(", ")}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Parsing timeline */}
          {run ? (
            <div className="rounded-2xl border border-[#2A2E33]/10 bg-white p-4 shadow-sm">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#5a6b7c]">
                <ShieldCheck className="h-4 w-4 text-[#247A78]" aria-hidden />
                Processing timeline
              </p>
              <ol>
                {timeline.map((step, i) => (
                  <TimelineStep
                    key={step.key}
                    state={step.state}
                    title={step.title}
                    detail={step.detail}
                    last={i === timeline.length - 1}
                  />
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>

      {Number.isFinite(parseInt(companyId, 10)) && parseInt(companyId, 10) > 0 ? (
        <TrainingQrIngestPanel
          companyId={parseInt(companyId, 10)}
          disabled={busy}
        />
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/* Full-width review / details                                         */}
      {/* ------------------------------------------------------------------ */}
      {run && (
        <section className="mt-8 space-y-4 border-t border-[#2A2E33]/10 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#2A2E33]">Review</h2>
            <span className="font-mono text-xs text-[#5a6b7c]">Run #{run.id}</span>
          </div>

          {run.status === "FAILED" && (
            <CoreAlert variant="warning">
              <p className="font-medium">Run failed</p>
              <p className="mt-1 text-sm">
                Validation or processing did not complete. See error and details
                below.
              </p>
            </CoreAlert>
          )}
          {run.status === "PROCESSING" && (
            <CoreAlert role="status">
              <p className="font-medium">Run in progress</p>
              <p className="mt-1 text-sm">
                The server is still processing this upload. Use &quot;Refresh
                run&quot; to update status.
              </p>
            </CoreAlert>
          )}
          {run.status === "COMPLETED" &&
            (run.resultSummary?.errors?.length ?? 0) > 0 && (
              <CoreAlert variant="warning">
                <p className="font-medium">Completed with row errors</p>
                <p className="mt-1 text-sm">
                  {run.resultSummary?.created ?? 0} row(s) created;{" "}
                  {run.resultSummary!.errors!.length} row(s) failed. Review errors
                  below.
                </p>
              </CoreAlert>
            )}
          {run.status === "COMPLETED" &&
            (run.resultSummary?.errors?.length ?? 0) === 0 && (
              <CoreAlert variant="success" role="status">
                <p className="font-medium">Run finished successfully</p>
                <p className="mt-1 text-sm">Review training record results below.</p>
              </CoreAlert>
            )}

          {/* Low-confidence / missing-field warnings (UI-derived, defensive) */}
          {lowConfidenceRows.length > 0 && (
            <CoreAlert variant="warning">
              <p className="font-medium">Low extraction confidence</p>
              <p className="mt-1 text-sm">
                {lowConfidenceRows.length} row(s) scored below 70%. Verify the
                extracted values before confirming records.
              </p>
            </CoreAlert>
          )}
          {missingFieldRows.length > 0 && run.status !== "PROCESSING" && (
            <CoreAlert variant="warning">
              <p className="font-medium">Missing required fields</p>
              <p className="mt-1 text-sm">
                {missingFieldRows.length} row(s) are missing required fields
                (workerId, issuedAt, expiresAt, or certification). These rows may
                not produce training records.
              </p>
            </CoreAlert>
          )}

          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="text-[#5a6b7c]">Status</dt>
              <dd className="font-medium text-[#2A2E33]">{run.status}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-[#5a6b7c]">Source</dt>
              <dd className="truncate text-[#2A2E33]">
                {run.originalFilename} ({run.sourceMime})
              </dd>
            </div>
          </dl>

          {run.errorMessage && (
            <CoreAlert variant="warning">
              <p className="font-medium">Error</p>
              <p className="mt-1 whitespace-pre-wrap">{run.errorMessage}</p>
            </CoreAlert>
          )}

          {run.resultSummary &&
            run.status === "COMPLETED" &&
            run.resultSummary.recordIds &&
            run.resultSummary.recordIds.length > 0 && (
              <div className="space-y-3">
                {(run.resultSummary.autoVerified ?? 0) > 0 ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm">
                    <p className="font-medium text-emerald-950">
                      Auto-verified expiry
                    </p>
                    <p className="mt-1 text-emerald-900">
                      {run.resultSummary.autoVerified} record(s) passed
                      high-confidence OCR and non-expired date checks — written
                      to Document Storage as{" "}
                      <code className="text-xs">training_ingestion</code> and
                      marked verified for competency.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href="/pm/documents?type=training_ingestion&kind=attachment"
                        className="rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-950"
                      >
                        Open in Document Archive
                      </Link>
                      <Link
                        href="/core/training-competency"
                        className="rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-950"
                      >
                        Competency profiles
                      </Link>
                    </div>
                  </div>
                ) : null}

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm">
                  <p className="font-medium text-emerald-950">
                    {(run.resultSummary.autoVerified ?? 0) > 0
                      ? "Linked records"
                      : "Next: verify records"}
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-emerald-900">
                    {run.resultSummary.recordIds.map((id) => (
                      <li key={id}>
                        <Link
                          href={`/verify/core/training/${id}`}
                          className="font-mono text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
                        >
                          Record #{id}
                        </Link>
                        {" · "}
                        <Link
                          href={`/core/training-competency?trainingRecordId=${id}`}
                          className="text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
                        >
                          Competency profile
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {(() => {
                    const ids = run.resultSummary!.recordIds!;
                    const hubParams = new URLSearchParams();
                    hubParams.set("trainingRecordId", String(ids[0]));
                    if (ids.length > 1) {
                      hubParams.set("relatedRecordIds", ids.slice(1).join(","));
                    }
                    return (
                      <p className="mt-3 text-xs text-emerald-900/80">
                        {(run.resultSummary!.needsReview ?? 0) > 0
                          ? `${run.resultSummary!.needsReview} need human review. `
                          : ""}
                        Open the{" "}
                        <Link
                          href={`/core/verification?${hubParams.toString()}`}
                          className="font-semibold text-emerald-950 underline underline-offset-2"
                        >
                          verification hub
                        </Link>{" "}
                        for remaining checks and attestations.
                      </p>
                    );
                  })()}
                </div>
              </div>
            )}

          {/* Raw diagnostics — preserved, now collapsible */}
          <div className="grid gap-3 lg:grid-cols-2">
            {run.ocrText && (
              <details className="rounded-xl border border-[#2A2E33]/10 bg-white p-3">
                <summary className="cursor-pointer text-sm font-medium text-[#2A2E33]">
                  OCR extraction (stub)
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs whitespace-pre-wrap">
                  {run.ocrText}
                </pre>
              </details>
            )}

            {run.metadataSnapshot != null && (
              <details className="rounded-xl border border-[#2A2E33]/10 bg-white p-3">
                <summary className="cursor-pointer text-sm font-medium text-[#2A2E33]">
                  Parsed metadata snapshot
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs">
                  {JSON.stringify(run.metadataSnapshot, null, 2)}
                </pre>
              </details>
            )}

            {run.validationErrors != null && (
              <details className="rounded-xl border border-amber-200 bg-amber-50/60 p-3" open>
                <summary className="cursor-pointer text-sm font-medium text-amber-900">
                  Validation issues
                </summary>
                <pre className="mt-2 max-h-32 overflow-auto rounded-md border border-amber-100 bg-amber-50/80 p-3 text-xs">
                  {JSON.stringify(run.validationErrors, null, 2)}
                </pre>
              </details>
            )}

            {run.resultSummary && (
              <details className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                <summary className="cursor-pointer text-sm font-medium text-emerald-900">
                  TrainingRecord results
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto rounded-md border border-emerald-100 bg-emerald-50/50 p-3 text-xs">
                  {JSON.stringify(run.resultSummary, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
