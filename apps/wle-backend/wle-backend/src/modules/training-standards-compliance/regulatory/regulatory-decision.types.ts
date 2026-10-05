import type { RegulatoryComplianceStatus } from '@prisma/client';
import type { TrainingValidationOutcome } from '@prisma/client';

/** Structured regulatory decision (API + persistence). */
export type RegulatoryDecision = {
  trainingRecordId: number;
  regulatoryComplianceStatus: RegulatoryComplianceStatus;
  complianceScore: number;
  matchedStandards: string[];
  jurisdictionCoverage: string[];
  reasons: string[];
  jurisdictionCode: string;
  validationResultId?: number;
  standardsOutcome?: TrainingValidationOutcome;
  recommendedAction: 'approve' | 'reject' | 'manual_review';
  decisionId?: number;
  createdAt?: string;
};

export type RegulatoryTrainingInput = {
  trainingRecordId: number;
  jurisdictionCode?: string;
};
