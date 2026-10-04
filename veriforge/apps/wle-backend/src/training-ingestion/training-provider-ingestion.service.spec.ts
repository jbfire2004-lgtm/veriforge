import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TrainingProviderIngestionService } from './training-provider-ingestion.service';

describe('TrainingProviderIngestionService', () => {
  const prisma = {
    trainingProvider: { findUnique: jest.fn() },
    providerSyncConfig: { findUnique: jest.fn() },
    worker: { findFirst: jest.fn() },
  };
  const ingestion = { ingestRowsWithConfidence: jest.fn() };
  const monitoring = { processing: jest.fn() };

  const service = new TrainingProviderIngestionService(
    prisma as never,
    ingestion as never,
    monitoring as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('ingests a realistic generic_rest payload', async () => {
    prisma.trainingProvider.findUnique.mockResolvedValue({
      id: 7,
      name: 'Acme',
    });
    prisma.providerSyncConfig.findUnique.mockResolvedValue(null);
    prisma.worker.findFirst.mockResolvedValue({ id: 3 });
    ingestion.ingestRowsWithConfidence.mockResolvedValue({
      created: 1,
      needsReview: 0,
      errors: [],
      recordIds: [10],
      correlationId: 'ing_test',
    });

    const body = {
      companyId: 1,
      templateKey: 'generic_rest',
      completions: [
        {
          workerEmail: 'worker@example.com',
          certificationCode: 'WHMIS',
          issuedAt: '2025-01-01',
          expiresAt: '2027-01-01',
          certificateNumber: 'C-1',
        },
      ],
    };

    const result = await service.ingestFromProvider(7, body);
    expect(result.created).toBe(1);
    expect(ingestion.ingestRowsWithConfidence).toHaveBeenCalled();
  });

  it('rejects unknown provider', async () => {
    prisma.trainingProvider.findUnique.mockResolvedValue(null);
    await expect(
      service.ingestFromProvider(999, { companyId: 1, completions: [] }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects payload with no completions', async () => {
    prisma.trainingProvider.findUnique.mockResolvedValue({ id: 1 });
    prisma.providerSyncConfig.findUnique.mockResolvedValue(null);
    await expect(
      service.ingestFromProvider(1, { companyId: 1, completions: [] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
