import { ExpiryRuleEngine } from './expiry-rule.engine';
export interface CertificateValidationInput {
    certificateQrToken?: string | null;
    certificateNumber?: string | null;
    issuedAt: Date;
    expiresAt?: Date | null;
    recordExists: boolean;
}
export declare class CertificateValidationEngine {
    private readonly expiry;
    constructor(expiry: ExpiryRuleEngine);
    validate(input: CertificateValidationInput): {
        valid: boolean;
        reasonCode: "CERTIFICATE_INVALID";
        expiry: any;
    } | {
        valid: boolean;
        reasonCode: "CERTIFICATE_EXPIRED";
        expiry: import("./expiry-rule.engine").ExpiryCheckResult;
    } | {
        valid: boolean;
        reasonCode: any;
        expiry: import("./expiry-rule.engine").ExpiryCheckResult;
    };
}
