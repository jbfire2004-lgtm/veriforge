import { Injectable } from '@nestjs/common';
import { ExpiryRuleEngine } from './expiry-rule.engine';

export interface CertificateValidationInput {
  certificateQrToken?: string | null;
  certificateNumber?: string | null;
  issuedAt: Date;
  expiresAt?: Date | null;
  recordExists: boolean;
}

@Injectable()
export class CertificateValidationEngine {
  constructor(private readonly expiry: ExpiryRuleEngine) {}

  validate(input: CertificateValidationInput) {
    if (!input.recordExists) {
      return {
        valid: false,
        reasonCode: 'CERTIFICATE_INVALID' as const,
        expiry: null,
      };
    }
    if (!input.certificateQrToken && !input.certificateNumber) {
      return {
        valid: false,
        reasonCode: 'CERTIFICATE_INVALID' as const,
        expiry: null,
      };
    }

    const expiry = this.expiry.check({
      issuedAt: input.issuedAt,
      expiresAt: input.expiresAt,
    });

    if (expiry.expired) {
      return {
        valid: false,
        reasonCode: 'CERTIFICATE_EXPIRED' as const,
        expiry,
      };
    }

    return {
      valid: true,
      reasonCode: undefined,
      expiry,
    };
  }
}
