import type { NetworkContextInput, PrivacyEnvelope } from "../types";
export declare class PrivacySecurityLayer {
    envelope(ctx: NetworkContextInput): PrivacyEnvelope;
    sanitizeCompanyData<T extends Record<string, unknown>>(data: T): T;
}
//# sourceMappingURL=privacy-security.d.ts.map