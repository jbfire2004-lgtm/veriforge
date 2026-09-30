/**
 * Mirrors `backend/src/verification/types/training-record-verification.types.ts`.
 * Prefer `@/src/api/core-verification` (or `@/lib/verification-core`) in app code.
 */

export type VerificationCheckStatus = "PASS" | "WARN" | "FAIL";

/** Aggregate outcome from `validateTrainingRecord()` (not the same as per-check PASS/WARN/FAIL). */
export type TrainingRecordOverallStatus =
  | "VERIFIED"
  | "ATTENTION"
  | "INVALID";

export type CoreVerificationOverallStatus = TrainingRecordOverallStatus;

/** Query/programmatic inputs for Core training verification (mirrors backend). */
export type ValidateTrainingRecordOptions = {
  expectedWorkerId?: number;
  expectedTrainingType?: string;
  expectedCertificateNumber?: string;
  expectedProvider?: string;
};

export interface ExpiryCheckResult {
  readonly check: "expiry";
  status: VerificationCheckStatus;
  issuedAt: string;
  expiresAt: string | null;
  daysUntilExpiry: number | null;
  message: string;
}

export interface ProviderCheckResult {
  readonly check: "provider";
  status: VerificationCheckStatus;
  providerId: number | null;
  providerName: string | null;
  message: string;
}

export interface ExpectedProviderCheckResult {
  readonly check: "expectedProvider";
  status: VerificationCheckStatus;
  recordProviderId: number | null;
  recordProviderName: string | null;
  expectedProviderName: string | null;
  message: string;
}

export interface WorkerIdentityCheckResult {
  readonly check: "workerIdentity";
  status: VerificationCheckStatus;
  workerId: number;
  workerName: string;
  workerStatus: string;
  companyId: number | null;
  companyName: string | null;
  expectedWorkerId: number | null;
  message: string;
}

export interface TrainingTypeCheckResult {
  readonly check: "trainingType";
  status: VerificationCheckStatus;
  recordName: string;
  recordCode: string | null;
  expectedTrainingType: string | null;
  message: string;
}

export interface CertificateNumberCheckResult {
  readonly check: "certificateNumber";
  status: VerificationCheckStatus;
  hasCertificateNumber: boolean;
  expectedCertificateNumber: string | null;
  message: string;
}

export interface CoreTrainingRecordVerificationResponse {
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
  };
  checks: {
    expiry: ExpiryCheckResult;
    provider: ProviderCheckResult;
    expectedProvider: ExpectedProviderCheckResult;
    workerIdentity: WorkerIdentityCheckResult;
    trainingType: TrainingTypeCheckResult;
    certificateNumber: CertificateNumberCheckResult;
  };
  summary: string[];
  verifiedAt: string;
}
