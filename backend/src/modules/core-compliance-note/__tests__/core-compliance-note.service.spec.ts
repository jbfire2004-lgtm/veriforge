import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CoreComplianceNoteCategory,
  CoreComplianceNotePriority,
  CoreComplianceNoteStatus,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CoreComplianceNoteService } from '../core-compliance-note.service';

describe('CoreComplianceNoteService', () => {
  let service: CoreComplianceNoteService;

  const prisma = {
    company: { findUnique: jest.fn() },
    site: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    coreComplianceNote: {
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
        CoreComplianceNoteService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CoreComplianceNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates with defaults', async () => {
      prisma.company.findUnique.mockResolvedValue(null);
      prisma.site.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.coreComplianceNote.create.mockResolvedValue({
        id: 1,
        title: 'OSHA correspondence',
        body: null,
        category: CoreComplianceNoteCategory.INTERNAL,
        status: CoreComplianceNoteStatus.DRAFT,
        priority: CoreComplianceNotePriority.NORMAL,
        dueAt: null,
        companyId: null,
        siteId: null,
        createdByUserId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: null,
        site: null,
        createdBy: null,
      });

      const row = await service.create({ title: '  OSHA correspondence  ' });

      expect(prisma.coreComplianceNote.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'OSHA correspondence',
            status: CoreComplianceNoteStatus.DRAFT,
          }),
        }),
      );
      expect(row.id).toBe(1);
    });

    it('throws when company missing', async () => {
      prisma.company.findUnique.mockResolvedValue(null);
      await expect(
        service.create({ title: 'T', companyId: 99 }),
      ).rejects.toThrow(HttpException);
      expect(prisma.coreComplianceNote.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('throws when missing', async () => {
      prisma.coreComplianceNote.findUnique.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(HttpException);
    });
  });
});
