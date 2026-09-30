/**
 * VERA Core — training record verification (`/api/v1/core/verification/...`).
 */
export {
  appendTrainingRecordVerificationSearchParams,
  completeTrainingVerification,
  fetchTrainingRecordVerification,
  fetchTrainingVerificationSnapshot,
  parseTrainingRecordVerificationOptionsFromSearchParams,
  VERIFICATION_INPUT_FIELDS,
  type CertificateNumberCheckResult,
  type CompletionStateCheckResult,
  type CredentialCoverageCheckResult,
  type ExpectedCompanyCheckResult,
  type ExpectedProviderCheckResult,
  type ExpiryCheckResult,
  type FetchTrainingRecordVerificationOptions,
  type ProviderCheckResult,
  type TrainingRecordOverallStatus,
  type TrainingRecordVerificationResult,
  type TrainingTypeCheckResult,
  type TrainingVerificationSnapshot,
  type ValidateTrainingRecordOptions,
  type VerificationCheckStatus,
  type WorkerIdentityCheckResult,
} from "@/lib/verification-core";
