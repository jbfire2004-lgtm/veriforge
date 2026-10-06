import { Injectable } from '@nestjs/common';

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

@Injectable()
export class ExpiryRuleEngine {
  check(input: ExpiryCheckInput, now = new Date()): ExpiryCheckResult {
    const expired = input.expiresAt ? input.expiresAt < now : false;
    let exceedsMaxValidity = false;

    if (input.expiresAt && input.maxValidityDays) {
      const maxEnd = new Date(input.issuedAt);
      maxEnd.setDate(maxEnd.getDate() + input.maxValidityDays);
      exceedsMaxValidity = input.expiresAt > maxEnd;
    }

    if (
      input.expiresAt &&
      input.standardDefaultDays &&
      !input.maxValidityDays
    ) {
      const maxEnd = new Date(input.issuedAt);
      maxEnd.setDate(maxEnd.getDate() + input.standardDefaultDays);
      exceedsMaxValidity = input.expiresAt > maxEnd;
    }

    const daysUntilExpiry = input.expiresAt
      ? Math.ceil((input.expiresAt.getTime() - now.getTime()) / 86400000)
      : null;

    const valid = !expired && !exceedsMaxValidity;
    let message: string | undefined;
    if (expired) message = 'CERTIFICATE_EXPIRED';
    else if (exceedsMaxValidity) message = 'EXPIRY_EXCEEDED';

    return {
      valid,
      expired,
      exceedsMaxValidity,
      daysUntilExpiry,
      message,
    };
  }
}
