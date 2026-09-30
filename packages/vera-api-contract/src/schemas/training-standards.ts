import { z } from 'zod';

export const TrainingValidationOutcomeSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'NEEDS_REVIEW',
]);

export const ValidationIssueSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const ValidationReportSchema = z.object({
  outcome: TrainingValidationOutcomeSchema,
  score: z.number(),
  jurisdictionCode: z.string(),
  matchedStandardCodes: z.array(z.string()),
  missingStandardCodes: z.array(z.string()),
  issues: z.array(ValidationIssueSchema),
  validationResultId: z.number().optional(),
});

export const ValidateTrainingBodySchema = z.object({
  trainingRecordId: z.number().int(),
  jurisdictionCode: z.string().optional(),
});

export const ValidateProviderBodySchema = z.object({
  trainingProviderId: z.number().int(),
  jurisdictionCode: z.string().optional(),
});

export const ValidateInstructorBodySchema = z.object({
  instructorId: z.number().int(),
  courseCode: z.string().optional(),
  jurisdictionCode: z.string().optional(),
});

export const ValidateCertificateBodySchema = z.object({
  certificateQrToken: z.string().optional(),
  trainingRecordId: z.number().int().optional(),
});

export const TrainingStandardsDashboardSchema = z.object({
  pending: z.number(),
  approved: z.number(),
  rejected: z.number(),
  needsReview: z.number(),
  recent: z.array(z.unknown()),
});

export const ApprovalWorkflowBodySchema = z.object({
  validationResultId: z.number().int(),
  outcome: TrainingValidationOutcomeSchema,
  notes: z.string().optional(),
});

export const RejectionWorkflowBodySchema = z.object({
  validationResultId: z.number().int(),
  rejectionCodes: z.array(z.string()),
  notes: z.string().optional(),
});

export const TrainingValidationResultSchema = z.object({
  id: z.number(),
  subjectType: z.string(),
  outcome: TrainingValidationOutcomeSchema,
  score: z.number().nullable(),
  jurisdictionCode: z.string().nullable(),
  matchedStandardCodes: z.array(z.string()),
  missingStandardCodes: z.array(z.string()),
  validatedAt: z.coerce.date(),
  rejections: z.array(z.unknown()).optional(),
});
