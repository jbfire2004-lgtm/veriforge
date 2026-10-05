export interface ExpiryCheckInput {
    issuedAt: Date;
    expiresAt?: Date | null;
    maxValidityDays?: number | null;
    standardDefaultDays?: number | null;
}
export interface ExpiryCheckResult {
    valid: boolean;
    expired: boolean;
    exceedsMaxValidity: boolean;
    daysUntilExpiry: number | null;
    message?: string;
}
export declare class ExpiryRuleEngine {
    check(input: ExpiryCheckInput, now?: Date): ExpiryCheckResult;
}
