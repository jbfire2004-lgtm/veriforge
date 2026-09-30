import { getSession } from "next-auth/react";
import { API_URL } from "./api";
import { errorFromApiResponse, fetchJson } from "./core";

/** Metadata fields aligned with `TrainingIngestRowDto` (see backend). */
export const TRAINING_INGEST_METADATA_FIELDS = [
  "workerId (number, required)",
  "certificationId (optional) or certificationCode or certificationName",
  "issuedAt (ISO-8601 date, required)",
  "expiresAt (ISO-8601 date, required)",
  "providerName (optional string)",
] as const;

export type TrainingIngestionRun = {
  id: number;
  companyId: number;
  status: string;
  sourceMime: string;
  originalFilename: string;
  sizeBytes: number;
  ocrText: string | null;
  metadataSnapshot: unknown;
  validationErrors: unknown;
  resultSummary: {
    created?: number;
    errors?: { row: number; message: string }[];
    recordIds?: number[];
    needsReview?: number;
    autoVerified?: number;
    correlationId?: string;
  } | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  company: { id: number; name: string };
};

export type IngestionPreview = {
  correlationId: string;
  rows: Array<Record<string, unknown>>;
  confidence: {
    overall: number;
    blocked: boolean;
    needsReview: boolean;
    reasons: string[];
    fields: Record<string, number>;
  };
  ocrText?: string | null;
  validationErrors: string[];
  canConfirm: boolean;
};

export type QrIngestResult = {
  correlationId: string;
  status: "linked" | "needs_review" | "preview";
  trainingRecordId?: number;
  validationResultId?: number;
  message: string;
  certificate?: {
    valid: boolean;
    expired: boolean;
    workerName?: string;
    certification?: string;
  };
};

export async function fetchTrainingIngestRun(
  id: number
): Promise<TrainingIngestionRun> {
  return fetchJson<TrainingIngestionRun>(
    `${API_URL}/api/v1/training-ingestion/runs/${id}`,
    { cache: "no-store", credentials: "include" }
  );
}

/**
 * Multipart upload with upload progress (local/S3-agnostic: posts to API).
 */
export function uploadTrainingIngestFile(
  file: File,
  companyId: number,
  options?: {
    /** JSON string: one row, `rows` array, or top-level array */
    metadata?: string;
    onProgress?: (percent: number) => void;
  }
): Promise<TrainingIngestionRun> {
  return (async () => {
    const session = await getSession();
    const token = session?.accessToken;
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      form.append("companyId", String(companyId));
      if (options?.metadata) form.append("metadata", options.metadata);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_URL}/api/v1/training-ingestion/upload`);
      xhr.withCredentials = true;
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && options?.onProgress) {
          options.onProgress(Math.round((100 * e.loaded) / e.total));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText) as TrainingIngestionRun);
          } catch {
            reject(new Error("Invalid JSON from server"));
          }
        } else {
          reject(errorFromApiResponse(xhr.status, xhr.responseText));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.send(form);
    });
  })();
}

export function previewTrainingIngestFile(
  file: File,
  companyId: number,
  options?: { metadata?: string; onProgress?: (percent: number) => void },
): Promise<IngestionPreview> {
  return (async () => {
    const session = await getSession();
    const token = session?.accessToken;
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      form.append("companyId", String(companyId));
      if (options?.metadata) form.append("metadata", options.metadata);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_URL}/api/v1/training-ingestion/preview`);
      xhr.withCredentials = true;
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && options?.onProgress) {
          options.onProgress(Math.round((100 * e.loaded) / e.total));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText) as IngestionPreview);
          } catch {
            reject(new Error("Invalid JSON from server"));
          }
        } else {
          reject(errorFromApiResponse(xhr.status, xhr.responseText));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during preview"));
      xhr.send(form);
    });
  })();
}

export async function confirmTrainingIngest(
  companyId: number,
  rows: Array<Record<string, unknown>>,
  correlationId?: string,
): Promise<{ runId: number; created: number; needsReview: number; recordIds: number[] }> {
  return fetchJson(`${API_URL}/api/v1/training-ingestion/confirm`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId, rows, correlationId }),
  });
}

export async function ingestTrainingQr(
  companyId: number,
  workerId: number,
  qr: string,
): Promise<QrIngestResult> {
  return fetchJson(`${API_URL}/api/v1/training-ingestion/qr`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId, workerId, qr }),
  });
}

export async function fetchNeedsReviewQueue(companyId: number, limit = 50) {
  return fetchJson<unknown[]>(
    `${API_URL}/api/v1/training-ingestion/needs-review?companyId=${companyId}&limit=${limit}`,
    { cache: "no-store", credentials: "include" },
  );
}

export async function approveIngestReview(validationId: number, notes?: string) {
  return fetchJson(`${API_URL}/api/v1/training-ingestion/review/${validationId}/approve`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
}
