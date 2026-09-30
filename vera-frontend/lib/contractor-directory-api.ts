/**
 * Contractor Directory client → `/api/contractors` → SaaS.
 */
import { getVeriHubSession } from "@/lib/verihub-org-api";
import { getHiringClientSession } from "@/lib/hiring-client-api";

export type InsuranceStatus =
  | "valid"
  | "expiring"
  | "expired"
  | "missing"
  | "unknown";

export type ConnectionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revoked"
  | null;

export type ContractorListItem = {
  contractorId: string;
  legalName: string;
  tradeName: string | null;
  safetyRating: number;
  insuranceStatus: InsuranceStatus;
  complianceScore: number;
  contactInfo: Record<string, unknown>;
  industry: string | null;
  region: string | null;
  connectionStatus: ConnectionStatus;
  connectionId: string | null;
  organization: { id: string; name: string; slug: string; status: string };
};

export type ContractorProfile = ContractorListItem & {
  documents: unknown[];
  audits: unknown[];
  sites: unknown[];
  isListed: boolean;
  notes: string | null;
  complianceBreakdown: {
    documentsScore: number;
    auditsScore: number;
    insuranceScore: number;
    pvsScore?: number;
    complianceScore: number;
    weights: {
      documents: number;
      audits: number;
      insurance: number;
      pvs?: number;
    };
  };
  connection: {
    id: string;
    status: ConnectionStatus;
    message: string | null;
    respondedAt: string | null;
  } | null;
};

function authHeader(): string | null {
  const org = getVeriHubSession();
  if (org?.accessToken) return `Bearer ${org.accessToken}`;
  const hc = getHiringClientSession();
  if (hc?.accessToken) return `Bearer ${hc.accessToken}`;
  return null;
}

async function directoryFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const auth = authHeader();
  if (auth) headers.set("Authorization", auth);
  const res = await fetch(`/api/contractors${path}`, { ...init, headers });
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

export async function listContractorsDirectory(params?: {
  q?: string;
  insuranceStatus?: InsuranceStatus;
  minCompliance?: number;
  region?: string;
  connectionStatus?: string;
  skip?: number;
  take?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.insuranceStatus) qs.set("insuranceStatus", params.insuranceStatus);
  if (params?.minCompliance != null)
    qs.set("minCompliance", String(params.minCompliance));
  if (params?.region) qs.set("region", params.region);
  if (params?.connectionStatus)
    qs.set("connectionStatus", params.connectionStatus);
  if (params?.skip != null) qs.set("skip", String(params.skip));
  if (params?.take != null) qs.set("take", String(params.take));
  const q = qs.toString();
  return directoryFetch<{
    items: ContractorListItem[];
    total: number;
    skip: number;
    take: number;
    page: number;
    pageCount: number;
  }>(q ? `?${q}` : "");
}

export async function getContractorDirectoryProfile(id: string) {
  return directoryFetch<ContractorProfile>(`/${id}`);
}

export async function createContractorProfile(body: {
  legalName: string;
  tradeName?: string;
  industry?: string;
  region?: string;
  contactInfo?: Record<string, string>;
}) {
  return directoryFetch<ContractorProfile>("", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function requestContractorConnection(
  contractorId: string,
  message?: string,
) {
  return directoryFetch<{ connection: { id: string; status: string } }>(
    `/${contractorId}/connect`,
    { method: "POST", body: JSON.stringify({ message }) },
  );
}

export async function listConnectionInbox(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return directoryFetch<{ items: unknown[] }>(`/connections/inbox${qs}`);
}

export async function respondToConnection(
  connectionId: string,
  decision: "approved" | "rejected",
  responseMessage?: string,
) {
  return directoryFetch(`/connections/${connectionId}/respond`, {
    method: "POST",
    body: JSON.stringify({ decision, responseMessage }),
  });
}
