import { TrainingValidationOutcome } from '@prisma/client';
import type { IngestionConfidenceReport } from './pipeline/types';
export type ResolveValidationInput = {
    confidence: IngestionConfidenceReport;
    issuedAt?: Date | null;
    expiresAt?: Date | null;
};
export declare class IngestionConfidencePolicyService {
    private readonly expiry;
    resolveValidationOutcome(input: IngestionConfidenceReport | ResolveValidationInput): TrainingValidationOutcome;
}
