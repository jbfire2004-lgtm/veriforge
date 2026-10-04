/**
 * VERA Core — training record verification API.
 *
 * **Inputs (HTTP):**
 * - `trainingRecordId` — path param `:id` on `GET /api/v1/core/verification/training/:id`
 * - `expectedWorkerId` — optional query; identity check fails when it does not match
 * - `expectedTrainingType` — optional; certification **code** or **name** must match (case-insensitive)
 * - `expectedCertificateNumber` — optional; must equal the stored certificate number (after trim)
 * - `expectedProvider` — optional; linked **provider name** must match (case-insensitive, trimmed)
 * - `expectedCompanyId` — optional; worker’s `companyId` must match (tenant / QR hardening)
 *
 * **Checks:** expiry, provider, expected provider, worker identity, expected company, training type,
 * certificate number, digitized credential coverage, prior completion state (`training-record-checks.ts`).
 */

export type VerificationCheckStatus = 'PASS' | 'WARN' | 'FAIL';

export type TrainingRecordOverallStatus = 'VERIFIED' | 'ATTENTION' | 'INVALID';

export interface ExpiryCheckResult {
  readonly check: 'expiry';
  status: VerificationCheckStatus;
  issuedAt: string;
  expiresAt: string | null;
  /** Calendar days; negative if expired */
  daysUntilExpiry: number | null;
  message: string;
}

export interface ProviderCheckResult {
  readonly check: 'provider';
  status: VerificationCheckStatus;
  providerId: number | null;
  providerName: string | null;
  message: string;
}

/** Cross-check of an external / scanned issuer name against the linked provider row. */
export interface ExpectedProviderCheckResult {
  readonly check: 'expectedProvider';
  status: VerificationCheckStatus;
  recordProviderId: number | null;
  recordProviderName: string | null;
  expectedProviderName: string | null;
  message: string;
}

export interface WorkerIdentityCheckResult {
  readonly check: 'workerIdentity';
  status: VerificationCheckStatus;
  workerId: number;
  workerName: string;
  workerStatus: string;
  companyId: number | null;
  companyName: string | null;
  expectedWorkerId: number | null;
  message: string;
}

/** Optional kiosk / QR hardening: caller-supplied company must match the worker’s employer. */
export interface ExpectedCompanyCheckResult {
  readonly check: 'expectedCompany';
  status: VerificationCheckStatus;
  recordCompanyId: number | null;
  expectedCompanyId: number | null;
  message: string;
}

/** Whether a digitized {@link Credential} row exists for this certification and is still valid. */
export interface CredentialCoverageCheckResult {
  readonly check: 'credentialCoverage';
  status: VerificationCheckStatus;
  matchingCredentialCount: number;
  validCredentialCount: number;
  message: string;
}

/** Whether the record was already signed off via Core “complete”. */
export interface CompletionStateCheckResult {
  readonly check: 'completionState';
  status: VerificationCheckStatus;
  alreadyCompleted: boolean;
  completedAt: string | null;
  message: string;
}

export interface TrainingTypeCheckResult {
  readonly check: 'trainingType';
  status: VerificationCheckStatus;
  recordName: string;
  recordCode: string | null;
  expectedTrainingType: string | null;
  message: string;
}

export interface CertificateNumberCheckResult {
  readonly check: 'certificateNumber';
  status: VerificationCheckStatus;
  hasCertificateNumber: boolean;
  expectedCertificateNumber: string | null;
  message: string;
}

export interface TrainingRecordVerificationResult {
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
}

/** Options for {@link VerificationService.validateTrainingRecord} (query or programmatic). */
export type ValidateTrainingRecordOptions = {
  expectedWorkerId?: number;
  expectedCompanyId?: number;
  expectedTrainingType?: string;
  expectedCertificateNumber?: string;
  expectedProvider?: string;
};

/** @deprecated use {@link TrainingRecordVerificationResult} */
export type CoreTrainingRecordVerificationResponse =
  TrainingRecordVerificationResult;
