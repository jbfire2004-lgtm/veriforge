import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PmInspectionsService } from './pm-inspections.service';
import { PmInspectionTemplatesService } from './pm-inspection-templates.service';
import { InspectionTemplateEngine } from './inspection-template.engine';
import { InspectionScoringEngine } from './inspection-scoring.engine';
import { DeficiencyScoringEngine } from './deficiency-scoring.engine';
import { PmInspectionsCailService } from './pm-inspections-cail.service';
import { PmInspectionsEquipmentService } from './pm-inspections-equipment.service';
import { PmInspectionsIngestionService } from './pm-inspections-ingestion.service';
import { PmInspectionIncidentService } from './pm-inspection-incident.service';
import { PmInspectionMeetingService } from './pm-inspection-meeting.service';
import { PmInspectionCompletedEventService } from './pm-inspection-completed-event.service';
import { AuditLogService } from '../audit/audit-log.service';

describe('PmInspectionsService signatures', () => {
  let service: PmInspectionsService;
  const emitOnceOnSubmit = jest.fn().mockResolvedValue({ emitted: true });

  const prisma = {
    pmInspection: {
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    pmInspectionSignature: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    pmInspectionAuditLog: { create: jest.fn() },
    coreFile: { findUnique: jest.fn() },
    pmInspectionDeficiency: { createMany: jest.fn() },
  };

  const inspectionRow = {
    id: 'insp-1',
    status: 'in_progress',
    companyId: 1,
    projectId: 1,
    equipmentId: null,
    workerId: null,
    answers: { a: true },
    template: {
      items: [{ id: 'a', label: 'Check', type: 'pass_fail', required: true }],
      scoringMode: 'pass_fail',
      scoringRules: {},
      requiredSignatures: [
        { role: 'supervisor', label: 'Supervisor' },
        { role: 'worker', label: 'Worker' },
      ],
    },
    deficiencies: [],
    signatures: [],
    attachments: [],
    correctiveActions: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.pmInspection.findFirst.mockResolvedValue(inspectionRow);
    prisma.pmInspectionAuditLog.create.mockResolvedValue({});
    prisma.pmInspectionSignature.findFirst.mockResolvedValue(null);
    prisma.coreFile.findUnique.mockResolvedValue({
      id: 10,
      status: 'COMPLETED',
      publicUrl: 'https://cdn/signature.png',
    });
    prisma.pmInspectionSignature.create.mockResolvedValue({
      id: 'sig-1',
      role: 'supervisor',
      coreFileId: 10,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PmInspectionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PmInspectionTemplatesService, useValue: {} },
        {
          provide: InspectionTemplateEngine,
          useValue: { validateRequired: jest.fn(() => []) },
        },
        {
          provide: InspectionScoringEngine,
          useValue: {
            score: jest.fn(() => ({
              passed: true,
              scorePercent: 100,
              riskScore: 0,
              requiresSupervisorReview: false,
              failedItemIds: [],
            })),
          },
        },
        { provide: DeficiencyScoringEngine, useValue: {} },
        { provide: PmInspectionsCailService, useValue: {} },
        {
          provide: PmInspectionsEquipmentService,
          useValue: { applyLockoutIfNeeded: jest.fn() },
        },
        { provide: PmInspectionsIngestionService, useValue: {} },
        {
          provide: PmInspectionIncidentService,
          useValue: { createDraftIfCriticalOnSubmit: jest.fn() },
        },
        {
          provide: PmInspectionMeetingService,
          useValue: { createDraftIfFailedOnSubmit: jest.fn() },
        },
        {
          provide: PmInspectionCompletedEventService,
          useValue: { emitOnceOnSubmit },
        },
        { provide: AuditLogService, useValue: { logAudit: jest.fn() } },
      ],
    }).compile();

    service = module.get(PmInspectionsService);
  });

  it('addSignature stores uploaded PNG reference', async () => {
    await service.addSignature('insp-1', {
      role: 'supervisor',
      coreFileId: 10,
      signatureData: 'https://cdn/signature.png',
      signerName: 'Jane Sup',
    });

    expect(prisma.pmInspectionSignature.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: 'supervisor',
          coreFileId: 10,
          signerName: 'Jane Sup',
        }),
      }),
    );
  });

  it('addSignature rejects duplicate role', async () => {
    prisma.pmInspectionSignature.findFirst.mockResolvedValue({
      id: 'existing',
    });
    await expect(
      service.addSignature('insp-1', {
        role: 'supervisor',
        signatureData: 'data:image/png;base64,abc',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('submit rejects when required signatures missing', async () => {
    prisma.pmInspectionSignature.findMany.mockResolvedValue([]);
    await expect(service.submit('insp-1', 1)).rejects.toThrow(
      /Missing signature/,
    );
  });

  it('submit rejects when inspection already submitted', async () => {
    prisma.pmInspection.findFirst.mockResolvedValue({
      ...inspectionRow,
      status: 'submitted',
      submittedAt: new Date(),
    });
    await expect(service.submit('insp-1', 1)).rejects.toThrow(
      /already submitted/,
    );
  });

  it('submit succeeds when supervisor and worker signatures exist', async () => {
    prisma.pmInspectionSignature.findMany.mockResolvedValue([
      {
        role: 'supervisor',
        signatureData: 'https://cdn/sup.png',
        coreFileId: 1,
      },
      {
        role: 'worker',
        signatureData: 'https://cdn/worker.png',
        coreFileId: 2,
      },
    ]);
    prisma.pmInspection.update.mockResolvedValue({
      ...inspectionRow,
      status: 'submitted',
      scorePercent: 100,
      passed: true,
    });

    await service.submit('insp-1', 1);
    expect(prisma.pmInspection.update).toHaveBeenCalled();
    expect(emitOnceOnSubmit).toHaveBeenCalledTimes(1);
    expect(emitOnceOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        inspectionId: 'insp-1',
        companyId: 1,
        projectId: 1,
        actorId: 1,
        checklistItems: inspectionRow.template.items,
        score: expect.objectContaining({
          passed: true,
          scorePercent: 100,
          failedItemIds: [],
        }),
        signatures: expect.arrayContaining([
          expect.objectContaining({ role: 'supervisor' }),
          expect.objectContaining({ role: 'worker' }),
        ]),
      }),
    );
  });
});
