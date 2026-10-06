import { Injectable } from '@nestjs/common';
import { TrainingValidationOutcome } from '@prisma/client';
import type { IngestionConfidenceReport } from './pipeline/types';
import { ExpiryRuleEngine } from '../modules/training-standards-compliance/engines/expiry-rule.engine';

export type ResolveValidationInput = {
  confidence: IngestionConfidenceReport;
  issuedAt?: Date | null;
  expiresAt?: Date | null;
};

@Injectable()
export class IngestionConfidencePolicyService {
  private readonly expiry = new ExpiryRuleEngine();

  /**
   * High-confidence + valid (non-expired) expiry → APPROVED (auto-verify).
   * Low confidence → NEEDS_REVIEW. Otherwise PENDING for human queue.
   */
  resolveValidationOutcome(
    input: IngestionConfidenceReport | ResolveValidationInput,
  ): TrainingValidationOutcome {
    const confidence =
      'confidence' in input && input.confidence
        ? input.confidence
        : (input as IngestionConfidenceReport);
    const issuedAt =
      'confidence' in input ? (input.issuedAt ?? null) : null;
    const expiresAt =
      'confidence' in input ? (input.expiresAt ?? null) : null;

    if (confidence.blocked) {
      return TrainingValidationOutcome.NEEDS_REVIEW;
    }
    if (confidence.needsReview) {
      return TrainingValidationOutcome.NEEDS_REVIEW;
    }

    if (issuedAt && expiresAt && !Number.isNaN(issuedAt.getTime()) && !Number.isNaN(expiresAt.getTime())) {
      const expiry = this.expiry.check({ issuedAt, expiresAt });
      if (expiry.valid && !expiry.expired) {
        return TrainingValidationOutcome.APPROVED;
      }
      // Expired or invalid window → force human review
      return TrainingValidationOutcome.NEEDS_REVIEW;
    }

    return TrainingValidationOutcome.PENDING;
  }
}
