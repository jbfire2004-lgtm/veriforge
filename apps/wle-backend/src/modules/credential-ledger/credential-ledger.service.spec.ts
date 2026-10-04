import { ForbiddenException } from '@nestjs/common';
import {
  CredentialLedgerActorType,
  CredentialLedgerEventType,
} from '@prisma/client';
import { CredentialLedgerService } from './credential-ledger.service';

describe('CredentialLedgerService', () => {
  const prisma = {
    credentialLedgerEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const service = new CredentialLedgerService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('appends CREATED events', async () => {
    prisma.credentialLedgerEvent.create.mockResolvedValue({
      id: 1,
      occurredAt: new Date('2025-06-01T12:00:00Z'),
      actorId: null,
      actorType: CredentialLedgerActorType.SYSTEM,
      eventType: CredentialLedgerEventType.CREATED,
      credentialId: 42,
      workerId: 7,
      providerId: null,
      projectId: null,
      companyId: 1,
      correlationId: null,
      payload: { source: 'test' },
    });

    const event = await service.recordCredentialCreated({
      credentialId: 42,
      workerId: 7,
      companyId: 1,
      payload: { source: 'test' },
    });

    expect(event.eventType).toBe('CREATED');
    expect(prisma.credentialLedgerEvent.create).toHaveBeenCalled();
  });

  it('blocks immutable mutations via assertImmutableOperation', () => {
    expect(() =>
      service.assertImmutableOperation('CredentialLedgerEvent', 'update'),
    ).toThrow(ForbiddenException);
  });

  it('lists events by credential in chronological order', async () => {
    prisma.credentialLedgerEvent.findMany.mockResolvedValue([
      {
        id: 2,
        occurredAt: new Date('2025-06-02T12:00:00Z'),
        actorId: 5,
        actorType: CredentialLedgerActorType.SUPERVISOR,
        eventType: CredentialLedgerEventType.VERIFIED,
        credentialId: 42,
        workerId: 7,
        providerId: null,
        projectId: null,
        companyId: 1,
        correlationId: null,
        payload: {},
      },
    ]);

    const events = await service.listByCredential(42);
    expect(events).toHaveLength(1);
    expect(events[0]!.eventType).toBe('VERIFIED');
  });
});
