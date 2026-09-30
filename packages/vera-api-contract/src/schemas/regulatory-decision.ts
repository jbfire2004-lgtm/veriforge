import { z } from 'zod';
import { TrainingValidationOutcomeSchema } from './training-standards';

export const RegulatoryComplianceStatusSchema = z.enum([
  'COMPLIANT',
  'PARTIALLY_COMPLIANT',
  'NON_COMPLIANT',
  'UNKNOWN',
]);

export const RegulatoryRecommendedActionSchema = z.enum([
  'approve',
  'reject',
  'manual_review',
]);

export const RegulatoryDecisionSchema = z.object({
  trainingRecordId: z.number().int(),
  regulatoryComplianceStatus: RegulatoryComplianceStatusSchema,
  complianceScore: z.number().int().min(0).max(100),
  matchedStandards: z.array(z.string()),
  jurisdictionCoverage: z.array(z.string()),
  reasons: z.array(z.string()),
  jurisdictionCode: z.string(),
  validationResultId: z.number().int().optional(),
  standardsOutcome: TrainingValidationOutcomeSchema.optional(),
  recommendedAction: RegulatoryRecommendedActionSchema,
  decisionId: z.number().int().optional(),
  createdAt: z.string().datetime().optional(),
});

export const RegulatoryDecisionBodySchema = z.object({
  trainingRecordId: z.number().int(),
  jurisdictionCode: z.string().optional(),
});

export const RegulatoryEquivalencySchema = z.object({
  id: z.number().int(),
  fromJurisdiction: z.string(),
  toJurisdiction: z.string(),
  standardCode: z.string(),
  notes: z.string().nullable().optional(),
  active: z.boolean(),
  createdAt: z.coerce.date().optional(),
});

export type RegulatoryComplianceStatus = z.infer<
  typeof RegulatoryComplianceStatusSchema
>;
export type RegulatoryDecision = z.infer<typeof RegulatoryDecisionSchema>;
export type RegulatoryDecisionBody = z.infer<
  typeof RegulatoryDecisionBodySchema
>;
