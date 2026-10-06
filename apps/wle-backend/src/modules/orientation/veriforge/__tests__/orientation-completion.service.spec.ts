import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AuditLogService } from '../../../../audit/audit-log.service';
import { OrientationCompletionService } from '../orientation-completion.service';

describe('OrientationCompletionService', () => {
  let service: OrientationCompletionService;

  const prisma = {
    orientationDefinition: { findUnique: jest.fn() },
    worker: { findUnique: jest.fn() },
    orientationCompletion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const auditLog = { logAudit: jest.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrientationCompletionService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = module.get(OrientationCompletionService);
  });

  function setupHappyPath() {
    prisma.orientationDefinition.findUnique.mockResolvedValue({
      id: 'o1',
      companyId: 10,
      expiryRules: { durationDays: 30 },
    });
    prisma.worker.findUnique.mockResolvedValue({ id: 7, companyId: 10 });
    prisma.orientationCompletion.findUnique.mockResolvedValue(null);
  }

  it('records completed status with expiry', async () => {
    setupHappyPath();
    prisma.orientationCompletion.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'c1', ...data }),
    );

    const row = await service.create({
      workerId: 7,
      orientationId: 'o1',
      companyId: 10,
      score: 95,
      actorId: 1,
    });

    expect(row.status).toBe('completed');
    expect(row.expiresOn).toBeInstanceOf(Date);
    expect(row.completedOn).toBeInstanceOf(Date);
  });

  it('marks failed when score < 70', async () => {
    setupHappyPath();
    prisma.orientationCompletion.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'c2', ...data }),
    );

    const row = await service.create({
      workerId: 7,
      orientationId: 'o1',
      companyId: 10,
      score: 40,
    });

    expect(row.status).toBe('failed');
    expect(row.expiresOn).toBeNull();
  });

  it('records pending when status forced', async () => {
    setupHappyPath();
    prisma.orientationCompletion.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'c3', ...data }),
    );

    const row = await service.create({
      workerId: 7,
      orientationId: 'o1',
      companyId: 10,
      status: 'pending',
    });

    expect(row.status).toBe('pending');
    expect(row.completedOn).toBeNull();
  });

  it('replays idempotent clientSyncId', async () => {
    setupHappyPath();
    prisma.orientationCompletion.findUnique.mockResolvedValue({
      id: 'existing',
      clientSyncId: 'sync-1',
      status: 'completed',
    });

    const row = await service.create({
      workerId: 7,
      orientationId: 'o1',
      companyId: 10,
      clientSyncId: 'sync-1',
    });

    expect(row.id).toBe('existing');
    expect(prisma.orientationCompletion.create).not.toHaveBeenCalled();
  });

  it('expireDue flips completed → expired after time passes', async () => {
    prisma.orientationCompletion.updateMany.mockResolvedValue({ count: 3 });
    const result = await service.expireDue(10);
    expect(result).toEqual({ expired: 3 });
    expect(prisma.orientationCompletion.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'completed',
          companyId: 10,
          expiresOn: expect.objectContaining({ lt: expect.any(Date) }),
        }),
        data: { status: 'expired' },
      }),
    );
  });
});
