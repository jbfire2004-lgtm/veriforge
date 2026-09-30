import { z } from 'zod';
import { TrainingValidationOutcomeSchema } from './training-standards';
import { ProviderComplianceLevelSchema } from './training-provider';

/** Enriched training row on worker wallet (provider integration). */
export const WalletTrainingRecordSchema = z.object({
  id: z.number(),
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  certification: z
    .object({
      id: z.number(),
      name: z.string(),
      code: z.string().nullable(),
    })
    .nullable(),
  providerName: z.string().nullable(),
  instructorName: z.string().nullable(),
  courseName: z.string().nullable(),
  courseCode: z.string().nullable(),
  courseStandards: z.array(z.string()),
  jurisdictionCode: z.string().nullable(),
  jurisdictionValid: z.boolean().nullable(),
  certificateQrToken: z.string().nullable(),
  certificateQrUrl: z.string().nullable(),
  certificateNumber: z.string().nullable(),
  complianceStatus: z.string(),
  companyId: z.number().nullable(),
  projectId: z.number().nullable(),
  projectName: z.string().nullable(),
  companyName: z.string().nullable(),
  verifiedByVeraStatus: z
    .enum(['UNVERIFIED', 'PENDING', 'VERIFIED', 'VERIFIED_WITH_NFT'])
    .optional(),
  jurisdictionCoverage: z.array(z.string()).optional(),
  regulatorySummary: z.string().nullable().optional(),
  nftTokenId: z.string().nullable().optional(),
  nftChain: z.string().nullable().optional(),
});

export const TrainingComplianceBucketSchema = z.enum([
  'verified',
  'pending',
  'rejected',
  'expiring',
]);

export const TrainingComplianceRowSchema = z.object({
  trainingRecordId: z.number(),
  workerId: z.number(),
  workerName: z.string(),
  courseName: z.string(),
  providerName: z.string().nullable(),
  issuedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  validationOutcome: TrainingValidationOutcomeSchema.nullable(),
  projectId: z.number().nullable(),
  projectName: z.string().nullable(),
});

export const CompanyTrainingComplianceDashboardSchema = z.object({
  companyId: z.number(),
  companyName: z.string(),
  updatedAt: z.string().datetime(),
  status: z.enum(['COMPLIANT', 'NON_COMPLIANT']),
  counts: z.object({
    verified: z.number(),
    pending: z.number(),
    rejected: z.number(),
    expiring: z.number(),
  }),
  records: z.record(TrainingComplianceBucketSchema, z.array(TrainingComplianceRowSchema)),
  flaggedWorkers: z.array(
    z.object({
      workerId: z.number(),
      firstName: z.string(),
      lastName: z.string(),
      flags: z.array(z.string()),
    }),
  ),
  projects: z.array(
    z.object({
      projectId: z.number(),
      projectName: z.string(),
      counts: z.object({
        verified: z.number(),
        pending: z.number(),
        rejected: z.number(),
        expiring: z.number(),
      }),
      flaggedWorkerCount: z.number(),
    }),
  ),
});

export const UnionHallTrainingReceiptSchema = z.object({
  receiptId: z.number(),
  status: z.string(),
  trainingRecordId: z.number(),
  workerId: z.number(),
  workerName: z.string(),
  courseName: z.string(),
  providerName: z.string().nullable(),
  providerId: z.number().nullable(),
  instructorName: z.string().nullable(),
  instructorQualificationStatus: z.string().nullable(),
  issuedAt: z.string(),
  expiresAt: z.string().nullable(),
  validationOutcome: z.string().nullable(),
  certificateQrToken: z.string().nullable(),
});

export const UnionHallProviderSummarySchema = z.object({
  providerId: z.number(),
  name: z.string(),
  code: z.string().nullable(),
  approvalStatus: z.string(),
  active: z.boolean(),
  complianceStatus: ProviderComplianceLevelSchema.nullable(),
  complianceScore: z.number().nullable(),
  complianceAssessedAt: z.string().datetime().nullable(),
  gaps: z.unknown().nullable(),
});

export const UnionHallTrainingDashboardSchema = z.object({
  unionHallId: z.number(),
  unionHallName: z.string(),
  counts: z.object({
    pending: z.number(),
    accepted: z.number(),
    pushed: z.number(),
    rejected: z.number(),
  }),
  providerTrainingHistory: z.array(UnionHallTrainingReceiptSchema),
  providers: z.array(UnionHallProviderSummarySchema),
  instructors: z.array(
    z.object({
      instructorId: z.number(),
      firstName: z.string(),
      lastName: z.string(),
      providerId: z.number(),
      providerName: z.string(),
      qualificationStatus: z.string(),
      qualificationExpiresAt: z.string().nullable(),
    }),
  ),
});

export const EquipmentTrainingRequirementSchema = z.object({
  certification: z.object({
    id: z.number(),
    name: z.string(),
    code: z.string().nullable().optional(),
  }),
});

export const ValidateCertificatePublicResponseSchema = z.object({
  valid: z.boolean(),
  expired: z.boolean().optional(),
  reason: z.string().optional(),
  record: z
    .object({
      id: z.number(),
      workerId: z.number(),
      workerName: z.string(),
      certification: z.string(),
      course: z.string().nullable().optional(),
      provider: z.string().nullable().optional(),
      instructor: z.string().nullable().optional(),
      issuedAt: z.coerce.date(),
      expiresAt: z.coerce.date().nullable().optional(),
      certificateNumber: z.string().nullable().optional(),
    })
    .optional(),
});
