export type VerificationCheckStatus = 'PASS' | 'WARN' | 'FAIL';
export type TrainingRecordOverallStatus = 'VERIFIED' | 'ATTENTION' | 'INVALID';
export interface ExpiryCheckResult {
    readonly check: 'expiry';
    status: VerificationCheckStatus;
    issuedAt: string;
    expiresAt: string | null;
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
export interface ExpectedCompanyCheckResult {
    readonly check: 'expectedCompany';
    status: VerificationCheckStatus;
    recordCompanyId: number | null;
    expectedCompanyId: number | null;
    message: string;
}
export interface CredentialCoverageCheckResult {
    readonly check: 'credentialCoverage';
    status: VerificationCheckStatus;
    matchingCredentialCount: number;
    validCredentialCount: number;
    message: string;
}
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
export type ValidateTrainingRecordOptions = {
    expectedWorkerId?: number;
    expectedCompanyId?: number;
    expectedTrainingType?: string;
    expectedCertificateNumber?: string;
    expectedProvider?: string;
};
export type CoreTrainingRecordVerificationResponse = TrainingRecordVerificationResult;
