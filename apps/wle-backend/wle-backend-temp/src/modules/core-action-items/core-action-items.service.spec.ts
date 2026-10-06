import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreActionItemsService } from './core-action-items.service';

describe('CoreActionItemsService', () => {
  let service: CoreActionItemsService;

  const prisma = {
    company: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    coreMeetingRecord: { findUnique: jest.fn() },
    coreDailyLog: { findUnique: jest.fn() },
    coreActionItem: {
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
        CoreActionItemsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(CoreActionItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates with defaults and validates company', async () => {
      prisma.company.findUnique.mockResolvedValue({ id: 1 });
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.coreMeetingRecord.findUnique.mockResolvedValue(null);
      prisma.coreDailyLog.findUnique.mockResolvedValue(null);
      prisma.coreActionItem.create.mockResolvedValue({
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        title: 'Fix guardrail',
        status: 'OPEN',
        priority: 'NORMAL',
        companyId: 1,
        dueAt: null,
        description: null,
        createdById: null,
        coreMeetingRecordId: null,
        coreDailyLogId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: { id: 1, name: 'Acme' },
        createdBy: null,
        coreMeetingRecord: null,
        coreDailyLog: null,
      });

      const row = await service.create({
        title: 'Fix guardrail',
        companyId: 1,
      });

      expect(prisma.company.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.coreActionItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Fix guardrail',
            status: 'OPEN',
            priority: 'NORMAL',
            companyId: 1,
            coreMeetingRecordId: null,
            coreDailyLogId: null,
          }),
        }),
      );
      expect(row.id).toBeDefined();
    });

    it('inherits company from meeting when coreMeetingRecordId set', async () => {
      prisma.coreMeetingRecord.findUnique.mockResolvedValue({
        id: 10,
        companyId: 2,
      });
      prisma.company.findUnique.mockResolvedValue({ id: 2 });
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.coreDailyLog.findUnique.mockResolvedValue(null);
      prisma.coreActionItem.create.mockResolvedValue({
        id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        title: 'Follow up',
        status: 'OPEN',
        priority: 'NORMAL',
        companyId: 2,
        dueAt: null,
        description: null,
        createdById: null,
        coreMeetingRecordId: 10,
        coreDailyLogId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        company: { id: 2, name: 'Beta' },
        createdBy: null,
        coreMeetingRecord: {
          id: 10,
          title: 'Toolbox',
          heldAt: new Date(),
          meetingType: 'TOOLBOX',
        },
        coreDailyLog: null,
      });

      await service.create({
        title: 'Follow up',
        coreMeetingRecordId: 10,
      });

      expect(prisma.coreActionItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: 2,
            coreMeetingRecordId: 10,
            coreDailyLogId: null,
          }),
        }),
      );
    });

    it('throws when both meeting and daily log are linked', async () => {
      await expect(
        service.create({
          title: 'Conflict',
          coreMeetingRecordId: 1,
          coreDailyLogId: 2,
        }),
      ).rejects.toThrow(HttpException);
      expect(prisma.coreActionItem.create).not.toHaveBeenCalled();
    });

    it('throws when company missing', async () => {
      prisma.company.findUnique.mockResolvedValue(null);
      await expect(
        service.create({ title: 'T', companyId: 99 }),
      ).rejects.toThrow(HttpException);
      expect(prisma.coreActionItem.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('throws HttpException when missing', async () => {
      prisma.coreActionItem.findUnique.mockResolvedValue(null);
      await expect(
        service.findOne('a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
      ).rejects.toThrow(HttpException);
    });
  });
});
