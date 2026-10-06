import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SafetyObservationSeverity } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { SafetyObservationService } from '../safety-observation.service';

describe('SafetyObservationService', () => {
  let service: SafetyObservationService;

  const prisma = {
    company: { findUnique: jest.fn() },
    site: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    safetyObservation: {
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
        SafetyObservationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(SafetyObservationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates with validated company and observedAt', async () => {
      prisma.company.findUnique.mockResolvedValue({ id: 1 });
      prisma.site.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.safetyObservation.create.mockResolvedValue({
        id: 1,
        title: 'Oil sheen near sump',
        description: null,
        severity: SafetyObservationSeverity.MEDIUM,
        status: 'OPEN',
        observedAt: new Date('2026-05-01T12:00:00.000Z'),
        locationNote: null,
        companyId: 1,
        siteId: null,
        reportedByUserId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: { id: 1, name: 'Acme' },
        site: null,
        reportedBy: null,
      });

      const row = await service.create({
        title: 'Oil sheen near sump',
        observedAt: '2026-05-01T12:00:00.000Z',
        companyId: 1,
      });

      expect(prisma.safetyObservation.create).toHaveBeenCalled();
      expect(row.id).toBe(1);
    });

    it('throws when company missing', async () => {
      prisma.company.findUnique.mockResolvedValue(null);
      await expect(
        service.create({
          title: 'T',
          observedAt: '2026-05-01T12:00:00.000Z',
          companyId: 99,
        }),
      ).rejects.toThrow(HttpException);
      expect(prisma.safetyObservation.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('throws HttpException when missing', async () => {
      prisma.safetyObservation.findUnique.mockResolvedValue(null);
      await expect(service.findOne(404)).rejects.toThrow(HttpException);
    });
  });
});
