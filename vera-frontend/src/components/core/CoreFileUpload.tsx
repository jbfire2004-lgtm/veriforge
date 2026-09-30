"use client";

import { useCallback, useEffect, useState } from "react";
import {
  coreUploadClientAllowsFile,
  fetchCoreUploadConfig,
  formatMaxSizeLabel,
  mimeListToAccept,
  uploadCoreFile,
  type CoreFileDto,
  type CoreUploadConfig,
} from "@/src/api/core-upload";
import { unknownToErrorMessage } from "@/lib/core";
import { CoreAlert } from "@/src/components/core/CoreAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CORE_FILE_PURPOSE_OPTIONS,
  type CoreFilePurpose,
} from "@/lib/core/core-file-purposes";

export type CoreFileUploadProps = {
  purpose?: string;
  /** Allow choosing purpose in the form (overrides fixed purpose when set). */
  allowPurposeSelect?: boolean;
  companyId?: number;
  projectId?: number;
  /** Called after a successful upload */
  onUploaded?: (file: CoreFileDto) => void;
  className?: string;
};

export function CoreFileUpload({
  purpose: purposeProp = "document_storage",
  allowPurposeSelect = false,
  companyId,
  projectId,
  onUploaded,
  className,
}: CoreFileUploadProps) {
  const [config, setConfig] = useState<CoreUploadConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [purpose, setPurpose] = useState<string>(purposeProp);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CoreFileDto | null>(null);

  useEffect(() => {
    setPurpose(purposeProp);
  }, [purposeProp]);

  useEffect(() => {
    let cancelled = false;
    void fetchCoreUploadConfig()
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setConfigError(
            unknownToErrorMessage(e, "Could not load upload config")
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onSelect = useCallback((f: File | null) => {
    setFile(f);
    setError(null);
    setResult(null);
    setProgress(0);
    setStage(null);
  }, []);

  const submit = useCallback(async () => {
    if (!config || !file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setStage(null);
    try {
      if (!coreUploadClientAllowsFile(file, config)) {
        throw new Error(
          `This file type (${file.type || "unknown"}) is not allowed for this file name. Allowed: ${config.allowedMimeTypes.join(", ")}`
        );
      }
      if (file.size > config.maxBytes) {
        throw new Error(
          `File exceeds maximum size (${formatMaxSizeLabel(config.maxBytes)}).`
        );
      }
      const row = await uploadCoreFile(file, config, {
        purpose,
        companyId,
        projectId,
        onProgress: setProgress,
        onStage: (s) => {
          const labels: Record<string, string> = {
            upload: "Uploading to server…",
            presign: "Requesting secure upload URL…",
            put: "Uploading to storage…",
            complete: "Finalizing…",
          };
          setStage(labels[s] ?? s);
        },
      });
      setResult(row);
      onUploaded?.(row);
    } catch (e: unknown) {
      setError(unknownToErrorMessage(e));
      setProgress(0);
      setStage(null);
    } finally {
      setBusy(false);
      setStage(null);
    }
  }, [config, file, purpose, companyId, projectId, onUploaded]);

  const accept = config ? mimeListToAccept(config.allowedMimeTypes) : undefined;

  return (
    <div className={className}>
      {configError && (
        <CoreAlert className="mb-4">{configError}</CoreAlert>
      )}

      {!config && !configError && (
        <p className="mb-4 text-sm text-slate-600" role="status">
          Loading upload settings…
        </p>
      )}

      {config && (
        <p className="mb-3 text-sm text-slate-600">
          Storage mode:{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">{config.mode}</code>
          {" · "}
          Max {formatMaxSizeLabel(config.maxBytes)}
          {" · "}
          Types: {config.allowedMimeTypes.join(", ")}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="core-file">File</Label>
        <Input
          id="core-file"
          type="file"
          accept={accept}
          disabled={busy || !config}
          onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
        />
      </div>

      {allowPurposeSelect ? (
        <div className="mt-4 space-y-2">
          <Label htmlFor="core-purpose">Purpose</Label>
          <select
            id="core-purpose"
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={purpose}
            disabled={busy}
            onChange={(e) => setPurpose(e.target.value as CoreFilePurpose)}
          >
            {CORE_FILE_PURPOSE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {companyId != null ? (
        <p className="mt-3 text-xs text-slate-600">
          Company ID: <span className="font-medium tabular-nums">{companyId}</span>
          {projectId != null ? (
            <>
              {" · "}Project ID:{" "}
              <span className="font-medium tabular-nums">{projectId}</span>
            </>
          ) : null}
        </p>
      ) : projectId != null ? (
        <p className="mt-3 text-xs text-slate-600">
          Project ID: <span className="font-medium tabular-nums">{projectId}</span>
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        <div className="flex h-3 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-inner">
          <div
            className="bg-indigo-600 transition-[width] duration-200 ease-out"
            style={{ width: `${busy || result ? progress : 0}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Upload progress"
          />
        </div>
        <p className="text-xs text-slate-600">
          {busy ? (
            <>
              {stage ? <span>{stage} </span> : null}
              <span className="font-medium tabular-nums">{progress}%</span>
            </>
          ) : result ? (
            <span className="text-emerald-800">Complete</span>
          ) : (
            "Ready — choose a file within the limits above."
          )}
        </p>
      </div>

      {error && (
        <CoreAlert className="mt-4">{error}</CoreAlert>
      )}

      {result && (
        <CoreAlert variant="success" className="mt-4">
          <p className="font-medium">Uploaded</p>
          <p className="mt-1 font-mono text-xs break-all">
            id={result.id} · {result.objectKey}
          </p>
          {result.publicUrl && (
            <a
              href={result.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-emerald-800 underline"
            >
              Open file
            </a>
          )}
        </CoreAlert>
      )}

      <div className="mt-4">
        <Button
          type="button"
          disabled={busy || !file || !config}
          onClick={() => void submit()}
        >
          {busy ? "Uploading…" : "Upload"}
        </Button>
      </div>
    </div>
  );
}
