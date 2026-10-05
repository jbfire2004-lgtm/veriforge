import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TrainingQrIngestionService } from './training-qr-ingestion.service';

describe('TrainingQrIngestionService', () => {
  const prisma = {
    worker: { findFirst: jest.fn() },
    trainingRecord: { findFirst: jest.fn() },
    trainingValidationResult: { create: jest.fn() },
  };
  const certificates = {
    validateByToken: jest.fn(),
  };
  const monitoring = { processing: jest.fn() };

  const service = new TrainingQrIngestionService(
    prisma as never,
    certificates as never,
    monitoring as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('links certificate already owned by worker', async () => {
    certificates.validateByToken.mockResolvedValue({
      valid: true,
      expired: false,
      record: {
        workerId: 5,
        workerName: 'Jane Doe',
        certification: 'WHMIS',
        issuedAt: new Date('2025-01-01'),
        expiresAt: new Date('2027-01-01'),
      },
    });
    prisma.worker.findFirst.mockResolvedValue({ id: 5 });
    prisma.trainingRecord.findFirst.mockResolvedValue({
      id: 99,
      workerId: 5,
      companyId: 1,
    });

    const result = await service.ingestFromQr(
      1,
      5,
      'cert_a1b2c3d4e5f6789012345678',
    );
    expect(result.status).toBe('linked');
    expect(result.trainingRecordId).toBe(99);
  });

  it('rejects invalid QR format', async () => {
    await expect(
      service.ingestFromQr(1, 5, 'not-a-cert'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects expired certificate', async () => {
    certificates.validateByToken.mockResolvedValue({
      valid: false,
      expired: true,
      record: { workerId: 5 },
    });
    await expect(
      service.ingestFromQr(1, 5, 'cert_a1b2c3d4e5f6789012345678'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('routes mismatched worker to needs_review', async () => {
    certificates.validateByToken.mockResolvedValue({
      valid: true,
      expired: false,
      record: {
        workerId: 2,
        workerName: 'Other Worker',
        certification: 'WHMIS',
        issuedAt: new Date(),
        expiresAt: new Date(),
      },
    });
    prisma.worker.findFirst.mockResolvedValue({ id: 5 });
    prisma.trainingRecord.findFirst.mockResolvedValue({
      id: 99,
      workerId: 2,
      companyId: 1,
    });
    prisma.trainingValidationResult.create.mockResolvedValue({ id: 42 });

    const result = await service.ingestFromQr(
      1,
      5,
      'cert_b2c3d4e5f6789012345678901',
    );
    expect(result.status).toBe('needs_review');
    expect(result.validationResultId).toBe(42);
  });

  it('throws when certificate not found', async () => {
    certificates.validateByToken.mockResolvedValue({
      valid: false,
      reason: 'NOT_FOUND',
    });
    await expect(
      service.ingestFromQr(1, 5, 'cert_c3d4e5f67890123456789012'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
