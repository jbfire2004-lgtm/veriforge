import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CoreSiteRiskCategory,
  CoreSiteRiskSeverity,
  CoreSiteRiskStatus,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CoreSiteRiskService } from '../core-site-risk.service';

describe('CoreSiteRiskService', () => {
  let service: CoreSiteRiskService;

  const prisma = {
    company: { findUnique: jest.fn() },
    site: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    coreSiteRisk: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((ops: unknown[]) =>
      Promise.all(ops),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreSiteRiskService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CoreSiteRiskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates with validated company', async () => {
      prisma.company.findUnique.mockResolvedValue({ id: 1 });
      prisma.site.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.coreSiteRisk.create.mockResolvedValue({
        id: 1,
        title: 'Open trench',
        description: null,
        category: CoreSiteRiskCategory.OTHER,
        severity: CoreSiteRiskSeverity.HIGH,
        status: CoreSiteRiskStatus.OPEN,
        identifiedAt: new Date('2026-05-01T12:00:00.000Z'),
        mitigatedAt: null,
        locationNote: null,
        companyId: 1,
        siteId: null,
        ownerUserId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: { id: 1, name: 'Acme' },
        site: null,
        owner: null,
      });

      const row = await service.create({
        title: 'Open trench',
        identifiedAt: '2026-05-01T12:00:00.000Z',
        companyId: 1,
        severity: CoreSiteRiskSeverity.HIGH,
      });

      expect(prisma.coreSiteRisk.create).toHaveBeenCalled();
      expect(row.id).toBe(1);
    });

    it('throws when company missing', async () => {
      prisma.company.findUnique.mockResolvedValue(null);
      await expect(
        service.create({
          title: 'T',
          identifiedAt: '2026-05-01T12:00:00.000Z',
          companyId: 99,
        }),
      ).rejects.toThrow(HttpException);
      expect(prisma.coreSiteRisk.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('throws HttpException when missing', async () => {
      prisma.coreSiteRisk.findUnique.mockResolvedValue(null);
      await expect(service.findOne(404)).rejects.toThrow(HttpException);
    });
  });
});
