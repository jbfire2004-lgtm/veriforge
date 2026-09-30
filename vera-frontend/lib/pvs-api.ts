/**
 * PVS client → `/api/pvs` → SaaS.
 */
import { getVeriHubSession } from "@/lib/verihub-org-api";
import { getHiringClientSession } from "@/lib/hiring-client-api";

export type PvsProgramCategory =
  | "hazard_assessment"
  | "emergency_response"
  | "incident_investigation"
  | "ppe"
  | "working_at_heights"
  | "confined_space"
  | "lockout_tagout"
  | "substance_abuse"
  | "orientation_training"
  | "environmental"
  | "other";

export type PvsVerificationStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "verified"
  | "rejected"
  | "exempt"
  | "missing";

export type PvsElementStatus =
  | "pending"
  | "verified"
  | "missing"
  | "exempt"
  | "na";

export type PvsMatrixElement = {
  id: string;
  elementKey: string;
  elementLabel: string;
  required: boolean;
  status: PvsElementStatus;
  notes?: string | null;
};

export type ProgramVerification = {
  id: string;
  contractorId: string;
  programCategory: PvsProgramCategory;
  title: string;
  programBody?: string | null;
  fileUrl?: string | null;
  verificationStatus: PvsVerificationStatus;
  exemptionFlag: boolean;
  exemptionReason?: string | null;
  exemptionApprovalStatus: "none" | "pending" | "approved" | "rejected";
  reviewerId?: string | null;
  reviewerName?: string | null;
  verifiedAt?: string | null;
  verificationNotes?: string | null;
  safetyMatrix?: unknown;
  elements?: PvsMatrixElement[];
  version: number;
};

export type PvsDashboard = {
  contractorId: string;
  pvsScore: number;
  totals: {
    programs: number;
    verified: number;
    exempt: number;
    pendingExemption: number;
    inReview: number;
  };
  coverage: {
    category: PvsProgramCategory;
    label: string;
    required: boolean;
    present: boolean;
    satisfied: boolean;
    status: string;
    exemptionFlag: boolean;
    pvsId: string | null;
  }[];
  missingRequired: PvsProgramCategory[];
  indicators: {
    hasMissingRequired: boolean;
    hasPendingExemption: boolean;
    ready: boolean;
  };
};

export type PvsQuickCheck = {
  contractorId: string;
  pvsScore: number;
  passed: number;
  total: number;
  ready: boolean;
  checks: { id: string; label: string; ok: boolean; detail: string }[];
  generatedAt: string;
};

export type PvsAnalytics = PvsDashboard & {
  elementStats: {
    total: number;
    verified: number;
    pending: number;
    missing: number;
  };
  byStatus: Record<string, number>;
};

function authHeader(): string | null {
  const org = getVeriHubSession();
  if (org?.accessToken) return `Bearer ${org.accessToken}`;
  const hc = getHiringClientSession();
  if (hc?.accessToken) return `Bearer ${hc.accessToken}`;
  return null;
}

async function pvsFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const auth = authHeader();
  if (auth) headers.set("Authorization", auth);
  const res = await fetch(`/api/pvs${path}`, { ...init, headers });
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

export async function fetchPvsMatrix() {
  return pvsFetch<{ categories: unknown[] }>("/matrix");
}

export async function fetchPvsDashboard(contractorId: string) {
  return pvsFetch<PvsDashboard>(`/dashboard/${contractorId}`);
}

export async function fetchPvsAnalytics(contractorId: string) {
  return pvsFetch<PvsAnalytics>(`/analytics/${contractorId}`);
}

export async function fetchPvsQuickCheck(contractorId: string) {
  return pvsFetch<PvsQuickCheck>(`/quickcheck/${contractorId}`);
}

export async function listPvsPrograms(contractorId: string) {
  return pvsFetch<{
    items: ProgramVerification[];
    requiredCategories: PvsProgramCategory[];
  }>(`/${contractorId}`);
}

export async function getPvsProgram(contractorId: string, pvsId: string) {
  return pvsFetch<ProgramVerification>(`/${contractorId}/${pvsId}`);
}

export async function ensureRequiredPvs(contractorId: string) {
  return pvsFetch<{ created: string[] }>(`/${contractorId}/ensure-required`, {
    method: "POST",
    body: "{}",
  });
}

export async function createPvsProgram(
  contractorId: string,
  body: {
    programCategory: PvsProgramCategory;
    title?: string;
    programBody?: string;
    fileUrl?: string;
  },
) {
  return pvsFetch<ProgramVerification>(`/${contractorId}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updatePvsProgram(
  contractorId: string,
  pvsId: string,
  body: { title?: string; programBody?: string; fileUrl?: string },
) {
  return pvsFetch<ProgramVerification>(`/${contractorId}/${pvsId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function submitPvsProgram(contractorId: string, pvsId: string) {
  return pvsFetch<ProgramVerification>(`/${contractorId}/${pvsId}/submit`, {
    method: "POST",
    body: "{}",
  });
}

export async function updatePvsMatrix(
  contractorId: string,
  pvsId: string,
  elements: { elementKey: string; status: PvsElementStatus; notes?: string }[],
) {
  return pvsFetch<ProgramVerification>(`/${contractorId}/${pvsId}/matrix`, {
    method: "POST",
    body: JSON.stringify({ elements }),
  });
}

export async function verifyPvsProgram(
  contractorId: string,
  pvsId: string,
  body: {
    decision: "verified" | "rejected";
    notes?: string;
    elements?: {
      elementKey: string;
      status: PvsElementStatus;
      notes?: string;
    }[];
  },
) {
  return pvsFetch<ProgramVerification>(`/${contractorId}/${pvsId}/verify`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function requestPvsExemption(
  contractorId: string,
  pvsId: string,
  reason: string,
) {
  return pvsFetch<ProgramVerification>(`/${contractorId}/${pvsId}/exempt`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function decidePvsExemption(
  contractorId: string,
  pvsId: string,
  decision: "approved" | "rejected",
) {
  return pvsFetch<ProgramVerification>(
    `/${contractorId}/${pvsId}/exempt/decide`,
    { method: "POST", body: JSON.stringify({ decision }) },
  );
}

export async function clearPvsExemption(contractorId: string, pvsId: string) {
  return pvsFetch<ProgramVerification>(
    `/${contractorId}/${pvsId}/exempt/clear`,
    { method: "POST", body: "{}" },
  );
}
