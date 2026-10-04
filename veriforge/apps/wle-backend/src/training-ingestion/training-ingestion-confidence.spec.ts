import { BadRequestException } from '@nestjs/common';
import { TrainingValidationOutcome } from '@prisma/client';
import { TrainingIngestionService } from './training-ingestion.service';
import { IngestionConfidencePolicyService } from './ingestion-confidence-policy.service';

describe('TrainingIngestionService confidence gating', () => {
  const prisma = {
    company: { findUnique: jest.fn() },
    worker: { findFirst: jest.fn() },
    certification: { findFirst: jest.fn(), findUnique: jest.fn() },
    provider: { findUnique: jest.fn() },
    trainingRecord: { create: jest.fn(), update: jest.fn() },
    trainingValidationResult: { findFirst: jest.fn(), create: jest.fn() },
  };
  const walletIntegration = {
    syncAfterTrainingRecord: jest.fn().mockResolvedValue(undefined),
  };
  const monitoring = { processing: jest.fn() };
  const confidencePolicy = new IngestionConfidencePolicyService();
  const standards = { approveValidation: jest.fn() };
  const credentialLedger = {
    recordCredentialImported: jest.fn(),
    recordCredentialCreated: jest.fn(),
  };

  const service = new TrainingIngestionService(
    prisma as never,
    { extractWithRetry: jest.fn() } as never,
    { validateRows: jest.fn().mockResolvedValue([]) } as never,
    monitoring as never,
    walletIntegration as never,
    { handleMultipartUpload: jest.fn() } as never,
    confidencePolicy,
    standards as never,
    credentialLedger as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('blocks ingest when OCR confidence is too low', async () => {
    prisma.company.findUnique.mockResolvedValue({ id: 1 });
    await expect(
      service.ingestRowsWithConfidence(
        1,
        [
          {
            workerId: 1,
            certificationCode: 'WHMIS',
            issuedAt: '2025-01-01',
            expiresAt: '2027-01-01',
            confidence: 0.1,
          },
        ],
        { ocrExtracted: { confidence: 0.1, fieldConfidence: {} } },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.trainingRecord.create).not.toHaveBeenCalled();
  });

  it('creates NEEDS_REVIEW validation for medium confidence', async () => {
    prisma.company.findUnique.mockResolvedValue({ id: 1 });
    prisma.worker.findFirst.mockResolvedValue({ id: 1, companyId: 1 });
    prisma.certification.findFirst.mockResolvedValue({ id: 10 });
    prisma.trainingRecord.create.mockResolvedValue({ id: 99 });
    prisma.trainingValidationResult.findFirst.mockResolvedValue(null);
    prisma.trainingValidationResult.create.mockResolvedValue({ id: 1 });

    const summary = await service.ingestRowsWithConfidence(
      1,
      [
        {
          workerId: 1,
          certificationCode: 'WHMIS',
          issuedAt: '2025-01-01',
          expiresAt: '2027-01-01',
          confidence: 0.45,
        },
      ],
      { ingestionRunId: 5, correlationId: 'ing_test' },
    );

    expect(summary.created).toBe(1);
    expect(summary.needsReview).toBe(1);
    expect(prisma.trainingValidationResult.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          outcome: TrainingValidationOutcome.NEEDS_REVIEW,
        }),
      }),
    );
  });

  it('auto-verifies high-confidence rows with valid expiry', async () => {
    prisma.company.findUnique.mockResolvedValue({ id: 1 });
    prisma.worker.findFirst.mockResolvedValue({ id: 1, companyId: 1 });
    prisma.certification.findFirst.mockResolvedValue({ id: 10 });
    prisma.trainingRecord.create.mockResolvedValue({ id: 99 });
    prisma.trainingRecord.update.mockResolvedValue({ id: 99 });
    prisma.trainingValidationResult.findFirst.mockResolvedValue(null);
    prisma.trainingValidationResult.create.mockResolvedValue({ id: 1 });

    const summary = await service.ingestRowsWithConfidence(
      1,
      [
        {
          workerId: 1,
          certificationCode: 'WHMIS',
          issuedAt: '2025-01-01',
          expiresAt: '2027-01-01',
          confidence: 0.92,
        },
      ],
      { ingestionRunId: 5, correlationId: 'ing_auto' },
    );

    expect(summary.created).toBe(1);
    expect(summary.needsReview).toBe(0);
    expect(summary.autoVerified).toBe(1);
    expect(prisma.trainingValidationResult.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          outcome: TrainingValidationOutcome.APPROVED,
        }),
      }),
    );
    expect(prisma.trainingRecord.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 99 },
        data: expect.objectContaining({
          lastVerificationStatus: 'VERIFIED',
        }),
      }),
    );
  });

  it('fails when provider name does not resolve (optional provider)', async () => {
    prisma.company.findUnique.mockResolvedValue({ id: 1 });
    prisma.worker.findFirst.mockResolvedValue({ id: 1, companyId: 1 });
    prisma.certification.findFirst.mockResolvedValue({ id: 10 });
    prisma.provider.findUnique.mockResolvedValue(null);
    prisma.trainingRecord.create.mockResolvedValue({ id: 99 });
    prisma.trainingValidationResult.findFirst.mockResolvedValue(null);
    prisma.trainingValidationResult.create.mockResolvedValue({ id: 1 });

    const summary = await service.ingestRowsWithConfidence(
      1,
      [
        {
          workerId: 1,
          certificationCode: 'WHMIS',
          issuedAt: '2025-01-01',
          expiresAt: '2027-01-01',
          providerName: 'Unknown Provider Co',
          confidence: 0.9,
        },
      ],
      { ingestionRunId: 5 },
    );

    // Provider is optional — record still created without providerId
    expect(summary.created).toBe(1);
    expect(prisma.trainingRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ providerId: null }),
      }),
    );
  });
});
