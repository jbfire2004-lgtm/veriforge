/**
 * Document Center client → `/api/documents` → SaaS.
 */
import { getVeriHubSession } from "@/lib/verihub-org-api";
import { getHiringClientSession } from "@/lib/hiring-client-api";

export type DocumentCategory =
  | "insurance"
  | "safety_program"
  | "license"
  | "training";

export type DocumentCenterStatus =
  | "valid"
  | "expiring"
  | "expired"
  | "pending_review"
  | "rejected"
  | "exempt"
  | "missing";

export type DocumentVersion = {
  id: string;
  version: number;
  fileUrl: string;
  fileName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  changeNote?: string | null;
  createdAt: string;
};

export type DocumentCenterDocument = {
  id: string;
  contractorId: string;
  category: DocumentCategory;
  title: string;
  expiryDate: string | null;
  status: DocumentCenterStatus;
  exemptionFlag: boolean;
  exemptionReason: string | null;
  exemptionExpiresAt: string | null;
  currentVersion: number;
  fileUrl: string | null;
  versions?: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
};

export type CategoryRule = {
  category: DocumentCategory;
  label: string;
  required: boolean;
  expiryWarningDays: number;
  allowedMimes: string[];
  maxBytes: number;
  description: string;
};

export type DocumentDashboard = {
  contractorId: string;
  totals: {
    documents: number;
    expiring: number;
    expired: number;
    exempt: number;
    pending: number;
  };
  byCategory: {
    category: DocumentCategory;
    label: string;
    required: boolean;
    count: number;
    satisfied: boolean;
    expiring: number;
    expired: number;
    exempt: number;
  }[];
  indicators: {
    hasExpiring: boolean;
    hasExpired: boolean;
    missingRequired: DocumentCategory[];
  };
};

function authHeader(): string | null {
  const org = getVeriHubSession();
  if (org?.accessToken) return `Bearer ${org.accessToken}`;
  const hc = getHiringClientSession();
  if (hc?.accessToken) return `Bearer ${hc.accessToken}`;
  return null;
}

async function documentsFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const auth = authHeader();
  if (auth) headers.set("Authorization", auth);
  const res = await fetch(`/api/documents${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : `Request failed (${res.status})`,
    );
  }
  return data as T;
}

export async function fetchDocumentRules() {
  return documentsFetch<{ rules: CategoryRule[] }>("/rules");
}

export async function fetchDocumentDashboard(contractorId: string) {
  return documentsFetch<DocumentDashboard>(`/dashboard/${contractorId}`);
}

export async function listDocuments(
  contractorId: string,
  params?: {
    category?: DocumentCategory;
    status?: DocumentCenterStatus;
    skip?: number;
    take?: number;
  },
) {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.status) qs.set("status", params.status);
  if (params?.skip != null) qs.set("skip", String(params.skip));
  if (params?.take != null) qs.set("take", String(params.take));
  const q = qs.toString();
  return documentsFetch<{
    items: DocumentCenterDocument[];
    total: number;
    rules: CategoryRule[];
  }>(`/${contractorId}${q ? `?${q}` : ""}`);
}

export async function getDocument(contractorId: string, documentId: string) {
  return documentsFetch<DocumentCenterDocument>(
    `/${contractorId}/${documentId}`,
  );
}

export async function uploadDocument(
  contractorId: string,
  body: {
    category: DocumentCategory;
    title: string;
    expiryDate?: string | null;
    fileUrl?: string;
    contentBase64?: string;
    fileName?: string;
    mimeType?: string;
    changeNote?: string;
  },
) {
  return documentsFetch<DocumentCenterDocument>(`/${contractorId}/upload`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function replaceDocument(
  contractorId: string,
  documentId: string,
  body: {
    expiryDate?: string | null;
    fileUrl?: string;
    contentBase64?: string;
    fileName?: string;
    mimeType?: string;
    title?: string;
    changeNote?: string;
  },
) {
  return documentsFetch<DocumentCenterDocument>(
    `/${contractorId}/${documentId}/replace`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function expireDocument(
  contractorId: string,
  documentId: string,
) {
  return documentsFetch<DocumentCenterDocument>(
    `/${contractorId}/${documentId}/expire`,
    { method: "POST", body: "{}" },
  );
}

export async function exemptDocument(
  contractorId: string,
  documentId: string,
  body: { reason: string; exemptionExpiresAt?: string | null },
) {
  return documentsFetch<DocumentCenterDocument>(
    `/${contractorId}/${documentId}/exempt`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function clearDocumentExemption(
  contractorId: string,
  documentId: string,
) {
  return documentsFetch<DocumentCenterDocument>(
    `/${contractorId}/${documentId}/clear-exemption`,
    { method: "POST", body: "{}" },
  );
}

export function fileToBase64(file: File): Promise<{
  contentBase64: string;
  fileName: string;
  mimeType: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const contentBase64 = result.includes(",")
        ? result.split(",")[1]!
        : result;
      resolve({
        contentBase64,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
      });
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
