import { API_URL } from "./api";
import { fetchJson } from "./core";

/** Mirrors backend `training-record-verification.types.ts` */
export type VerificationCheckStatus = "PASS" | "WARN" | "FAIL";

export type TrainingRecordOverallStatus =
  | "VERIFIED"
  | "ATTENTION"
  | "INVALID";

export type ExpiryCheckResult = {
  readonly check: "expiry";
  status: VerificationCheckStatus;
  issuedAt: string;
  expiresAt: string | null;
  daysUntilExpiry: number | null;
  message: string;
};

export type ProviderCheckResult = {
  readonly check: "provider";
  status: VerificationCheckStatus;
  providerId: number | null;
  providerName: string | null;
  message: string;
};

export type ExpectedProviderCheckResult = {
  readonly check: "expectedProvider";
  status: VerificationCheckStatus;
  recordProviderId: number | null;
  recordProviderName: string | null;
  expectedProviderName: string | null;
  message: string;
};

export type WorkerIdentityCheckResult = {
  readonly check: "workerIdentity";
  status: VerificationCheckStatus;
  workerId: number;
  workerName: string;
  workerStatus: string;
  companyId: number | null;
  companyName: string | null;
  expectedWorkerId: number | null;
  message: string;
};

export type ExpectedCompanyCheckResult = {
  readonly check: "expectedCompany";
  status: VerificationCheckStatus;
  recordCompanyId: number | null;
  expectedCompanyId: number | null;
  message: string;
};

export type CredentialCoverageCheckResult = {
  readonly check: "credentialCoverage";
  status: VerificationCheckStatus;
  matchingCredentialCount: number;
  validCredentialCount: number;
  message: string;
};

export type CompletionStateCheckResult = {
  readonly check: "completionState";
  status: VerificationCheckStatus;
  alreadyCompleted: boolean;
  completedAt: string | null;
  message: string;
};

export type TrainingTypeCheckResult = {
  readonly check: "trainingType";
  status: VerificationCheckStatus;
  recordName: string;
  recordCode: string | null;
  expectedTrainingType: string | null;
  message: string;
};

export type CertificateNumberCheckResult = {
  readonly check: "certificateNumber";
  status: VerificationCheckStatus;
  hasCertificateNumber: boolean;
  expectedCertificateNumber: string | null;
  message: string;
};

export type TrainingRecordVerificationResult = {
  trainingRecordId: number;
  overallStatus: TrainingRecordOverallStatus;
  certification: {
    id: number;
    name: string;
    code: string | null;
  };
  worker: {
    id: number;
    firstName: string;
    lastName: string;
    companyId: number | null;
    companyName: string | null;
  };
  checks: {
    expiry: ExpiryCheckResult;
    provider: ProviderCheckResult;
    expectedProvider: ExpectedProviderCheckResult;
    workerIdentity: WorkerIdentityCheckResult;
    expectedCompany: ExpectedCompanyCheckResult;
    trainingType: TrainingTypeCheckResult;
    certificateNumber: CertificateNumberCheckResult;
    credentialCoverage: CredentialCoverageCheckResult;
    completionState: CompletionStateCheckResult;
  };
  summary: string[];
  verifiedAt: string;
};

export type FetchTrainingRecordVerificationOptions = {
  expectedWorkerId?: number;
  expectedCompanyId?: number;
  expectedTrainingType?: string;
  expectedCertificateNumber?: string;
  expectedProvider?: string;
};

/** Same shape as backend `ValidateTrainingRecordOptions`. */
export type ValidateTrainingRecordOptions =
  FetchTrainingRecordVerificationOptions;

/** Append Core training verification query params to `url` (same rules as the API). */
export function appendTrainingRecordVerificationSearchParams(
  url: URL,
  options?: FetchTrainingRecordVerificationOptions
): void {
  if (options?.expectedWorkerId != null) {
    url.searchParams.set("expectedWorkerId", String(options.expectedWorkerId));
  }
  if (options?.expectedCompanyId != null) {
    url.searchParams.set("expectedCompanyId", String(options.expectedCompanyId));
  }
  if (
    options?.expectedTrainingType != null &&
    options.expectedTrainingType !== ""
  ) {
    url.searchParams.set("expectedTrainingType", options.expectedTrainingType);
  }
  if (
    options?.expectedCertificateNumber != null &&
    options.expectedCertificateNumber !== ""
  ) {
    url.searchParams.set(
      "expectedCertificateNumber",
      options.expectedCertificateNumber
    );
  }
  if (options?.expectedProvider != null && options.expectedProvider !== "") {
    url.searchParams.set("expectedProvider", options.expectedProvider);
  }
}

/**
 * Parse Next/router-style search params into fetch options.
 * Returns `error` when `expectedWorkerId` is present but not an integer.
 */
export function parseTrainingRecordVerificationOptionsFromSearchParams(
  search: URLSearchParams
): {
  options: FetchTrainingRecordVerificationOptions;
  error: string | null;
} {
  const expectedFromQuery = search.get("expectedWorkerId");
  const expectedCompanyFromQuery = search.get("expectedCompanyId");
  const expectedTrainingType =
    search.get("expectedTrainingType") ?? undefined;
  const expectedCertificateNumber =
    search.get("expectedCertificateNumber") ?? undefined;
  const expectedProvider = search.get("expectedProvider") ?? undefined;

  let expectedWorkerId: number | undefined;
  if (expectedFromQuery != null && expectedFromQuery !== "") {
    if (!/^\d+$/.test(expectedFromQuery)) {
      return {
        options: {},
        error: "expectedWorkerId must be a positive integer.",
      };
    }
    const w = Number(expectedFromQuery);
    if (!Number.isSafeInteger(w) || w < 1) {
      return {
        options: {},
        error: "expectedWorkerId must be a positive integer.",
      };
    }
    expectedWorkerId = w;
  }

  let expectedCompanyId: number | undefined;
  if (expectedCompanyFromQuery != null && expectedCompanyFromQuery !== "") {
    if (!/^\d+$/.test(expectedCompanyFromQuery)) {
      return {
        options: {},
        error: "expectedCompanyId must be a positive integer.",
      };
    }
    const c = Number(expectedCompanyFromQuery);
    if (!Number.isSafeInteger(c) || c < 1) {
      return {
        options: {},
        error: "expectedCompanyId must be a positive integer.",
      };
    }
    expectedCompanyId = c;
  }

  const options: FetchTrainingRecordVerificationOptions = {};
  if (expectedWorkerId !== undefined) {
    options.expectedWorkerId = expectedWorkerId;
  }
  if (expectedCompanyId !== undefined) {
    options.expectedCompanyId = expectedCompanyId;
  }
  if (expectedTrainingType !== undefined) {
    options.expectedTrainingType = expectedTrainingType;
  }
  if (expectedCertificateNumber !== undefined) {
    options.expectedCertificateNumber = expectedCertificateNumber;
  }
  if (expectedProvider !== undefined) {
    options.expectedProvider = expectedProvider;
  }

  return { options, error: null };
}

/** Query: optional expectedWorkerId, expectedTrainingType, expectedCertificateNumber, expectedProvider */
export async function fetchTrainingRecordVerification(
  trainingRecordId: number,
  options?: FetchTrainingRecordVerificationOptions
): Promise<TrainingRecordVerificationResult> {
  const u = new URL(
    `${API_URL}/api/v1/core/verification/training/${trainingRecordId}`
  );
  appendTrainingRecordVerificationSearchParams(u, options);
  return fetchJson<TrainingRecordVerificationResult>(u.toString(), {
    cache: "no-store",
    credentials: "include",
  });
}

export async function completeTrainingVerification(
  trainingRecordId: number
): Promise<{ ok: true }> {
  return fetchJson<{ ok: true }>(
    `${API_URL}/api/v1/core/verification/training/${trainingRecordId}/complete`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );
}

export type TrainingVerificationSnapshot = {
  trainingRecordId: number;
  lastVerificationStatus: string | null;
  lastVerificationChecks: unknown;
  verifiedAt: string | null;
  completedAt: string | null;
  credentialNft: {
    id: number;
    mintStatus: string;
    nftTokenId: string | null;
    chain: string;
    mintedAt: string | null;
  } | null;
  latestMintJob: {
    id: number;
    status: string;
    lastError: string | null;
    createdAt: string;
  } | null;
};

export async function fetchTrainingVerificationSnapshot(trainingRecordId: number) {
  return fetchJson<TrainingVerificationSnapshot>(
    `${API_URL}/api/v1/core/verification/training/${trainingRecordId}/snapshot`,
    { credentials: "include", cache: "no-store" },
  );
}

export const VERIFICATION_INPUT_FIELDS = [
  "trainingRecordId (hub query or path — required)",
  "relatedRecordIds (hub query, optional — comma-separated from ingest hand-off)",
  "expectedWorkerId (query, optional — must match the record’s worker or identity check fails)",
  "expectedCompanyId (query, optional — worker’s employer must match)",
  "expectedTrainingType (query, optional — certification code or name)",
  "expectedCertificateNumber (query, optional — must match stored certificate number)",
  "expectedProvider (query, optional — must match linked provider name)",
] as const;
