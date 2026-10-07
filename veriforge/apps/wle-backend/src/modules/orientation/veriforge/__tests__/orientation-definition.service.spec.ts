import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AuditLogService } from '../../../../audit/audit-log.service';
import { OrientationDefinitionService } from '../orientation-definition.service';

describe('OrientationDefinitionService', () => {
  let service: OrientationDefinitionService;

  const prisma = {
    orientationDefinition: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const auditLog = { logAudit: jest.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrientationDefinitionService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = module.get(OrientationDefinitionService);
  });

  function baseRow(overrides: Record<string, unknown> = {}) {
    return {
      id: 'def-1',
      companyId: 10,
      title: 'Site Safety',
      type: 'site',
      contentMode: 'native',
      contentBlocks: [],
      version: '1.0',
      isPublished: false,
      expiryRules: {},
      metadata: {},
      createdByUserId: 1,
      createdByType: 'company',
      requirements: [],
      ...overrides,
    };
  }

  describe('create', () => {
    it('creates native orientation with validated blocks', async () => {
      prisma.orientationDefinition.create.mockResolvedValue(
        baseRow({ contentMode: 'native' }),
      );

      const row = await service.create({
        companyId: 10,
        title: 'Site Safety',
        type: 'site',
        contentMode: 'native',
        contentBlocks: [
          { id: 'b1', type: 'text', title: 'PPE', body: 'Hard hat', order: 0 },
        ],
        createdByUserId: 1,
      });

      expect(row.contentMode).toBe('native');
      expect(prisma.orientationDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: 10,
            contentMode: 'native',
            version: '1.0',
          }),
        }),
      );
    });

    it('creates uploaded orientation via createFromUpload', async () => {
      prisma.orientationDefinition.create.mockResolvedValue(
        baseRow({ contentMode: 'uploaded', sourceFileKey: 'orientation/10/a.pdf' }),
      );

      const row = await service.createFromUpload({
        companyId: 10,
        title: 'Uploaded deck',
        type: 'company',
        createdByUserId: 1,
        sourceFileKey: 'orientation/10/a.pdf',
      });

      expect(row.contentMode).toBe('uploaded');
      expect(prisma.orientationDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            contentMode: 'uploaded',
            sourceFileKey: 'orientation/10/a.pdf',
          }),
        }),
      );
    });

    it('creates hybrid contentMode', async () => {
      prisma.orientationDefinition.create.mockResolvedValue(
        baseRow({ contentMode: 'hybrid' }),
      );
      await service.create({
        companyId: 10,
        title: 'Hybrid',
        type: 'safety',
        contentMode: 'hybrid',
        createdByUserId: 1,
        contentBlocks: [{ id: 's1', type: 'slide', order: 0 }],
      });
      expect(prisma.orientationDefinition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ contentMode: 'hybrid' }),
        }),
      );
    });

    it('requires title', async () => {
      await expect(
        service.create({
          companyId: 10,
          title: '   ',
          type: 'company',
          createdByUserId: 1,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects malformed contentBlocks', async () => {
      await expect(
        service.create({
          companyId: 10,
          title: 'Bad',
          type: 'company',
          createdByUserId: 1,
          contentBlocks: [{ type: 'bogus' } as never],
        }),
      ).rejects.toThrow(/type must be one of/);
    });
  });

  describe('versioning', () => {
    it('bumps 1.0 → 1.1 when content changes', async () => {
      prisma.orientationDefinition.findUnique.mockResolvedValue(baseRow());
      prisma.orientationDefinition.update.mockResolvedValue(
        baseRow({ version: '1.1', isPublished: true }),
      );

      const updated = await service.update(
        'def-1',
        {
          contentBlocks: [
            { id: 'b1', type: 'text', title: 'Updated', body: 'x', order: 0 },
          ],
          isPublished: true,
        },
        { id: 1, companyId: 10 },
      );

      expect(updated.version).toBe('1.1');
      expect(prisma.orientationDefinition.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ version: '1.1' }),
        }),
      );
    });

    it('does not bump when bumpVersion is false', async () => {
      prisma.orientationDefinition.findUnique.mockResolvedValue(baseRow());
      prisma.orientationDefinition.update.mockResolvedValue(baseRow());

      await service.update(
        'def-1',
        {
          contentBlocks: [{ id: 't1', type: 'text', order: 0 }],
          bumpVersion: false,
        },
        { id: 1, companyId: 10 },
      );

      expect(prisma.orientationDefinition.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ version: '1.0' }),
        }),
      );
    });
  });

  describe('tenant isolation', () => {
    it('forbids get across companies', async () => {
      prisma.orientationDefinition.findUnique.mockResolvedValue(baseRow());
      await expect(service.get('def-1', { companyId: 99 })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('lists only within company filter', async () => {
      prisma.orientationDefinition.findMany.mockResolvedValue([]);
      await service.list({ companyId: 10, isPublished: true });
      expect(prisma.orientationDefinition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId: 10, isPublished: true }),
          take: 200,
        }),
      );
    });
  });
});
