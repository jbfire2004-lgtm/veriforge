import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AuditLogService } from '../../../../audit/audit-log.service';
import { OrientationDeliveryService } from '../orientation-delivery.service';

describe('OrientationDeliveryService (security)', () => {
  let service: OrientationDeliveryService;

  const prisma = {
    orientationDefinition: { findUnique: jest.fn() },
    worker: { findUnique: jest.fn() },
    orientationDeliveryLink: { upsert: jest.fn() },
  };

  const auditLog = { logAudit: jest.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrientationDeliveryService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = module.get(OrientationDeliveryService);
  });

  it('rejects assigning unpublished orientations', async () => {
    prisma.orientationDefinition.findUnique.mockResolvedValue({
      id: 'o1',
      companyId: 10,
      isPublished: false,
      title: 'Draft',
      version: '1.0',
    });

    await expect(
      service.assign({
        workerId: 7,
        orientationId: 'o1',
        companyId: 10,
        assignedById: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('assigns published orientation and returns wallet card', async () => {
    prisma.orientationDefinition.findUnique.mockResolvedValue({
      id: 'o1',
      companyId: 10,
      isPublished: true,
      title: 'Site Safety',
      version: '1.1',
    });
    prisma.worker.findUnique.mockResolvedValue({ id: 7 });
    prisma.orientationDeliveryLink.upsert.mockResolvedValue({
      id: 'd1',
      deepLink: 'http://localhost:5175/vera/onboarding/orientation/o1?workerId=7',
    });

    const result = await service.assign({
      workerId: 7,
      orientationId: 'o1',
      companyId: 10,
      assignedById: 1,
    });

    expect(result.walletCard).toMatchObject({
      cardType: 'orientation',
      title: 'Site Safety',
      orientationId: 'o1',
      status: 'assigned',
    });
    expect(result.deepLink).toContain('/onboarding/orientation/o1');
  });
});
