import {
  HttpException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreActionItemsModule } from '../core-action-items/core-action-items.module';
import { CoreActionItemsService } from '../core-action-items/core-action-items.service';
import { CoreComplianceNoteService } from '../core-compliance-note/core-compliance-note.service';
import { CoreMeetingRecordService } from '../core-meeting-record/core-meeting-record.service';
import { CoreDailyLogService } from '../core-daily-log/core-daily-log.service';

/**
 * Cross-cutting operational CRUD: validation, parent XOR, list filters, delete entrypoints.
 */
describe('Operational CRUD (integration)', () => {
  describe('CoreActionItemsController + ValidationPipe', () => {
    let app: INestApplication;

    const prismaMock = {
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
      $transaction: jest.fn((ops: unknown[]) => Promise.all(ops as [])),
    };

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [CoreActionItemsModule],
      })
        .overrideProvider(PrismaService)
        .useValue(prismaMock)
        .compile();

      app = moduleFixture.createNestApplication();
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    beforeEach(() => {
      jest.clearAllMocks();
      prismaMock.$transaction.mockImplementation((ops: unknown[]) =>
        Promise.all(ops as []),
      );
    });

    it('POST /api/v1/core-action-items returns 400 when both parent ids are set', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/core-action-items')
        .send({
          title: 'Invalid',
          coreMeetingRecordId: 1,
          coreDailyLogId: 2,
        })
        .expect(400);
      expect(prismaMock.coreActionItem.create).not.toHaveBeenCalled();
    });

    it('POST returns 400 when title is empty string (strict DTO)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/core-action-items')
        .send({ title: '' })
        .expect(400);
    });
  });

  describe('CoreActionItemsService update / linking', () => {
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
      $transaction: jest.fn((ops: unknown[]) => Promise.all(ops as [])),
    };

    beforeEach(async () => {
      jest.clearAllMocks();
      prisma.$transaction.mockImplementation((ops: unknown[]) =>
        Promise.all(ops as []),
      );
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CoreActionItemsService,
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      service = module.get(CoreActionItemsService);
    });

    it('throws when PATCH sets both parents to non-null ids', async () => {
      prisma.coreActionItem.findUnique.mockResolvedValue({
        companyId: 1,
        coreMeetingRecordId: null,
        coreDailyLogId: null,
      });
      await expect(
        service.update('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', {
          coreMeetingRecordId: 1,
          coreDailyLogId: 2,
        }),
      ).rejects.toThrow(HttpException);
      expect(prisma.coreActionItem.update).not.toHaveBeenCalled();
    });

    it('clears daily log when linking a meeting', async () => {
      prisma.coreActionItem.findUnique.mockResolvedValue({
        companyId: 1,
        coreMeetingRecordId: null,
        coreDailyLogId: 9,
      });
      prisma.coreMeetingRecord.findUnique.mockResolvedValue({
        id: 3,
        companyId: 1,
      });
      prisma.coreActionItem.update.mockResolvedValue({});

      await service.update('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', {
        coreMeetingRecordId: 3,
      });

      expect(prisma.coreActionItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            coreMeetingRecordId: 3,
            coreDailyLogId: null,
          }),
        }),
      );
    });

    it('clears meeting when linking a daily log', async () => {
      prisma.coreActionItem.findUnique.mockResolvedValue({
        companyId: 1,
        coreMeetingRecordId: 7,
        coreDailyLogId: null,
      });
      prisma.coreDailyLog.findUnique.mockResolvedValue({
        id: 4,
        companyId: 1,
      });
      prisma.coreMeetingRecord.findUnique.mockResolvedValue({
        id: 7,
        companyId: 1,
      });
      prisma.coreActionItem.update.mockResolvedValue({});

      await service.update('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', {
        coreDailyLogId: 4,
      });

      expect(prisma.coreActionItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            coreDailyLogId: 4,
            coreMeetingRecordId: null,
          }),
        }),
      );
    });
  });

  describe('CoreMeetingRecordService list dates', () => {
    let service: CoreMeetingRecordService;
    const prisma = {
      coreMeetingRecord: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        groupBy: jest.fn(),
      },
      company: { findUnique: jest.fn() },
      site: { findUnique: jest.fn() },
      user: { findUnique: jest.fn() },
      $transaction: jest.fn((ops: unknown[]) => Promise.all(ops as [])),
    };

    beforeEach(async () => {
      jest.clearAllMocks();
      prisma.$transaction.mockImplementation((ops: unknown[]) =>
        Promise.all(ops as []),
      );
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CoreMeetingRecordService,
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      service = module.get(CoreMeetingRecordService);
    });

    it('throws when heldFrom is after heldTo', async () => {
      await expect(
        service.findAll({
          heldFrom: '2026-06-10',
          heldTo: '2026-01-01',
        }),
      ).rejects.toThrow(HttpException);
    });

    it('remove calls prisma delete (action items get SetNull via FK at DB)', async () => {
      prisma.coreMeetingRecord.findUnique.mockResolvedValue({
        id: 1,
        title: 'M',
        company: null,
        site: null,
        recordedBy: null,
        coreActionItems: [],
      });
      prisma.coreMeetingRecord.delete.mockResolvedValue({});
      await service.remove(1);
      expect(prisma.coreMeetingRecord.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('CoreDailyLogService delete', () => {
    let service: CoreDailyLogService;
    const prisma = {
      coreDailyLog: {
        findUnique: jest.fn().mockResolvedValue({ id: 1 }),
        delete: jest.fn().mockResolvedValue({}),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      company: { findUnique: jest.fn() },
      site: { findUnique: jest.fn() },
      user: { findUnique: jest.fn() },
      $transaction: jest.fn((ops: unknown[]) => Promise.all(ops as [])),
    };

    beforeEach(async () => {
      jest.clearAllMocks();
      prisma.$transaction.mockImplementation((ops: unknown[]) =>
        Promise.all(ops as []),
      );
      prisma.coreDailyLog.findUnique.mockResolvedValue({ id: 1 });
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CoreDailyLogService,
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      service = module.get(CoreDailyLogService);
    });

    it('remove calls prisma delete (FK SetNull on action items is DB-enforced)', async () => {
      await service.remove(1);
      expect(prisma.coreDailyLog.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('CoreComplianceNoteService list due range', () => {
    let service: CoreComplianceNoteService;
    const prisma = {
      coreComplianceNote: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      company: { findUnique: jest.fn() },
      site: { findUnique: jest.fn() },
      user: { findUnique: jest.fn() },
      $transaction: jest.fn((ops: unknown[]) => Promise.all(ops as [])),
    };

    beforeEach(async () => {
      jest.clearAllMocks();
      prisma.$transaction.mockImplementation((ops: unknown[]) =>
        Promise.all(ops as []),
      );
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CoreComplianceNoteService,
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      service = module.get(CoreComplianceNoteService);
    });

    it('throws when dueFrom is after dueTo', async () => {
      await expect(
        service.findAll({
          dueFrom: '2026-12-31',
          dueTo: '2026-01-01',
        }),
      ).rejects.toThrow(HttpException);
    });
  });
});
