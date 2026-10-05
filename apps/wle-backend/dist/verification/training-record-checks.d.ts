import type { CertificateNumberCheckResult, CompletionStateCheckResult, CredentialCoverageCheckResult, ExpectedCompanyCheckResult, ExpectedProviderCheckResult, ExpiryCheckResult, ProviderCheckResult, TrainingRecordOverallStatus, TrainingRecordVerificationResult, TrainingTypeCheckResult, WorkerIdentityCheckResult } from './types/training-record-verification.types';
export declare const TRAINING_RECORD_EXPIRING_SOON_DAYS = 30;
export declare function checkExpiry(tr: {
    issuedAt: Date;
    expiresAt: Date | null;
}): ExpiryCheckResult;
export declare function checkProvider(tr: {
    providerId: number | null;
    provider: {
        id: number;
        name: string;
    } | null;
}): ProviderCheckResult;
export declare function checkExpectedProvider(tr: {
    providerId: number | null;
    provider: {
        id: number;
        name: string;
    } | null;
}, options?: {
    expectedProvider?: string;
}): ExpectedProviderCheckResult;
export declare function checkExpectedCompany(tr: {
    worker: {
        companyId: number | null;
    };
}, options?: {
    expectedCompanyId?: number;
}): ExpectedCompanyCheckResult;
export type CredentialCoverageInput = {
    id: number;
    certificationId: number | null;
    name: string;
    expiresAt: Date | null;
    issuedAt: Date;
    certification: {
        id: number;
        name: string;
    } | null;
};
export declare function checkCredentialCoverage(credentials: CredentialCoverageInput[], certificationId: number, certificationName: string): CredentialCoverageCheckResult;
export declare function checkCompletionState(tr: {
    completedAt: Date | null;
}): CompletionStateCheckResult;
export declare function checkWorkerIdentity(tr: {
    workerId: number;
    worker: {
        id: number;
        firstName: string;
        lastName: string;
        status: string;
        companyId: number | null;
        company: {
            id: number;
            name: string;
        } | null;
    };
}, options?: {
    expectedWorkerId?: number;
}): WorkerIdentityCheckResult;
export declare const CERTIFICATE_NUMBER_PATTERN: RegExp;
export declare const CERTIFICATE_NUMBER_PATTERN_SHORT: RegExp;
export declare function checkTrainingType(certification: {
    name: string;
    code: string | null;
}, options?: {
    expectedTrainingType?: string;
}): TrainingTypeCheckResult;
export declare function checkCertificateNumber(tr: {
    certificateNumber: string | null;
}, options?: {
    expectedCertificateNumber?: string;
}): CertificateNumberCheckResult;
export declare function aggregateTrainingRecordOverallStatus(checks: TrainingRecordVerificationResult['checks']): TrainingRecordOverallStatus;
export declare function buildTrainingRecordVerificationSummary(checks: TrainingRecordVerificationResult['checks']): string[];
