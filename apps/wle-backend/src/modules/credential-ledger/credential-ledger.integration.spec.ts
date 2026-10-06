import { CredentialLedgerEventType } from '@prisma/client';
import { TrainingRecordsService } from '../../training-records/training-records.service';
import { CredentialLedgerService } from './credential-ledger.service';

describe('Credential ledger integration (training records)', () => {
  it('emits CREATED when a training record is created via API service', async () => {
    const prisma = {
      trainingRecord: {
        create: jest.fn().mockResolvedValue({
          id: 100,
          workerId: 1,
          providerId: null,
          companyId: 2,
        }),
      },
    };
    const ledger = {
      recordCredentialCreated: jest.fn().mockResolvedValue({
        eventType: CredentialLedgerEventType.CREATED,
      }),
    } as unknown as CredentialLedgerService;

    const svc = new TrainingRecordsService(prisma as never, ledger);
    await svc.create({
      workerId: 1,
      certificationId: 5,
      issuedAt: '2025-01-01',
      expiresAt: '2027-01-01',
    });

    expect(ledger.recordCredentialCreated).toHaveBeenCalledWith(
      expect.objectContaining({ credentialId: 100, workerId: 1 }),
    );
  });
});
