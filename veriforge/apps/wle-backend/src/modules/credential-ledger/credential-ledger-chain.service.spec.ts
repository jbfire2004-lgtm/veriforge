import { NotFoundException } from '@nestjs/common';
import {
  CredentialLedgerEventType,
  TrainingValidationOutcome,
} from '@prisma/client';
import { CredentialLedgerChainService } from './credential-ledger-chain.service';
import { CredentialLedgerService } from './credential-ledger.service';

describe('CredentialLedgerChainService', () => {
  const prisma = {
    trainingRecord: { findUnique: jest.fn() },
  };
  const ledger = {
    listByCredential: jest.fn(),
  };

  const service = new CredentialLedgerChainService(
    prisma as never,
    ledger as unknown as CredentialLedgerService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('returns verification chain with events in order', async () => {
    prisma.trainingRecord.findUnique.mockResolvedValue({
      id: 10,
      issuedAt: new Date('2025-01-01'),
      expiresAt: new Date('2027-01-01'),
      certificateNumber: 'C-1',
      lastVerificationStatus: 'VERIFIED',
      worker: { id: 3, firstName: 'Jane', lastName: 'Doe', email: 'j@x.com' },
      provider: { id: 2, name: 'Acme' },
      trainingProvider: null,
      certification: { id: 5, name: 'WHMIS', code: 'WHMIS' },
      validationResults: [{ outcome: TrainingValidationOutcome.APPROVED }],
    });
    ledger.listByCredential.mockResolvedValue([
      {
        id: 1,
        occurredAt: '2025-01-01T00:00:00.000Z',
        eventType: CredentialLedgerEventType.CREATED,
        actorType: 'SYSTEM',
        actorId: null,
        credentialId: 10,
        workerId: 3,
        providerId: null,
        projectId: null,
        companyId: 1,
        correlationId: null,
        payload: {},
      },
      {
        id: 2,
        occurredAt: '2025-01-02T00:00:00.000Z',
        eventType: CredentialLedgerEventType.VERIFIED,
        actorType: 'SUPERVISOR',
        actorId: 9,
        credentialId: 10,
        workerId: 3,
        providerId: null,
        projectId: null,
        companyId: 1,
        correlationId: null,
        payload: {},
      },
    ]);

    const chain = await service.resolveVerificationChain(10);
    expect(chain.credentialId).toBe(10);
    expect(chain.events).toHaveLength(2);
    expect(chain.status).toBe('valid');
  });

  it('marks revoked when REVOKED event exists', async () => {
    prisma.trainingRecord.findUnique.mockResolvedValue({
      id: 10,
      issuedAt: new Date(),
      expiresAt: new Date('2027-01-01'),
      certificateNumber: null,
      lastVerificationStatus: null,
      worker: null,
      provider: null,
      trainingProvider: null,
      certification: null,
      validationResults: [],
    });
    ledger.listByCredential.mockResolvedValue([
      {
        id: 1,
        eventType: CredentialLedgerEventType.REVOKED,
      },
    ]);

    const chain = await service.resolveVerificationChain(10);
    expect(chain.status).toBe('revoked');
  });

  it('throws when credential missing', async () => {
    prisma.trainingRecord.findUnique.mockResolvedValue(null);
    await expect(service.resolveVerificationChain(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
