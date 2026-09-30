import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit/audit-log.service';
import { PmInspectionTemplatesService } from './pm-inspection-templates.service';
import { PmInspectionsService } from './pm-inspections.service';
import { InspectionTemplateEngine } from './inspection-template.engine';
import { InspectionScoringEngine } from './inspection-scoring.engine';
import { DeficiencyScoringEngine } from './deficiency-scoring.engine';
import { PmInspectionsCailService } from './pm-inspections-cail.service';
import { PmInspectionsEquipmentService } from './pm-inspections-equipment.service';
import { PmInspectionsIngestionService } from './pm-inspections-ingestion.service';
import { PmInspectionIncidentService } from './pm-inspection-incident.service';
import { PmInspectionMeetingService } from './pm-inspection-meeting.service';
import { PmInspectionCompletedEventService } from './pm-inspection-completed-event.service';

describe('PM inspection template usage', () => {
  let templates: PmInspectionTemplatesService;
  let inspections: PmInspectionsService;

  const publishedTemplate = {
    id: 'tpl-published',
    companyId: 1,
    projectId: 1,
    name: 'Site walk',
    category: 'SITE',
    description: null,
    version: 1,
    scoringMode: 'pass_fail',
    status: 'published',
    items: [
      {
        id: 'gate',
        label: 'Gate secure',
        type: 'pass_fail',
        required: true,
        critical: true,
      },
    ],
    scoringRules: { failThresholdPercent: 100 },
    requiredSignatures: [{ role: 'supervisor', label: 'Supervisor' }],
    requiredAttachments: [],
    equipmentTypeKeys: [],
    deletedAt: null,
  };

  const draftTemplate = {
    ...publishedTemplate,
    id: 'tpl-draft',
    status: 'draft',
  };

  const prisma = {
    pmInspectionTemplate: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    pmInspection: { create: jest.fn() },
    pmInspectionAudit: { create: jest.fn() },
  };

  const auditLog = { logAudit: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.pmInspectionTemplate.findFirst.mockImplementation(({ where }) => {
      if (where.id === publishedTemplate.id)
        return Promise.resolve(publishedTemplate);
      if (where.id === draftTemplate.id) return Promise.resolve(draftTemplate);
      return Promise.resolve(null);
    });
    prisma.pmInspectionTemplate.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'tpl-new', status: 'draft', ...data }),
    );
    prisma.pmInspectionTemplate.update.mockImplementation(({ where, data }) =>
      Promise.resolve({ ...publishedTemplate, id: where.id, ...data }),
    );
    prisma.pmInspection.create.mockImplementation(({ data }) =>
      Promise.resolve({
        id: 'insp-1',
        ...data,
        template: publishedTemplate,
        deficiencies: [],
        signatures: [],
      }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PmInspectionTemplatesService,
        PmInspectionsService,
        InspectionTemplateEngine,
        InspectionScoringEngine,
        DeficiencyScoringEngine,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: PmInspectionsCailService, useValue: {} },
        {
          provide: PmInspectionsEquipmentService,
          useValue: { applyLockoutIfNeeded: jest.fn() },
        },
        { provide: PmInspectionsIngestionService, useValue: {} },
        { provide: PmInspectionIncidentService, useValue: {} },
        { provide: PmInspectionMeetingService, useValue: {} },
        {
          provide: PmInspectionCompletedEventService,
          useValue: { emitOnceOnSubmit: jest.fn() },
        },
      ],
    }).compile();

    templates = module.get(PmInspectionTemplatesService);
    inspections = module.get(PmInspectionsService);
  });

  it('rejects inspections created from draft templates', async () => {
    await expect(
      inspections.createFromTemplate({
        templateId: draftTemplate.id,
        companyId: 1,
        projectId: 1,
        inspectorUserId: 9,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates inspections from published templates', async () => {
    const row = await inspections.createFromTemplate({
      templateId: publishedTemplate.id,
      companyId: 1,
      projectId: 1,
      inspectorUserId: 9,
    });
    expect(row.id).toBe('insp-1');
    expect(prisma.pmInspection.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          templateId: publishedTemplate.id,
          templateVersion: 1,
          status: 'draft',
        }),
      }),
    );
  });

  it('archives draft and published templates', async () => {
    prisma.pmInspectionTemplate.findFirst.mockResolvedValueOnce(draftTemplate);
    const archivedDraft = await templates.archive(draftTemplate.id);
    expect(archivedDraft.status).toBe('archived');

    prisma.pmInspectionTemplate.findFirst.mockResolvedValueOnce(
      publishedTemplate,
    );
    const archivedPublished = await templates.archive(publishedTemplate.id);
    expect(archivedPublished.status).toBe('archived');
  });

  it('stores critical flags on template items', async () => {
    const created = await templates.create({
      companyId: 1,
      name: 'Critical gate',
      category: 'CUSTOM',
      items: [{ id: 'gate', label: 'Gate', type: 'pass_fail', critical: true }],
    });
    const items = created.items as Array<{ critical?: boolean }>;
    expect(items[0]?.critical).toBe(true);
  });
});
