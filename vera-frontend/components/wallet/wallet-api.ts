import { apiFetchJson } from "@/lib/api-fetch";
import { statusFromError, messageFromUnknown } from "@/lib/loader-helpers";
import type { LoaderResult } from "@/lib/use-async-resource";

export type CertificationRef = {
  id?: number;
  name?: string | null;
  code?: string | null;
};

export type CompanyRef = {
  id?: number;
  name?: string | null;
  logoUrl?: string | null;
};

export type WorkerProfile = {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  company?: CompanyRef | null;
};

export type TrainingRecord = {
  id: number;
  issuedAt?: string | null;
  expiresAt?: string | null;
  completedAt?: string | null;
  certification?: CertificationRef | null;
  courseName?: string | null;
  providerName?: string | null;
  instructorName?: string | null;
  courseStandards?: string[];
  jurisdictionCode?: string | null;
  jurisdictionValid?: boolean | null;
  certificateQrToken?: string | null;
  certificateQrUrl?: string | null;
  certificateNumber?: string | null;
  complianceStatus?: string | null;
  companyName?: string | null;
  projectName?: string | null;
  verifiedByVeraStatus?:
    | "UNVERIFIED"
    | "PENDING"
    | "VERIFIED"
    | "VERIFIED_WITH_NFT";
  jurisdictionCoverage?: string[];
  regulatorySummary?: string | null;
  nftTokenId?: string | null;
  nftChain?: string | null;
};

export type Credential = {
  id: number;
  name?: string | null;
  value?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  certification?: CertificationRef | null;
};

export type EquipmentAssignment = {
  id: number;
  assignedAt?: string | null;
  endedAt?: string | null;
  equipment?: {
    id: number;
    name?: string | null;
    safetyStatus?: string | null;
    company?: CompanyRef | null;
  } | null;
};

export type ComplianceIssue = {
  type: string;
  courseName: string;
  expiresAt: string | null;
};

export type ComplianceSummary = {
  isCompliant?: boolean;
  issues?: ComplianceIssue[];
};

/** Shape returned by `GET /verify/worker/:id/full`. */
export type WorkerVerificationPayload = {
  worker: WorkerProfile & {
    equipmentAssignments?: EquipmentAssignment[];
    trainingRecords?: TrainingRecord[];
    credentials?: Credential[];
  };
  certifications: TrainingRecord[];
  credentials: Credential[];
  expiredCerts: TrainingRecord[];
  compliance?: ComplianceSummary;
};

export type VerificationLogResult = "SAFE" | "UNSAFE";

export type VerificationLogEntry = {
  id: number;
  result: VerificationLogResult;
  createdAt: string;
  worker?: { id: number; firstName?: string; lastName?: string } | null;
  equipment?: { id: number; name?: string } | null;
};

/** Loaded wallet bundle. `history` may be `null` if the caller lacks rights to logs. */
export type WorkerWalletData = {
  payload: WorkerVerificationPayload;
  history: VerificationLogEntry[] | null;
  historyError: string | null;
};

/** Public verification card (minimal fields, token or legacy id). */
export async function loadWorkerVerification(
  ref: string
): Promise<WorkerVerificationPayload> {
  return apiFetchJson<WorkerVerificationPayload>(
    `/verify/worker/${encodeURIComponent(ref)}`,
    { requireAuth: false },
  );
}

/** Offline-capable wallet bundle from worker-wallet API. */
export type WorkerWalletBundle = {
  syncedAt: string;
  workerId: number;
  offlineCapable?: boolean;
  qr?: {
    content?: string;
    verifyUrl?: string;
    qrToken?: string;
    workerId?: number;
  };
  training?: TrainingRecord[];
  readiness?: {
    score?: number;
    state?: string;
    isCompliant?: boolean;
    issues?: Array<{ type: string; message: string }>;
  } | null;
  projects?: Array<{
    projectId: number;
    projectName: string;
    projectCode?: string | null;
    companyId?: number;
    assignedAt?: string | null;
  }>;
  profile?: Record<string, unknown>;
};

export async function fetchWorkerWalletBundle(
  workerId: number,
): Promise<WorkerWalletBundle> {
  return apiFetchJson<WorkerWalletBundle>(
    `/api/v1/worker-wallet/bundle/${workerId}`,
    { cache: "no-store" },
  );
}

export async function validateBlockchainCredential(
  tokenId: string,
  trainingRecordId?: number,
): Promise<{ valid: boolean; message?: string; mintStatus?: string | null }> {
  const q = trainingRecordId ? `?trainingRecordId=${trainingRecordId}` : "";
  return apiFetchJson(
    `/api/v1/worker-wallet/blockchain/validate/${encodeURIComponent(tokenId)}${q}`,
    { requireAuth: false },
  );
}

/** Staff-only full wallet (requires sign-in). */
export async function loadWorkerVerificationFull(
  ref: string
): Promise<WorkerVerificationPayload> {
  return apiFetchJson<WorkerVerificationPayload>(
    `/verify/worker/${encodeURIComponent(ref)}/full`,
    { requireAuth: true },
  );
}

/** Verification activity logs (digital sign-offs). Requires ADMIN/SUPERVISOR. */
export async function loadVerificationHistory(
  id: number
): Promise<VerificationLogEntry[]> {
  return apiFetchJson<VerificationLogEntry[]>(
    `/verification/logs/worker/${id}`,
    { cache: "no-store" }
  );
}

/**
 * Loads the wallet payload + verification history concurrently. Returns a
 * {@link LoaderResult} so it can be passed straight to `useAsyncResource`.
 * History is tolerated to fail (e.g. WORKER role lacks log access) and is
 * reported via `historyError`; the caller can still render the rest of the
 * wallet.
 */
async function attachVerificationHistory(
  ref: string,
  payload: WorkerVerificationPayload,
): Promise<LoaderResult<WorkerWalletData>> {
  const numericId = /^\d+$/.test(ref.trim())
    ? Number(ref)
    : typeof payload.worker?.id === "number"
      ? payload.worker.id
      : null;

  const historyResult =
    numericId == null
      ? { ok: false as const, error: "History requires staff sign-in." }
      : await loadVerificationHistory(numericId).then(
          (rows) => ({ ok: true as const, rows }),
          (e: unknown) => ({
            ok: false as const,
            error: messageFromUnknown(e, "Could not load history."),
          }),
        );

  return {
    ok: true,
    data: {
      payload,
      history: historyResult.ok ? historyResult.rows : null,
      historyError: historyResult.ok ? null : historyResult.error,
    },
  };
}

/** Public verification card payload (no sign-in). */
export async function loadWorkerWallet(
  ref: string,
): Promise<LoaderResult<WorkerWalletData>> {
  let payload: WorkerVerificationPayload;
  try {
    payload = await loadWorkerVerification(ref);
  } catch (err) {
    return {
      ok: false,
      error: {
        kind: statusFromError(err),
        message: messageFromUnknown(err, "Could not load wallet."),
      },
    };
  }

  return attachVerificationHistory(ref, payload);
}

/** Authenticated staff hub at /wallet/[id] (full payload + history). */
export async function loadStaffWorkerWallet(
  ref: string,
): Promise<LoaderResult<WorkerWalletData>> {
  let payload: WorkerVerificationPayload;
  try {
    payload = await loadWorkerVerificationFull(ref);
  } catch (err) {
    return {
      ok: false,
      error: {
        kind: statusFromError(err),
        message: messageFromUnknown(err, "Could not load staff wallet."),
      },
    };
  }

  return attachVerificationHistory(ref, payload);
}
