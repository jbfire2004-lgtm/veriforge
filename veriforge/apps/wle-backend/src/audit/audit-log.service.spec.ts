import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, AuditEntityType } from './audit-actions';
import { AuditLogService } from './audit-log.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  const prisma = {
    auditLog: { create: jest.fn(), findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(AuditLogService);
  });

  it('writes audit row with actor, tenant, and string entity id', async () => {
    prisma.auditLog.create.mockResolvedValue({ id: 1 });

    await service.logAudit(
      { id: 42, companyId: 10 },
      AuditAction.INSPECTION_SUBMITTED,
      { type: AuditEntityType.PM_INSPECTION, id: 'insp-uuid-1', tenantId: 10 },
      { scorePercent: 88 },
    );

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: AuditAction.INSPECTION_SUBMITTED,
        entityType: AuditEntityType.PM_INSPECTION,
        entityId: 'insp-uuid-1',
        tenantId: 10,
        metadataJson: { scorePercent: 88 },
        actor: { connect: { id: 42 } },
      }),
    });
  });

  it('resolves tenant from actor company when entity tenant omitted', async () => {
    prisma.auditLog.create.mockResolvedValue({ id: 2 });

    await service.logAudit(
      { id: 5, companyId: 77 },
      AuditAction.ASSESSMENT_TAE_RUN,
      { type: AuditEntityType.VERA_ASSESSMENT_RUN, id: 'run-1' },
      { workerId: 3 },
    );

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: 77,
        entityId: 'run-1',
      }),
    });
  });

  it('findForTenant scopes queries by tenantId', async () => {
    prisma.auditLog.findMany.mockResolvedValue([]);

    await service.findForTenant(10, 50);

    expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
      where: { tenantId: 10 },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  });
});
