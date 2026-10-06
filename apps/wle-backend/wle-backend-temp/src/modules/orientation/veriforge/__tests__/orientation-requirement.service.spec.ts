import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AuditLogService } from '../../../../audit/audit-log.service';
import { OrientationRequirementService } from '../orientation-requirement.service';

describe('OrientationRequirementService', () => {
  let service: OrientationRequirementService;

  const prisma = {
    orientationDefinition: { findUnique: jest.fn() },
    orientationRequirement: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    worker: { findUnique: jest.fn() },
  };

  const auditLog = { logAudit: jest.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrientationRequirementService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = module.get(OrientationRequirementService);
  });

  it('creates company-scoped requirement for published orientation', async () => {
    prisma.orientationDefinition.findUnique.mockResolvedValue({
      id: 'o1',
      companyId: 10,
      isPublished: true,
    });
    prisma.orientationRequirement.create.mockResolvedValue({
      id: 'r1',
      orientationId: 'o1',
      companyId: 10,
      mustCompleteBefore: 'arrival',
      orientation: { id: 'o1', isPublished: true },
    });

    const row = await service.create(
      {
        orientationId: 'o1',
        companyId: 10,
        mustCompleteBefore: 'arrival',
      },
      { id: 1, companyId: 10 },
    );

    expect(row.id).toBe('r1');
    expect(prisma.orientationRequirement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          companyId: 10,
          projectId: undefined,
          mustCompleteBefore: 'arrival',
        }),
      }),
    );
  });

  it('creates scoped requirements for project/site/trade/dispatch', async () => {
    prisma.orientationDefinition.findUnique.mockResolvedValue({
      id: 'o1',
      companyId: 10,
      isPublished: true,
    });
    prisma.orientationRequirement.create.mockResolvedValue({ id: 'r2' });

    await service.create(
      {
        orientationId: 'o1',
        companyId: 10,
        projectId: 5,
        siteId: 8,
        tradeId: 'electrician',
        unionDispatchType: 'referral',
        mustCompleteBefore: 'dispatch',
      },
      { id: 1 },
    );

    expect(prisma.orientationRequirement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: 5,
          siteId: 8,
          tradeId: 'electrician',
          unionDispatchType: 'referral',
          mustCompleteBefore: 'dispatch',
        }),
      }),
    );
  });

  it('rejects unpublished orientations as requirements', async () => {
    prisma.orientationDefinition.findUnique.mockResolvedValue({
      id: 'o1',
      companyId: 10,
      isPublished: false,
    });

    await expect(
      service.create(
        {
          orientationId: 'o1',
          companyId: 10,
          mustCompleteBefore: 'arrival',
        },
        { id: 1 },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects cross-company orientationId', async () => {
    prisma.orientationDefinition.findUnique.mockResolvedValue({
      id: 'o1',
      companyId: 99,
      isPublished: true,
    });

    await expect(
      service.create(
        {
          orientationId: 'o1',
          companyId: 10,
          mustCompleteBefore: 'arrival',
        },
        { id: 1 },
      ),
    ).rejects.toThrow(/does not belong/);
  });

  it('resolves published requirements for trade + dispatch worker', async () => {
    prisma.orientationRequirement.findMany.mockResolvedValue([
      {
        id: 'r-company',
        orientationId: 'o-company',
        mustCompleteBefore: 'arrival',
        orientation: { id: 'o-company', isPublished: true, title: 'Company' },
      },
      {
        id: 'r-trade',
        orientationId: 'o-trade',
        mustCompleteBefore: 'dispatch',
        tradeId: 'electrician',
        orientation: { id: 'o-trade', isPublished: true, title: 'Trade' },
      },
      {
        id: 'r-draft',
        orientationId: 'o-draft',
        mustCompleteBefore: 'arrival',
        orientation: { id: 'o-draft', isPublished: false, title: 'Draft' },
      },
    ]);

    const rows = await service.resolveForWorker({
      workerId: 1,
      companyId: 10,
      tradeId: 'electrician',
      unionDispatchType: 'referral',
    });

    expect(rows.map((r) => r.orientationId).sort()).toEqual([
      'o-company',
      'o-trade',
    ]);
    expect(prisma.orientationRequirement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          OR: expect.arrayContaining([
            expect.objectContaining({ tradeId: 'electrician' }),
            expect.objectContaining({ unionDispatchType: 'referral' }),
          ]),
        }),
      }),
    );
  });
});
