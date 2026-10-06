import { Test } from '@nestjs/testing';
import { OrientationAccessService } from '../modules/orientation/orientation-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { ComplianceCalendarAiService } from './compliance-calendar-ai.service';

describe('ComplianceCalendarAiService', () => {
  let service: ComplianceCalendarAiService;

  const now = new Date();
  const in10 = new Date(now.getTime() + 10 * 86_400_000);
  const ago5 = new Date(now.getTime() - 5 * 86_400_000);

  const prisma = {
    trainingRecord: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          projectId: 10,
          expiresAt: in10,
          worker: { id: 5, firstName: 'Sam', lastName: 'Lee' },
          certification: { name: 'Fall Protection' },
        },
        {
          id: 2,
          projectId: 10,
          expiresAt: ago5,
          worker: { id: 6, firstName: 'Alex', lastName: 'Kim' },
          certification: { name: 'Fall Protection' },
        },
      ]),
    },
    pmPermit: { findMany: jest.fn().mockResolvedValue([]) },
    credential: { findMany: jest.fn().mockResolvedValue([]) },
    pmEquipmentCertification: { findMany: jest.fn().mockResolvedValue([]) },
    worker: {
      findMany: jest
        .fn()
        .mockResolvedValue([{ id: 6, firstName: 'Alex', lastName: 'Kim' }]),
    },
  } as unknown as PrismaService;

  const orientationAccess = {
    evaluateWorker: jest.fn().mockResolvedValue({
      allowed: false,
      blockingPackages: [
        {
          packageId: 'pkg-1',
          title: 'Site Orientation',
          status: 'NOT_STARTED',
          requiredVersion: 1,
        },
      ],
    }),
  } as unknown as OrientationAccessService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ComplianceCalendarAiService,
        { provide: PrismaService, useValue: prisma },
        { provide: OrientationAccessService, useValue: orientationAccess },
      ],
    }).compile();

    service = module.get(ComplianceCalendarAiService);
  });

  it('returns compliance calendar JSON with expiries, risks, and notifications', async () => {
    const result = await service.analyze({
      companyId: 1,
      projectId: 10,
      horizonDays: 90,
    });

    expect(result.upcoming_expiries.length).toBeGreaterThan(0);
    expect(
      result.upcoming_expiries.some((e) => e.entity_type === 'training'),
    ).toBe(true);
    expect(result.risk_items.length).toBeGreaterThan(0);
    expect(result.notifications.length).toBeGreaterThan(0);
    expect(
      result.notifications.some((n) => n.recipient_role === 'worker'),
    ).toBe(true);
    expect(
      result.notifications.some((n) => n.recipient_role === 'supervisor'),
    ).toBe(true);
    expect(result.bulk_actions.length).toBeGreaterThan(0);
    expect(result.source).toBe('rule_engine');
  });

  it('rejects missing companyId', async () => {
    await expect(service.analyze({ companyId: 0 })).rejects.toThrow(
      /companyId/i,
    );
  });
});
