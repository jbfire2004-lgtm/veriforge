import { fetchJson } from "./core";
import { API_URL } from "./api";

export type CredentialLifecycleStatus =
  | "valid"
  | "expired"
  | "revoked"
  | "needs_review"
  | "pending";

export type CredentialLedgerEvent = {
  id: number;
  occurredAt: string;
  actorId: number | null;
  actorType: string;
  eventType: string;
  credentialId: number;
  workerId: number | null;
  providerId: number | null;
  projectId: number | null;
  companyId: number | null;
  correlationId: string | null;
  payload: Record<string, unknown>;
};

export type VerificationChain = {
  credentialId: number;
  status: CredentialLifecycleStatus;
  worker: {
    id: number;
    firstName: string;
    lastName: string;
    email: string | null;
  } | null;
  provider: { id: number; name: string } | null;
  trainingProvider: { id: number; name: string } | null;
  certification: { id: number; name: string; code: string | null } | null;
  issuedAt: string | null;
  expiresAt: string | null;
  certificateNumber: string | null;
  latestValidationOutcome: string | null;
  events: CredentialLedgerEvent[];
};

export async function fetchCredentialVerificationChain(
  credentialId: number,
): Promise<VerificationChain> {
  return fetchJson<VerificationChain>(
    `${API_URL}/api/v1/credential-ledger/${credentialId}/verification-chain`,
    { cache: "no-store", credentials: "include" },
  );
}

export type LedgerBackfillResult = {
  dryRun: boolean;
  scanned: number;
  recordsBackfilled: number;
  recordsSkipped: number;
  eventsCreated: number;
  errors: Array<{ credentialId: number; message: string }>;
};

export async function backfillCredentialLedger(body: {
  companyId?: number;
  limit?: number;
  dryRun?: boolean;
}): Promise<LedgerBackfillResult> {
  return fetchJson(`${API_URL}/api/v1/credential-ledger/backfill`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
