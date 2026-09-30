"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  coreUploadClientAllowsFile,
  fetchCoreUploadConfig,
  formatMaxSizeLabel,
  isCoreUploadAbortError,
  mimeListToAccept,
  uploadCoreFile,
  type CoreFileDto,
  type CoreUploadConfig,
} from "@/src/api/core-upload";
import { unknownToErrorMessage } from "@/lib/core";
import { cn } from "@/src/lib/utils";
import { CoreAlert } from "@/src/components/core/CoreAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type QueueFileStatus =
  | "queued"
  | "uploading"
  | "success"
  | "error"
  | "cancelled"
  | "invalid";

export type QueuedFileItem = {
  id: string;
  file: File;
  status: QueueFileStatus;
  progress: number;
  /** UI label for direct mode stages */
  stageLabel?: string;
  validationError?: string;
  error?: string;
  result?: CoreFileDto;
  abortController?: AbortController;
};

function newId(): string {
  return crypto.randomUUID();
}

function validateAgainstConfig(
  file: File,
  config: CoreUploadConfig
): string | null {
  if (!coreUploadClientAllowsFile(file, config)) {
    return `Type not allowed for this file name / browser MIME. Allowed: ${config.allowedMimeTypes.join(", ")}`;
  }
  if (file.size > config.maxBytes) {
    return `Too large (max ${formatMaxSizeLabel(config.maxBytes)}).`;
  }
  return null;
}

export type CoreMultiFileUploadProps = {
  purpose?: string;
  companyId?: number;
  projectId?: number;
  onFileUploaded?: (file: CoreFileDto, meta: { queueId: string }) => void;
  /** When true, new files are appended while uploads run (FIFO queue). */
  className?: string;
};

export function CoreMultiFileUpload({
  purpose,
  companyId,
  projectId,
  onFileUploaded,
  className,
}: CoreMultiFileUploadProps) {
  const [config, setConfig] = useState<CoreUploadConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [items, setItems] = useState<QueuedFileItem[]>([]);
  const [dragOver, setDragOver] = useState(false);

  /** Prevents double-starts (e.g. React Strict Mode) while an upload is in flight. */
  const uploadingIdRef = useRef<string | null>(null);

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

  const enqueueFiles = useCallback(
    (fileList: FileList | File[]) => {
      if (!config) return;
      const arr = Array.from(fileList);
      const next: QueuedFileItem[] = arr.map((file) => {
        const ve = validateAgainstConfig(file, config);
        if (ve) {
          return {
            id: newId(),
            file,
            status: "invalid",
            progress: 0,
            validationError: ve,
          };
        }
        return {
          id: newId(),
          file,
          status: "queued",
          progress: 0,
        };
      });
      setItems((prev) => [...prev, ...next]);
    },
    [config]
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const row = prev.find((x) => x.id === id);
      if (row?.status === "uploading" && row.abortController) {
        row.abortController.abort();
      }
      if (uploadingIdRef.current === id) {
        uploadingIdRef.current = null;
      }
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  const cancelItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((x) => {
        if (x.id !== id) return x;
        if (x.status === "uploading" && x.abortController) {
          x.abortController.abort();
          return {
            ...x,
            status: "cancelled" as const,
            progress: 0,
            stageLabel: undefined,
            error: "Cancelled",
            abortController: undefined,
          };
        }
        if (x.status === "queued") {
          return {
            ...x,
            status: "cancelled" as const,
            error: "Removed from queue",
          };
        }
        return x;
      })
    );
    if (uploadingIdRef.current === id) {
      uploadingIdRef.current = null;
    }
  }, []);

  const retryItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((x) =>
        x.id === id && x.status === "error"
          ? {
              ...x,
              status: "queued" as const,
              progress: 0,
              error: undefined,
              stageLabel: undefined,
            }
          : x
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setItems((prev) =>
      prev.filter((x) => x.status !== "success" && x.status !== "cancelled" && x.status !== "invalid")
    );
  }, []);

  /** Sequential drain: one active upload at a time. */
  useEffect(() => {
    if (!config || uploadingIdRef.current !== null) return;
    const next = items.find((i) => i.status === "queued");
    if (!next) return;

    uploadingIdRef.current = next.id;
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- queue worker: transition queued → uploading
    setItems((prev) =>
      prev.map((x) =>
        x.id === next.id
          ? {
              ...x,
              status: "uploading",
              progress: 0,
              abortController: ac,
              stageLabel: undefined,
              error: undefined,
            }
          : x
      )
    );

    const stageLabels: Record<string, string> = {
      upload: "Uploading…",
      presign: "Presign…",
      put: "Uploading to storage…",
      complete: "Finalizing…",
    };

    void uploadCoreFile(next.file, config, {
      purpose,
      companyId,
      projectId,
      signal: ac.signal,
      onProgress: (p) => {
        setItems((prev) =>
          prev.map((x) =>
            x.id === next.id ? { ...x, progress: p } : x
          )
        );
      },
      onStage: (s) => {
        setItems((prev) =>
          prev.map((x) =>
            x.id === next.id
              ? { ...x, stageLabel: stageLabels[s] ?? s }
              : x
          )
        );
      },
    })
      .then((result) => {
        setItems((prev) =>
          prev.map((x) =>
            x.id === next.id
              ? {
                  ...x,
                  status: "success",
                  progress: 100,
                  result,
                  abortController: undefined,
                  stageLabel: undefined,
                }
              : x
          )
        );
        onFileUploaded?.(result, { queueId: next.id });
      })
      .catch((e: unknown) => {
        if (isCoreUploadAbortError(e)) {
          setItems((prev) =>
            prev.map((x) =>
              x.id === next.id
                ? {
                    ...x,
                    status: "cancelled",
                    progress: 0,
                    error: "Cancelled",
                    abortController: undefined,
                    stageLabel: undefined,
                  }
                : x
            )
          );
        } else {
          setItems((prev) =>
            prev.map((x) =>
              x.id === next.id
                ? {
                    ...x,
                    status: "error",
                    progress: 0,
                    error: unknownToErrorMessage(e),
                    abortController: undefined,
                    stageLabel: undefined,
                  }
                : x
            )
          );
        }
      })
      .finally(() => {
        uploadingIdRef.current = null;
      });
  }, [items, config, purpose, companyId, projectId, onFileUploaded]);

  const accept = config ? mimeListToAccept(config.allowedMimeTypes) : undefined;

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (!config) return;
      enqueueFiles(e.dataTransfer.files);
    },
    [config, enqueueFiles]
  );

  return (
    <div className={cn("space-y-4", className)}>
      {configError && <CoreAlert>{configError}</CoreAlert>}

      {!config && !configError && (
        <p className="text-sm text-slate-600" role="status">
          Loading upload settings…
        </p>
      )}

      {config && (
        <p className="text-sm text-slate-600">
          Mode <code className="rounded bg-slate-100 px-1 text-xs">{config.mode}</code>
          {" · "}
          Max {formatMaxSizeLabel(config.maxBytes)}
          {" · "}
          One file uploads at a time; additional files wait in the queue.
        </p>
      )}

      <div
        className={cn(
          "rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
          dragOver
            ? "border-indigo-500 bg-indigo-50/80"
            : "border-slate-300 bg-slate-50/50",
          !config && "pointer-events-none opacity-50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <p className="text-sm font-medium text-slate-800">
          Drag and drop files here
        </p>
        <p className="mt-1 text-xs text-slate-500">or choose files below</p>
        <div className="mt-4">
          <Label htmlFor="multi-file" className="sr-only">
            Files
          </Label>
          <Input
            id="multi-file"
            type="file"
            multiple
            accept={accept}
            disabled={!config}
            className="max-w-xs mx-auto cursor-pointer"
            onChange={(e) => {
              const files = e.target.files;
              if (files?.length) enqueueFiles(files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-800">
              Queue ({items.length})
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearCompleted}
            >
              Clear finished
            </Button>
          </div>

          <ul className="space-y-3">
            {items.map((row) => (
              <li
                key={row.id}
                className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {row.file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(row.file.size / 1024).toFixed(1)} KiB
                      {row.file.type && ` · ${row.file.type}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1">
                    {(row.status === "queued" || row.status === "error") && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-slate-600"
                        onClick={() => removeItem(row.id)}
                      >
                        Remove
                      </Button>
                    )}
                    {row.status === "error" && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8"
                        onClick={() => retryItem(row.id)}
                      >
                        Retry
                      </Button>
                    )}
                    {(row.status === "uploading" || row.status === "queued") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => cancelItem(row.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <span
                    className={cn(
                      "inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase",
                      row.status === "uploading" && "bg-amber-100 text-amber-950",
                      row.status === "queued" && "bg-slate-100 text-slate-800",
                      row.status === "success" && "bg-emerald-100 text-emerald-950",
                      row.status === "error" && "bg-red-100 text-red-900",
                      row.status === "cancelled" && "bg-neutral-100 text-neutral-700",
                      row.status === "invalid" && "bg-orange-100 text-orange-900"
                    )}
                  >
                    {row.status}
                  </span>
                  {row.stageLabel && (
                    <span className="ml-2 text-xs text-slate-600">
                      {row.stageLabel}
                    </span>
                  )}
                </div>

                {(row.status === "uploading" || row.status === "success") && (
                  <div className="mt-2">
                    <div className="flex h-2 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                      <div
                        className="bg-indigo-600 transition-[width] duration-150 ease-out"
                        style={{
                          width: `${row.status === "success" ? 100 : row.progress}%`,
                        }}
                        role="progressbar"
                        aria-valuenow={row.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <p className="mt-0.5 text-xs tabular-nums text-slate-600">
                      {row.status === "success" ? 100 : row.progress}%
                    </p>
                  </div>
                )}

                {row.validationError && (
                  <p className="mt-2 text-xs text-orange-800">
                    {row.validationError}
                  </p>
                )}
                {row.error && row.status !== "cancelled" && (
                  <p className="mt-2 text-xs text-red-700">{row.error}</p>
                )}
                {row.status === "cancelled" && row.error && (
                  <p className="mt-2 text-xs text-slate-600">{row.error}</p>
                )}

                {row.result?.publicUrl && row.status === "success" && (
                  <a
                    href={row.result.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-indigo-700 underline"
                  >
                    Open file
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
