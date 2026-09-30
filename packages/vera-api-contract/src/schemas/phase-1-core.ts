import { z } from 'zod';

export const AuthLoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const AuthSessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    email: z.string().email(),
    role: z.string(),
    trainingProviderId: z.number().nullable().optional(),
    instructorId: z.number().nullable().optional(),
  }),
});

export const RefreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export const ForgotPasswordBodySchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordBodySchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export const OcrExtractedFieldsSchema = z.object({
  workerName: z.string().optional(),
  certificationName: z.string().optional(),
  certificationCode: z.string().optional(),
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  certificateNumber: z.string().optional(),
  confidence: z.number(),
  fieldConfidence: z.record(z.number()),
});

export const TrainingIngestionRunSchema = z.object({
  id: z.number(),
  companyId: z.number(),
  status: z.string(),
  sourceChannel: z.string(),
  sourceMime: z.string(),
  originalFilename: z.string(),
  sizeBytes: z.number(),
  ocrText: z.string().nullable().optional(),
  ocrExtracted: OcrExtractedFieldsSchema.nullable().optional(),
  ocrConfidence: z.number().nullable().optional(),
  createdAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable().optional(),
});

export const TrainingVerificationQueueItemSchema = z.object({
  id: z.number(),
  outcome: z.string(),
  trainingRecordId: z.number().nullable(),
  validatedAt: z.coerce.date(),
  trainingRecord: z
    .object({
      id: z.number(),
      workerId: z.number(),
      worker: z.object({
        id: z.number(),
        firstName: z.string(),
        lastName: z.string(),
      }),
      certification: z.object({ id: z.number(), name: z.string() }),
    })
    .optional(),
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type TrainingIngestionRun = z.infer<typeof TrainingIngestionRunSchema>;
