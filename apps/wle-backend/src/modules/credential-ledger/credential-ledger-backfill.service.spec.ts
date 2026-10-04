import { CredentialLedgerEventType } from '@prisma/client';
import { CredentialLedgerBackfillService } from './credential-ledger-backfill.service';
import { CredentialLedgerService } from './credential-ledger.service';

describe('CredentialLedgerBackfillService', () => {
  const prisma = {
    trainingRecord: { findMany: jest.fn() },
  };
  const ledger = { append: jest.fn() };
  const service = new CredentialLedgerBackfillService(
    prisma as never,
    ledger as unknown as CredentialLedgerService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('dry-run plans CREATED events for records without ledger history', async () => {
    prisma.trainingRecord.findMany.mockResolvedValue([
      {
        id: 10,
        workerId: 1,
        providerId: null,
        trainingProviderId: null,
        projectId: null,
        companyId: 2,
        issuedAt: new Date('2024-01-01'),
        expiresAt: new Date('2028-01-01'),
        ingestionRunId: null,
        completedAt: null,
        verifiedAt: null,
        ledgerEvents: [],
        validationResults: [],
      },
    ]);

    const result = await service.backfill({ dryRun: true, limit: 10 });
    expect(result.scanned).toBe(1);
    expect(result.recordsBackfilled).toBe(1);
    expect(result.eventsCreated).toBe(1);
    expect(ledger.append).not.toHaveBeenCalled();
  });

  it('skips records that already have CREATED events', async () => {
    prisma.trainingRecord.findMany.mockResolvedValue([
      {
        id: 11,
        workerId: 1,
        providerId: null,
        trainingProviderId: null,
        projectId: null,
        companyId: 2,
        issuedAt: new Date(),
        expiresAt: null,
        ingestionRunId: null,
        completedAt: null,
        verifiedAt: null,
        ledgerEvents: [{ eventType: CredentialLedgerEventType.CREATED }],
        validationResults: [],
      },
    ]);

    const result = await service.backfill({ limit: 10 });
    expect(result.recordsSkipped).toBe(1);
    expect(ledger.append).not.toHaveBeenCalled();
  });

  it('writes IMPORTED for ingestion-sourced records', async () => {
    prisma.trainingRecord.findMany.mockResolvedValue([
      {
        id: 12,
        workerId: 1,
        providerId: null,
        trainingProviderId: null,
        projectId: null,
        companyId: 2,
        issuedAt: new Date('2024-06-01'),
        expiresAt: new Date('2026-06-01'),
        ingestionRunId: 99,
        completedAt: null,
        verifiedAt: null,
        ledgerEvents: [],
        validationResults: [],
      },
    ]);
    ledger.append.mockResolvedValue({ id: 1 });

    await service.backfill({ limit: 10 });
    expect(ledger.append).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: CredentialLedgerEventType.IMPORTED,
        credentialId: 12,
      }),
    );
  });
});
