/**
 * Document Service API client stubs.
 * Endpoints match docs/VERIFORGE-DOCUMENT-SERVICE.md and
 * docs/VERIFORGE-COMPLETED-DOCUMENTS-HUB.md.
 *
 * Until the backend ships, these throw with a clear Preview error
 * so UI can show empty/error states without silent fake success.
 */

import type {
  DocumentDomain,
  DocumentStatus,
  DocumentSummary,
  DocumentType,
} from "./constants";
import { HUB_DOCUMENT_STATUSES } from "./constants";

export class DocumentServiceUnavailableError extends Error {
  readonly code = "DocumentServiceUnavailable";
  constructor(message = "Document Service API is not connected yet.") {
    super(message);
    this.name = "DocumentServiceUnavailableError";
  }
}

export type CompletedDocumentsQuery = {
  domain?: DocumentDomain;
  document_type?: DocumentType | DocumentType[];
  worker_id?: string;
  crew_id?: string;
  job_id?: string;
  project_id?: string;
  asset_id?: string;
  location_id?: string;
  status?: DocumentStatus | DocumentStatus[];
  completed_from?: string;
  completed_to?: string;
  q?: string;
  page?: number;
  page_size?: number;
  sort?:
    | "completed_at_desc"
    | "completed_at_asc"
    | "updated_at_desc"
    | "document_type_asc"
    | "status_asc";
};

export type CompletedDocumentsResponse = {
  items: DocumentSummary[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  applied_scope?: "worker" | "supervisor" | "admin";
};

function toCsv(value: string | string[] | undefined): string | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value.join(",") : value;
}

/** Build query string for GET /api/v1/documents/completed */
export function buildCompletedDocumentsSearchParams(
  query: CompletedDocumentsQuery = {},
): URLSearchParams {
  const params = new URLSearchParams();
  const status = query.status ?? [...HUB_DOCUMENT_STATUSES];

  const entries: [string, string | undefined][] = [
    ["domain", query.domain],
    ["document_type", toCsv(query.document_type)],
    ["worker_id", query.worker_id],
    ["crew_id", query.crew_id],
    ["job_id", query.job_id],
    ["project_id", query.project_id],
    ["asset_id", query.asset_id],
    ["location_id", query.location_id],
    ["status", toCsv(status)],
    ["completed_from", query.completed_from],
    ["completed_to", query.completed_to],
    ["q", query.q],
    ["page", query.page != null ? String(query.page) : "1"],
    ["page_size", query.page_size != null ? String(query.page_size) : "25"],
    ["sort", query.sort ?? "completed_at_desc"],
  ];

  for (const [key, value] of entries) {
    if (value != null && value !== "") params.set(key, value);
  }
  return params;
}

/**
 * Fetch completed-documents hub list.
 * Throws DocumentServiceUnavailableError until backend is wired.
 */
export async function fetchCompletedDocuments(
  query: CompletedDocumentsQuery = {},
  init?: RequestInit,
): Promise<CompletedDocumentsResponse> {
  const params = buildCompletedDocumentsSearchParams(query);
  const url = `/api/v1/documents/completed?${params.toString()}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new DocumentServiceUnavailableError(
      "Network error reaching Document Service.",
    );
  }

  if (res.status === 404 || res.status === 501) {
    throw new DocumentServiceUnavailableError(
      "Completed Documents API is not deployed yet.",
    );
  }

  if (!res.ok) {
    throw new DocumentServiceUnavailableError(
      `Document Service error (${res.status}).`,
    );
  }

  return (await res.json()) as CompletedDocumentsResponse;
}

export type ContextualDocumentsQuery = {
  status?: DocumentStatus | DocumentStatus[];
  document_type?: DocumentType | DocumentType[];
  domain?: DocumentDomain;
  page?: number;
  page_size?: number;
};

export function workerDocumentsPath(workerId: string): string {
  return `/api/v1/workers/${workerId}/documents`;
}

export function jobDocumentsPath(jobId: string): string {
  return `/api/v1/jobs/${jobId}/documents`;
}

export function projectDocumentsPath(projectId: string): string {
  return `/api/v1/projects/${projectId}/documents`;
}

export function assetDocumentsPath(assetId: string): string {
  return `/api/v1/assets/${assetId}/documents`;
}

export type WorkerDocumentsResponse = CompletedDocumentsResponse & {
  worker_id: string;
};

export type JobProjectDocumentsResponse = CompletedDocumentsResponse & {
  job_id?: string;
  project_id?: string;
};

export type AssetTimelineResponse = CompletedDocumentsResponse & {
  asset_id: string;
};

function buildContextualParams(query: ContextualDocumentsQuery = {}): URLSearchParams {
  const params = new URLSearchParams();
  const entries: [string, string | undefined][] = [
    ["status", toCsv(query.status)],
    ["document_type", toCsv(query.document_type)],
    ["domain", query.domain],
    ["page", query.page != null ? String(query.page) : "1"],
    ["page_size", query.page_size != null ? String(query.page_size) : "25"],
  ];
  for (const [key, value] of entries) {
    if (value != null && value !== "") params.set(key, value);
  }
  return params;
}

async function fetchContextualDocuments<T>(
  path: string,
  query: ContextualDocumentsQuery = {},
  init?: RequestInit,
): Promise<T> {
  const params = buildContextualParams(query);
  const qs = params.toString();
  const url = qs ? `${path}?${qs}` : path;

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new DocumentServiceUnavailableError(
      "Network error reaching Document Service.",
    );
  }

  if (res.status === 404 || res.status === 501) {
    throw new DocumentServiceUnavailableError(
      "Contextual Documents API is not deployed yet.",
    );
  }

  if (!res.ok) {
    throw new DocumentServiceUnavailableError(
      `Document Service error (${res.status}).`,
    );
  }

  return (await res.json()) as T;
}

export function fetchWorkerDocuments(
  workerId: string,
  query?: ContextualDocumentsQuery,
  init?: RequestInit,
) {
  return fetchContextualDocuments<WorkerDocumentsResponse>(
    workerDocumentsPath(workerId),
    query,
    init,
  );
}

export function fetchJobDocuments(
  jobId: string,
  query?: ContextualDocumentsQuery,
  init?: RequestInit,
) {
  return fetchContextualDocuments<JobProjectDocumentsResponse>(
    jobDocumentsPath(jobId),
    query,
    init,
  );
}

export function fetchProjectDocuments(
  projectId: string,
  query?: ContextualDocumentsQuery,
  init?: RequestInit,
) {
  return fetchContextualDocuments<JobProjectDocumentsResponse>(
    projectDocumentsPath(projectId),
    query,
    init,
  );
}

export function fetchAssetDocuments(
  assetId: string,
  query?: ContextualDocumentsQuery,
  init?: RequestInit,
) {
  return fetchContextualDocuments<AssetTimelineResponse>(
    assetDocumentsPath(assetId),
    query,
    init,
  );
}
