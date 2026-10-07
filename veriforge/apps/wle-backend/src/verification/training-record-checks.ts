/**
 * VERA Core — pure training-record checks (no Prisma).
 * Used by {@link VerificationService.validateTrainingRecord}.
 */

import type {
  CertificateNumberCheckResult,
  CompletionStateCheckResult,
  CredentialCoverageCheckResult,
  ExpectedCompanyCheckResult,
  ExpectedProviderCheckResult,
  ExpiryCheckResult,
  ProviderCheckResult,
  TrainingRecordOverallStatus,
  TrainingRecordVerificationResult,
  TrainingTypeCheckResult,
  VerificationCheckStatus,
  WorkerIdentityCheckResult,
} from './types/training-record-verification.types';

/** Days until expiry that trigger a WARN (not yet FAIL). */
export const TRAINING_RECORD_EXPIRING_SOON_DAYS = 30;

export function checkExpiry(tr: {
  issuedAt: Date;
  expiresAt: Date | null;
}): ExpiryCheckResult {
  const now = new Date();
  const issuedAtIso = tr.issuedAt.toISOString();

  if (tr.issuedAt.getTime() > now.getTime()) {
    return {
      check: 'expiry',
      status: 'WARN',
      issuedAt: issuedAtIso,
      expiresAt: tr.expiresAt?.toISOString() ?? null,
      daysUntilExpiry: null,
      message: 'issuedAt is in the future — verify source data',
    };
  }

  if (tr.expiresAt == null) {
    return {
      check: 'expiry',
      status: 'WARN',
      issuedAt: issuedAtIso,
      expiresAt: null,
      daysUntilExpiry: null,
      message: 'No expiry date on record (open-ended certification)',
    };
  }

  const exp = tr.expiresAt;
  const expIso = exp.toISOString();
  const diffMs = exp.getTime() - now.getTime();
  const daysUntilExpiry = Math.floor(diffMs / 86400000);

  if (diffMs < 0) {
    return {
      check: 'expiry',
      status: 'FAIL',
      issuedAt: issuedAtIso,
      expiresAt: expIso,
      daysUntilExpiry,
      message: 'Training is expired',
    };
  }

  if (daysUntilExpiry <= TRAINING_RECORD_EXPIRING_SOON_DAYS) {
    return {
      check: 'expiry',
      status: 'WARN',
      issuedAt: issuedAtIso,
      expiresAt: expIso,
      daysUntilExpiry,
      message: `Expires within ${TRAINING_RECORD_EXPIRING_SOON_DAYS} days`,
    };
  }

  return {
    check: 'expiry',
    status: 'PASS',
    issuedAt: issuedAtIso,
    expiresAt: expIso,
    daysUntilExpiry,
    message: 'Expiry date is valid',
  };
}

export function checkProvider(tr: {
  providerId: number | null;
  provider: { id: number; name: string } | null;
}): ProviderCheckResult {
  if (tr.providerId == null) {
    return {
      check: 'provider',
      status: 'WARN',
      providerId: null,
      providerName: null,
      message: 'No training provider on file',
    };
  }
  if (!tr.provider) {
    return {
      check: 'provider',
      status: 'FAIL',
      providerId: tr.providerId,
      providerName: null,
      message: 'Provider id is set but provider record is missing',
    };
  }
  return {
    check: 'provider',
    status: 'PASS',
    providerId: tr.provider.id,
    providerName: tr.provider.name,
    message: 'Provider is registered',
  };
}

function normalizeProviderLabel(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Optional cross-check: when `expectedProvider` is set, it must match the linked provider’s name.
 * When omitted, PASS (informational only — use {@link checkProvider} for registry presence).
 */
export function checkExpectedProvider(
  tr: {
    providerId: number | null;
    provider: { id: number; name: string } | null;
  },
  options?: { expectedProvider?: string },
): ExpectedProviderCheckResult {
  const recordId = tr.provider?.id ?? tr.providerId ?? null;
  const recordName = tr.provider?.name ?? null;
  const raw = options?.expectedProvider;
  const expected =
    raw == null || raw.trim() === '' ? null : normalizeProviderLabel(raw);

  if (expected == null) {
    return {
      check: 'expectedProvider',
      status: 'PASS',
      recordProviderId: recordId,
      recordProviderName: recordName,
      expectedProviderName: null,
      message: recordName
        ? `Expected provider not supplied; on file: ${recordName}`
        : 'Expected provider not supplied; no issuer name to compare',
    };
  }

  if (tr.providerId == null || !tr.provider) {
    return {
      check: 'expectedProvider',
      status: 'FAIL',
      recordProviderId: recordId,
      recordProviderName: recordName,
      expectedProviderName: raw!.trim(),
      message:
        'Cannot match expected provider — no training provider linked to this record',
    };
  }

  const onFile = normalizeProviderLabel(tr.provider.name);
  if (onFile !== expected) {
    return {
      check: 'expectedProvider',
      status: 'FAIL',
      recordProviderId: tr.provider.id,
      recordProviderName: tr.provider.name,
      expectedProviderName: raw!.trim(),
      message: `Expected issuer "${raw!.trim()}" does not match provider on file`,
    };
  }

  return {
    check: 'expectedProvider',
    status: 'PASS',
    recordProviderId: tr.provider.id,
    recordProviderName: tr.provider.name,
    expectedProviderName: raw!.trim(),
    message: 'Expected provider matches linked training provider',
  };
}

export function checkExpectedCompany(
  tr: { worker: { companyId: number | null } },
  options?: { expectedCompanyId?: number },
): ExpectedCompanyCheckResult {
  const recordId = tr.worker.companyId;
  const expected = options?.expectedCompanyId;

  if (expected == null) {
    return {
      check: 'expectedCompany',
      status: 'PASS',
      recordCompanyId: recordId,
      expectedCompanyId: null,
      message:
        recordId != null
          ? `Worker company id ${recordId} (no expectedCompanyId query to enforce)`
          : 'Worker has no company; expectedCompanyId not supplied',
    };
  }

  if (recordId == null) {
    return {
      check: 'expectedCompany',
      status: 'FAIL',
      recordCompanyId: null,
      expectedCompanyId: expected,
      message:
        'Worker has no company assignment; cannot match expectedCompanyId',
    };
  }

  if (recordId !== expected) {
    return {
      check: 'expectedCompany',
      status: 'FAIL',
      recordCompanyId: recordId,
      expectedCompanyId: expected,
      message: `Worker belongs to company ${recordId} but expected ${expected}`,
    };
  }

  return {
    check: 'expectedCompany',
    status: 'PASS',
    recordCompanyId: recordId,
    expectedCompanyId: expected,
    message: 'Worker company matches expectedCompanyId',
  };
}

export type CredentialCoverageInput = {
  id: number;
  certificationId: number | null;
  name: string;
  expiresAt: Date | null;
  issuedAt: Date;
  certification: { id: number; name: string } | null;
};

/**
 * Cross-check digitized credentials for the same certification as the training record.
 * - No matching rows → WARN (card may exist only on paper).
 * - Matching but all expired → FAIL.
 * - At least one non-expired match → PASS.
 */
export function checkCredentialCoverage(
  credentials: CredentialCoverageInput[],
  certificationId: number,
  certificationName: string,
): CredentialCoverageCheckResult {
  const now = new Date();
  const nameNorm = certificationName.trim().toLowerCase();

  const relevant = credentials.filter((c) => {
    if (c.certificationId === certificationId) return true;
    if (c.certification?.id === certificationId) return true;
    if (c.certificationId == null && c.certification == null) {
      return c.name.trim().toLowerCase() === nameNorm;
    }
    return false;
  });

  if (relevant.length === 0) {
    return {
      check: 'credentialCoverage',
      status: 'WARN',
      matchingCredentialCount: 0,
      validCredentialCount: 0,
      message:
        'No digitized credential linked to this certification for the worker',
    };
  }

  const valid = relevant.filter(
    (c) => !c.expiresAt || c.expiresAt.getTime() > now.getTime(),
  );

  if (valid.length === 0) {
    return {
      check: 'credentialCoverage',
      status: 'FAIL',
      matchingCredentialCount: relevant.length,
      validCredentialCount: 0,
      message: 'Digitized credential(s) for this certification are expired',
    };
  }

  return {
    check: 'credentialCoverage',
    status: 'PASS',
    matchingCredentialCount: relevant.length,
    validCredentialCount: valid.length,
    message: `Found ${valid.length} non-expired credential row(s) for this certification`,
  };
}

export function checkCompletionState(tr: {
  completedAt: Date | null;
}): CompletionStateCheckResult {
  if (tr.completedAt != null) {
    return {
      check: 'completionState',
      status: 'WARN',
      alreadyCompleted: true,
      completedAt: tr.completedAt.toISOString(),
      message:
        'Training record was already marked complete (prior sign-off / attestation)',
    };
  }
  return {
    check: 'completionState',
    status: 'PASS',
    alreadyCompleted: false,
    completedAt: null,
    message: 'Training record is not yet marked complete',
  };
}

export function checkWorkerIdentity(
  tr: {
    workerId: number;
    worker: {
      id: number;
      firstName: string;
      lastName: string;
      status: string;
      companyId: number | null;
      company: { id: number; name: string } | null;
    };
  },
  options?: { expectedWorkerId?: number },
): WorkerIdentityCheckResult {
  const w = tr.worker;
  const name = `${w.firstName} ${w.lastName}`.trim();
  const expected = options?.expectedWorkerId;

  if (expected != null && expected !== w.id) {
    return {
      check: 'workerIdentity',
      status: 'FAIL',
      workerId: w.id,
      workerName: name,
      workerStatus: w.status,
      companyId: w.companyId,
      companyName: w.company?.name ?? null,
      expectedWorkerId: expected,
      message: `Record is for worker ${w.id} but expected ${expected}`,
    };
  }

  const active =
    typeof w.status === 'string' && w.status.toUpperCase() === 'ACTIVE';

  if (!active) {
    return {
      check: 'workerIdentity',
      status: 'FAIL',
      workerId: w.id,
      workerName: name,
      workerStatus: w.status,
      companyId: w.companyId,
      companyName: w.company?.name ?? null,
      expectedWorkerId: expected ?? null,
      message: `Worker is not active (status=${w.status})`,
    };
  }

  if (w.companyId == null) {
    return {
      check: 'workerIdentity',
      status: 'WARN',
      workerId: w.id,
      workerName: name,
      workerStatus: w.status,
      companyId: null,
      companyName: null,
      expectedWorkerId: expected ?? null,
      message: 'Worker has no company assignment',
    };
  }

  return {
    check: 'workerIdentity',
    status: 'PASS',
    workerId: w.id,
    workerName: name,
    workerStatus: w.status,
    companyId: w.companyId,
    companyName: w.company?.name ?? null,
    expectedWorkerId: expected ?? null,
    message: 'Worker identity matches active assignment',
  };
}

/** Allowed characters for a stored certificate / credential number (after trim). */
export const CERTIFICATE_NUMBER_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9\s\-\/#.,]{1,126}[A-Za-z0-9]$/;
/** Single-char / two-char alphanumeric references */
export const CERTIFICATE_NUMBER_PATTERN_SHORT = /^[A-Za-z0-9]{1,2}$/;

export function checkTrainingType(
  certification: { name: string; code: string | null },
  options?: { expectedTrainingType?: string },
): TrainingTypeCheckResult {
  const recordName = certification.name;
  const recordCode = certification.code ?? null;
  const raw = options?.expectedTrainingType;
  const expected =
    raw == null || raw.trim() === '' ? null : raw.trim().toLowerCase();

  if (expected == null) {
    return {
      check: 'trainingType',
      status: 'PASS',
      recordName,
      recordCode,
      expectedTrainingType: null,
      message: `Training type on record: ${recordName}${
        recordCode ? ` (${recordCode})` : ''
      }`,
    };
  }

  const nameMatch = recordName.trim().toLowerCase() === expected;
  const codeMatch =
    recordCode != null && recordCode.trim().toLowerCase() === expected;

  if (nameMatch || codeMatch) {
    return {
      check: 'trainingType',
      status: 'PASS',
      recordName,
      recordCode,
      expectedTrainingType: raw!.trim(),
      message: 'Expected training type matches linked certification',
    };
  }

  return {
    check: 'trainingType',
    status: 'FAIL',
    recordName,
    recordCode,
    expectedTrainingType: raw!.trim(),
    message: `Expected "${raw!.trim()}" does not match certification name or code`,
  };
}

export function checkCertificateNumber(
  tr: { certificateNumber: string | null },
  options?: { expectedCertificateNumber?: string },
): CertificateNumberCheckResult {
  const storedRaw = tr.certificateNumber;
  const stored =
    storedRaw == null || storedRaw.trim() === '' ? null : storedRaw.trim();
  const expRaw = options?.expectedCertificateNumber;
  const expected =
    expRaw == null || expRaw.trim() === '' ? null : expRaw.trim();

  const formatOk = (value: string): boolean => {
    if (value.length < 1 || value.length > 128) return false;
    if (
      CERTIFICATE_NUMBER_PATTERN_SHORT.test(value) ||
      CERTIFICATE_NUMBER_PATTERN.test(value)
    ) {
      return true;
    }
    return false;
  };

  if (stored == null) {
    if (expected != null) {
      return {
        check: 'certificateNumber',
        status: 'FAIL',
        hasCertificateNumber: false,
        expectedCertificateNumber: expected,
        message: 'No certificate number on record; cannot match expected value',
      };
    }
    return {
      check: 'certificateNumber',
      status: 'WARN',
      hasCertificateNumber: false,
      expectedCertificateNumber: null,
      message: 'No certificate number stored for this record',
    };
  }

  if (!formatOk(stored)) {
    return {
      check: 'certificateNumber',
      status: 'FAIL',
      hasCertificateNumber: true,
      expectedCertificateNumber: expected,
      message: 'Certificate number format is invalid',
    };
  }

  if (expected != null && stored !== expected) {
    return {
      check: 'certificateNumber',
      status: 'FAIL',
      hasCertificateNumber: true,
      expectedCertificateNumber: expected,
      message: 'Certificate number does not match expected value',
    };
  }

  if (expected != null) {
    return {
      check: 'certificateNumber',
      status: 'PASS',
      hasCertificateNumber: true,
      expectedCertificateNumber: expected,
      message: 'Certificate number matches expected value',
    };
  }

  return {
    check: 'certificateNumber',
    status: 'PASS',
    hasCertificateNumber: true,
    expectedCertificateNumber: null,
    message: 'Certificate number is present and well-formed',
  };
}

export function aggregateTrainingRecordOverallStatus(
  checks: TrainingRecordVerificationResult['checks'],
): TrainingRecordOverallStatus {
  const list = [
    checks.expiry,
    checks.provider,
    checks.expectedProvider,
    checks.workerIdentity,
    checks.expectedCompany,
    checks.trainingType,
    checks.certificateNumber,
    checks.credentialCoverage,
    checks.completionState,
  ];
  if (list.some((c) => c.status === 'FAIL')) {
    return 'INVALID';
  }
  if (list.some((c) => c.status === 'WARN')) {
    return 'ATTENTION';
  }
  return 'VERIFIED';
}

export function buildTrainingRecordVerificationSummary(
  checks: TrainingRecordVerificationResult['checks'],
): string[] {
  const summary: string[] = [];
  const append = (status: VerificationCheckStatus, msg: string) => {
    const prefix = status === 'FAIL' ? '✗' : status === 'WARN' ? '!' : '✓';
    summary.push(`${prefix} ${msg}`);
  };
  append(checks.expiry.status, checks.expiry.message);
  append(checks.provider.status, checks.provider.message);
  append(checks.expectedProvider.status, checks.expectedProvider.message);
  append(checks.workerIdentity.status, checks.workerIdentity.message);
  append(checks.expectedCompany.status, checks.expectedCompany.message);
  append(checks.trainingType.status, checks.trainingType.message);
  append(checks.certificateNumber.status, checks.certificateNumber.message);
  append(checks.credentialCoverage.status, checks.credentialCoverage.message);
  append(checks.completionState.status, checks.completionState.message);
  return summary;
}
