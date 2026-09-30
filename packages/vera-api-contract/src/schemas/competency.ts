import { z } from 'zod';

export const EvaluateCompetencyBodySchema = z.object({
  workerId: z.number().int().positive(),
  equipmentId: z.number().int().positive(),
  score: z.number().int().min(0).max(100),
  passed: z.boolean(),
  evaluationDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  evidenceNotes: z.string().optional(),
  evidencePhotos: z.array(z.string()).optional(),
  workerSignature: z.string().optional(),
  evaluatorSignature: z.string().optional(),
});

export const CompetencyEvaluationResponseSchema = z.object({
  id: z.number(),
  workerId: z.number(),
  equipmentId: z.number(),
  evaluatorUserId: z.number().nullable(),
  equipmentTypeKey: z.string(),
  score: z.number(),
  passed: z.boolean(),
  evaluationDate: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
  notes: z.string().nullable(),
  workerSignature: z.string().nullable(),
  evaluatorSignature: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const CheckCompetencyBodySchema = z.object({
  workerId: z.number().int().positive(),
  equipmentId: z.number().int().positive(),
});

export const CompetencyCheckResponseSchema = z.object({
  eligible: z.boolean(),
  reason: z.string().optional(),
  requireEvaluation: z.boolean(),
  minPassingScore: z.number(),
  latestEvaluation: z
    .object({
      id: z.number(),
      passed: z.boolean(),
      score: z.number(),
      evaluationDate: z.string().datetime(),
      expiresAt: z.string().datetime().nullable(),
      expired: z.boolean(),
    })
    .optional(),
  rules: z.object({
    minPassingScore: z.number(),
    expiryDays: z.number().nullable(),
    requireEvaluation: z.boolean(),
    source: z.enum(['equipment', 'type', 'default']),
    certificationId: z.number().nullable(),
  }),
});

export const UpsertCompetencyRequirementBodySchema = z.object({
  minPassingScore: z.number().int().min(0).max(100).optional(),
  expiryDays: z.number().int().positive().nullable().optional(),
  requireEvaluation: z.boolean().optional(),
  certificationId: z.number().int().positive().nullable().optional(),
});

export const CompetencyDashboardSchema = z.object({
  totalEvaluations: z.number(),
  passing: z.number(),
  expiringSoon: z.number(),
  expired: z.number(),
  operatorLinks: z.number(),
  recent: z.array(z.unknown()),
});
