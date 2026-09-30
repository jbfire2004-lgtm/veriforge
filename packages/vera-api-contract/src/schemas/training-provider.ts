import { z } from 'zod';

export const ProviderApprovalStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
]);

export const ProviderComplianceLevelSchema = z.enum([
  'COMPLIANT',
  'NEEDS_ATTENTION',
  'NON_COMPLIANT',
  'PENDING_REVIEW',
]);

export const TrainingProviderDashboardSchema = z.object({
  provider: z.unknown(),
  stats: z.object({
    activeCourses: z.number(),
    activeInstructors: z.number(),
    trainingRecordsIssued: z.number(),
  }),
  compliance: z.unknown().nullable(),
  recentRecords: z.array(z.unknown()),
});

export const CreateTrainingProviderBodySchema = z.object({
  name: z.string().min(1),
  code: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  address: z.string().optional(),
});

export const CourseStandardBodySchema = z.object({
  standardKey: z.string(),
  title: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  minScore: z.number().int().optional(),
});

export const AddCourseBodySchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  certificationId: z.number().int().optional(),
  durationHours: z.number().optional(),
  validityDays: z.number().int().optional(),
  contentText: z.string().optional(),
  standards: z.array(CourseStandardBodySchema).optional(),
  instructorIds: z.array(z.number().int()).optional(),
});

export const AddCourseResponseSchema = z.object({
  id: z.number(),
  providerId: z.number(),
  code: z.string(),
  name: z.string(),
  standards: z.array(z.unknown()).optional(),
});

export const AddInstructorBodySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  licenseNumber: z.string().optional(),
  qualifiedCourseCodes: z.array(z.string()).optional(),
  qualificationExpiresAt: z.string().datetime().optional(),
  courseIds: z.array(z.number().int()).optional(),
});

export const AddInstructorResponseSchema = z.object({
  id: z.number(),
  providerId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  qualificationStatus: z.string(),
});

export const UploadTrainingBodySchema = z.object({
  workerId: z.number().int(),
  courseId: z.number().int(),
  instructorId: z.number().int().optional(),
  companyId: z.number().int().optional(),
  projectId: z.number().int().optional(),
  equipmentId: z.number().int().optional(),
  issuedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  certificateNumber: z.string().optional(),
});

export const UploadTrainingResponseSchema = z.object({
  record: z.unknown(),
  verificationPath: z.string(),
});

export const IssueCertificateBodySchema = z.object({
  trainingRecordId: z.number().int(),
  certificateUrl: z.string().url().optional(),
});

export const IssueCertificateResponseSchema = z.object({
  digitalCertificate: z.object({
    recordId: z.number(),
    workerId: z.number(),
    workerName: z.string(),
    certificationName: z.string(),
    courseName: z.string().optional(),
    providerName: z.string(),
    issuedAt: z.string(),
    expiresAt: z.string().optional(),
    certificateNumber: z.string().optional(),
    verificationUrl: z.string(),
  }).nullable(),
  qrDataUrl: z.string().nullable(),
});

export const ValidateCertificateResponseSchema = z.object({
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
      issuedAt: z.coerce.date(),
      expiresAt: z.coerce.date().nullable().optional(),
    })
    .optional(),
});

export const ProviderComplianceResponseSchema = z.object({
  id: z.number(),
  providerId: z.number(),
  status: ProviderComplianceLevelSchema,
  score: z.number().nullable(),
  gaps: z.union([z.array(z.string()), z.unknown()]).optional(),
  assessedAt: z.coerce.date(),
  notes: z.string().nullable().optional(),
});

export const ProviderApprovalBodySchema = z.object({
  status: ProviderApprovalStatusSchema,
  notes: z.string().optional(),
});

export const ProviderApprovalResponseSchema = z.object({
  id: z.number(),
  providerId: z.number(),
  status: ProviderApprovalStatusSchema,
  reviewedBy: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
});
