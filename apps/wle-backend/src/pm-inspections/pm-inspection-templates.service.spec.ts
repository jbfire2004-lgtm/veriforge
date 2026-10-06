import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { PmInspectionTemplatesService } from './pm-inspection-templates.service';

describe('PmInspectionTemplatesService', () => {
  let service: PmInspectionTemplatesService;

  const draftRow = {
    id: 'tpl-1',
    companyId: 1,
    projectId: 1,
    name: 'Draft template',
    category: 'CUSTOM',
    description: null,
    version: 1,
    scoringMode: 'pass_fail',
    status: 'draft',
    items: [{ id: 'a', label: 'Check', type: 'pass_fail', required: true }],
    scoringRules: { failThresholdPercent: 70 },
    requiredSignatures: [{ role: 'supervisor' }],
    requiredAttachments: [],
    equipmentTypeKeys: [],
    deletedAt: null,
  };

  const prisma = {
    pmInspectionTemplate: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.pmInspectionTemplate.findFirst.mockResolvedValue(draftRow);
    prisma.pmInspectionTemplate.create.mockImplementation(({ data }) =>
      Promise.resolve({ ...draftRow, ...data, id: 'tpl-new' }),
    );
    prisma.pmInspectionTemplate.update.mockImplementation(({ where, data }) =>
      Promise.resolve({ ...draftRow, id: where.id, ...data }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PmInspectionTemplatesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: { logAudit: jest.fn() } },
      ],
    }).compile();

    service = module.get(PmInspectionTemplatesService);
  });

  it('get throws when template missing', async () => {
    prisma.pmInspectionTemplate.findFirst.mockResolvedValueOnce(null);
    await expect(service.get('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('create validates items and stores draft', async () => {
    const row = await service.create({
      companyId: 1,
      name: 'New',
      category: 'CUSTOM',
      items: [{ id: 'x', label: 'Item', type: 'pass_fail' }],
      scoringRules: { failThresholdPercent: 75 },
      requiredSignatures: [{ role: 'worker', label: 'Worker' }],
    });
    expect(row.status).toBe('draft');
    expect(prisma.pmInspectionTemplate.create).toHaveBeenCalled();
  });

  it('rejects create with invalid showIf', async () => {
    await expect(
      service.create({
        companyId: 1,
        name: 'Bad',
        category: 'CUSTOM',
        items: [
          { id: 'a', label: 'A', type: 'pass_fail' },
          {
            id: 'b',
            label: 'B',
            type: 'text',
            showIf: { itemId: 'b', equals: true },
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('update rejects published templates', async () => {
    prisma.pmInspectionTemplate.findFirst.mockResolvedValueOnce({
      ...draftRow,
      status: 'published',
    });
    await expect(
      service.update('tpl-1', { name: 'Changed' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('publish validates and sets published status', async () => {
    const published = await service.publish('tpl-1', 99);
    expect(published.status).toBe('published');
    expect(prisma.pmInspectionTemplate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'published',
          publishedByUserId: 99,
        }),
      }),
    );
  });

  it('archives draft templates', async () => {
    const archived = await service.archive('tpl-1');
    expect(archived.status).toBe('archived');
    expect(prisma.pmInspectionTemplate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'archived' }),
      }),
    );
  });

  it('ensureDefaults seeds company-wide library templates', async () => {
    prisma.pmInspectionTemplate.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    prisma.pmInspectionTemplate.create.mockResolvedValue({
      ...draftRow,
      projectId: null,
      status: 'published',
    });

    const result = await service.ensureDefaults(1, 99);

    expect(result.created).toBeGreaterThan(0);
    expect(prisma.pmInspectionTemplate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          companyId: 1,
          projectId: null,
          status: 'published',
        }),
      }),
    );
  });

  it('ensureDefaults promotes legacy project-scoped system templates', async () => {
    prisma.pmInspectionTemplate.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        ...draftRow,
        projectId: 5,
        name: 'PME — Pre-use inspection',
      });
    prisma.pmInspectionTemplate.update.mockResolvedValue({
      ...draftRow,
      projectId: null,
      name: 'PME — Pre-use inspection',
    });

    await service.ensureDefaults(1, 5);

    expect(prisma.pmInspectionTemplate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { projectId: null },
      }),
    );
  });

  it('newVersion clones parent as draft with incremented version', async () => {
    prisma.pmInspectionTemplate.findFirst.mockResolvedValueOnce({
      ...draftRow,
      status: 'published',
      version: 2,
    });
    const next = await service.newVersion('tpl-1');
    expect(next.version).toBe(3);
    expect(next.status).toBe('draft');
    expect(prisma.pmInspectionTemplate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          parentTemplateId: 'tpl-1',
          version: 3,
          status: 'draft',
        }),
      }),
    );
  });
});
