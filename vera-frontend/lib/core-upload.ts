import { getSession } from "next-auth/react";
import { API_URL } from "./api";
import { coreFileAllowedByConfig, effectiveMimeForCoreFile } from "./core-upload-mime";
import { errorFromApiResponse, fetchJson } from "./core";

export type CoreUploadConfig = {
  mode: "local" | "s3" | "direct";
  maxBytes: number;
  allowedMimeTypes: string[];
};

export type CoreFileDto = {
  id: number;
  storage: string;
  status: string;
  objectKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string | null;
  purpose: string | null;
  companyId?: number | null;
  userId?: number | null;
  createdAt: string;
  completedAt: string | null;
};

export type PresignResponse = {
  id: number;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
  objectKey: string;
  expiresInSeconds: number;
};

export async function fetchCoreUploadConfig(): Promise<CoreUploadConfig> {
  return fetchJson<CoreUploadConfig>(`${API_URL}/api/v1/core/uploads/config`, {
    cache: "no-store",
    credentials: "include",
  });
}

export async function fetchCoreUploadById(id: number): Promise<CoreFileDto> {
  return fetchJson<CoreFileDto>(`${API_URL}/api/v1/core/uploads/${id}`, {
    cache: "no-store",
    credentials: "include",
  });
}

export function isCoreUploadAbortError(e: unknown): boolean {
  if (e instanceof DOMException && e.name === "AbortError") return true;
  if (e instanceof Error && e.name === "AbortError") return true;
  return false;
}

function xhrSend(
  opts: {
    method: string;
    url: string;
    body: XMLHttpRequestBodyInit | FormData;
    headers?: Record<string, string>;
    withCredentials?: boolean;
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (opts.signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open(opts.method, opts.url);
    xhr.withCredentials = opts.withCredentials ?? false;
    if (opts.headers) {
      for (const [k, v] of Object.entries(opts.headers)) {
        xhr.setRequestHeader(k, v);
      }
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && opts.onProgress) {
        opts.onProgress(Math.round((100 * e.loaded) / e.total));
      }
    };

    const cleanup = () => {
      opts.signal?.removeEventListener("abort", onAbort);
    };

    const onAbort = () => {
      xhr.abort();
    };

    opts.signal?.addEventListener("abort", onAbort);

    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText || "");
      } else {
        reject(errorFromApiResponse(xhr.status, xhr.responseText));
      }
    };
    xhr.onerror = () => {
      cleanup();
      reject(new Error("Network error during upload"));
    };
    xhr.onabort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };

    xhr.send(opts.body);
  });
}

/**
 * Multipart upload for `local` and `s3` modes (server receives the file).
 */
export async function uploadCoreFileMultipart(
  file: File,
  options?: {
    purpose?: string;
    companyId?: number;
    projectId?: number;
    onProgress?: (percent: number) => void;
    onStage?: (stage: "upload") => void;
    signal?: AbortSignal;
  }
): Promise<CoreFileDto> {
  options?.onStage?.("upload");
  const session = await getSession();
  const headers: Record<string, string> = {};
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }
  const form = new FormData();
  form.append("file", file);
  if (options?.purpose) form.append("purpose", options.purpose);
  if (options?.companyId != null) {
    form.append("companyId", String(options.companyId));
  }
  if (options?.projectId != null) {
    form.append("projectId", String(options.projectId));
  }

  const text = await xhrSend({
    method: "POST",
    url: `${API_URL}/api/v1/core/uploads`,
    body: form,
    headers,
    withCredentials: true,
    onProgress: options?.onProgress,
    signal: options?.signal,
  });
  try {
    return JSON.parse(text) as CoreFileDto;
  } catch {
    throw new Error("Invalid JSON from upload response");
  }
}

/**
 * Browser PUT to S3 using presigned URL (mode `direct`).
 */
export async function uploadCoreFileDirect(
  file: File,
  options?: {
    purpose?: string;
    companyId?: number;
    projectId?: number;
    onProgress?: (percent: number) => void;
    /** Optional labels for UI (presign → PUT → complete). */
    onStage?: (stage: "presign" | "put" | "complete") => void;
    signal?: AbortSignal;
  }
): Promise<CoreFileDto> {
  const signal = options?.signal;
  const report = (pct: number) => options?.onProgress?.(Math.min(100, Math.max(0, pct)));

  options?.onStage?.("presign");
  report(2);

  const session = await getSession();
  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (session?.accessToken) {
    authHeaders.Authorization = `Bearer ${session.accessToken}`;
  }

  const mimeForPresign = effectiveMimeForCoreFile(file);

  const presignRes = await fetch(`${API_URL}/api/v1/core/uploads/presign`, {
    method: "POST",
    credentials: "include",
    headers: authHeaders,
    body: JSON.stringify({
      filename: file.name,
      mimeType: mimeForPresign,
      sizeBytes: file.size,
      purpose: options?.purpose,
      companyId: options?.companyId,
      projectId: options?.projectId,
    }),
    signal,
  });
  const presignText = await presignRes.text();
  if (!presignRes.ok) throw errorFromApiResponse(presignRes.status, presignText);

  let presign: PresignResponse;
  try {
    presign = JSON.parse(presignText) as PresignResponse;
  } catch {
    throw new Error("Invalid JSON from presign response");
  }
  if (!presign.uploadUrl || presign.id == null) {
    throw new Error("Presign response missing uploadUrl or id");
  }

  const headers: Record<string, string> = {
    ...presign.headers,
  };

  options?.onStage?.("put");
  report(8);

  const abandon = async () => {
    try {
      await fetch(`${API_URL}/api/v1/core/uploads/abandon/${presign.id}`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders,
        signal,
      });
    } catch {
      /* best-effort; row may stay PENDING without server support */
    }
  };

  try {
    await xhrSend({
      method: presign.method,
      url: presign.uploadUrl,
      body: file,
      headers,
      withCredentials: false,
      onProgress: (p) => {
        // Reserve 8–92% for the PUT; presign + complete use the rest.
        report(8 + Math.round((84 * p) / 100));
      },
      signal,
    });
  } catch (e) {
    await abandon();
    throw e;
  }

  options?.onStage?.("complete");
  report(93);

  const completeRes = await fetch(`${API_URL}/api/v1/core/uploads/complete`, {
    method: "POST",
    credentials: "include",
    headers: authHeaders,
    body: JSON.stringify({ id: presign.id }),
    signal,
  });
  const completeText = await completeRes.text();
  if (!completeRes.ok) {
    await abandon();
    throw errorFromApiResponse(completeRes.status, completeText);
  }
  report(100);
  try {
    return JSON.parse(completeText) as CoreFileDto;
  } catch {
    await abandon();
    throw new Error("Invalid JSON from complete response");
  }
}

/** Single entry: branches by server `mode` from config (caller should pass config.mode). */
export async function uploadCoreFile(
  file: File,
  config: CoreUploadConfig,
  options?: {
    purpose?: string;
    companyId?: number;
    projectId?: number;
    onProgress?: (percent: number) => void;
    onStage?: (
      stage: "presign" | "put" | "complete" | "upload"
    ) => void;
    signal?: AbortSignal;
  }
): Promise<CoreFileDto> {
  if (config.mode === "direct") {
    return uploadCoreFileDirect(file, options);
  }
  return uploadCoreFileMultipart(file, options);
}

/** Client-side gate aligned with {@link coreFileAllowedByConfig} (use before calling upload). */
export function coreUploadClientAllowsFile(
  file: File,
  config: CoreUploadConfig
): boolean {
  return coreFileAllowedByConfig(file, config.allowedMimeTypes);
}

export function formatMaxSizeLabel(maxBytes: number): string {
  if (maxBytes >= 1024 * 1024) {
    const mb = maxBytes / (1024 * 1024);
    return mb % 1 === 0 ? `${mb} MiB` : `${mb.toFixed(1)} MiB`;
  }
  if (maxBytes >= 1024) return `${Math.round(maxBytes / 1024)} KiB`;
  return `${maxBytes} bytes`;
}

/** HTML file input `accept` hint from MIME list */
export function mimeListToAccept(mimes: string[]): string {
  const ext: Record<string, string> = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg,.jpeg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  const parts = mimes.flatMap((m) => {
    const e = ext[m];
    return e ? [m, ...e.split(",")] : [m];
  });
  return [...new Set(parts)].join(",");
}
