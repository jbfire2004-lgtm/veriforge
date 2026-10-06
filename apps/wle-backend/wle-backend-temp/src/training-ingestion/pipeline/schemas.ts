import { z } from 'zod';

/** Shared row shape for preview, confirm, and provider payloads. */
export const IngestRowSchema = z.object({
  workerId: z.number().int().positive(),
  certificationId: z.number().int().positive().optional(),
  certificationCode: z.string().min(1).max(128).optional(),
  certificationName: z.string().min(1).max(256).optional(),
  issuedAt: z.string().min(4).max(64),
  expiresAt: z.string().min(4).max(64),
  providerName: z.string().min(1).max(256).optional(),
  certificateNumber: z.string().min(1).max(512).optional(),
  confidence: z.number().min(0).max(1).optional(),
  fieldConfidence: z.record(z.string(), z.number().min(0).max(1)).optional(),
});

export const ConfirmIngestBodySchema = z.object({
  companyId: z.number().int().positive(),
  correlationId: z.string().min(8).max(128).optional(),
  rows: z.array(IngestRowSchema).min(1).max(50),
});

export const QrIngestBodySchema = z.object({
  companyId: z.number().int().positive(),
  workerId: z.number().int().positive(),
  qr: z.string().min(4).max(4096),
});

export const ProviderIngestCompletionSchema = z.object({
  workerEmail: z.string().email().optional(),
  workerPhone: z.string().min(3).max(32).optional(),
  workerExternalId: z.string().min(1).max(128).optional(),
  certificationCode: z.string().min(1).max(128).optional(),
  certificationName: z.string().min(1).max(256).optional(),
  certificateNumber: z.string().min(1).max(512).optional(),
  issuedAt: z.string().min(4).max(64).optional(),
  expiresAt: z.string().min(4).max(64).optional(),
  companyExternalId: z.string().optional(),
  projectExternalId: z.string().optional(),
});

export const ProviderIngestBodySchema = z.object({
  companyId: z.number().int().positive(),
  templateKey: z.string().min(1).max(64).default('generic_rest'),
  completions: z.array(ProviderIngestCompletionSchema).optional(),
});

export const ReviewCorrectBodySchema = z.object({
  workerId: z.number().int().positive().optional(),
  certificationId: z.number().int().positive().optional(),
  certificationCode: z.string().optional(),
  certificationName: z.string().optional(),
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  providerName: z.string().optional(),
  certificateNumber: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export type ConfirmIngestBody = z.infer<typeof ConfirmIngestBodySchema>;
export type QrIngestBody = z.infer<typeof QrIngestBodySchema>;
export type ProviderIngestBody = z.infer<typeof ProviderIngestBodySchema>;
export type ReviewCorrectBody = z.infer<typeof ReviewCorrectBodySchema>;
