import { Test, TestingModule } from '@nestjs/testing';

import { DomainEvent } from '../modules/api-platform/events/domain-events';

import { EventBusService } from '../modules/api-platform/events/event-bus.service';

import { PrismaService } from '../prisma/prisma.service';

import {
  buildFindings,
  buildSignatures,
  PmInspectionCompletedEventService,
} from './pm-inspection-completed-event.service';

import { INSPECTION_COMPLETED_AUDIT_EVENT } from './pm-inspection-completed-event.types';

import type { ChecklistItemDef } from './pm-inspections.constants';

describe('PmInspectionCompletedEventService', () => {
  let service: PmInspectionCompletedEventService;

  const eventBus = { emit: jest.fn() };

  const prisma = {
    pmInspectionAuditLog: {
      findFirst: jest.fn(),

      create: jest.fn(),
    },

    pmInspectionDeficiency: { findMany: jest.fn() },

    pmInspectionPhotoFinding: { findMany: jest.fn() },
  };

  const checklistItems: ChecklistItemDef[] = [
    {
      id: 'item-a',
      label: 'Guard in place',
      type: 'pass_fail',
      required: true,
      critical: true,
    },

    { id: 'item-b', label: 'Area clean', type: 'pass_fail', required: true },
  ];

  const score = {
    scorePercent: 40,

    passed: false,

    riskScore: 72,

    requiresSupervisorReview: true,

    failedItemIds: ['item-a', 'item-b'],

    explainability: [],
  };

  const signatures = [
    {
      role: 'supervisor',

      signerName: 'Jane Sup',

      signedAt: new Date('2026-06-01T12:00:00Z'),

      coreFileId: 10,
    },

    {
      role: 'worker',

      signerName: 'John Worker',

      signedAt: new Date('2026-06-01T12:05:00Z'),

      coreFileId: 11,
    },
  ];

  const emitInput = {
    inspectionId: 'insp-1',

    companyId: 1,

    projectId: 2,

    actorId: 99,

    score,

    signatures,

    checklistItems,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma.pmInspectionAuditLog.findFirst.mockResolvedValue(null);

    prisma.pmInspectionAuditLog.create.mockResolvedValue({ id: 'audit-1' });

    prisma.pmInspectionDeficiency.findMany.mockResolvedValue([
      {
        id: 'def-1',

        itemId: 'item-a',

        title: 'Missing guard',

        severity: 'critical',

        category: 'Guarding',
      },
    ]);

    prisma.pmInspectionPhotoFinding.findMany.mockResolvedValue([
      {
        id: 'pf-1',

        title: 'Exposed wiring',

        severity: 'high',

        category: 'Electrical',
      },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PmInspectionCompletedEventService,

        { provide: PrismaService, useValue: prisma },

        { provide: EventBusService, useValue: eventBus },
      ],
    }).compile();

    service = module.get(PmInspectionCompletedEventService);
  });

  it('builds findings and signatures for the domain payload', () => {
    const findings = buildFindings(
      [
        {
          id: 'def-1',

          itemId: 'item-a',

          title: 'Missing guard',

          severity: 'critical',

          category: 'Guarding',
        },
      ],

      [
        {
          id: 'pf-1',

          title: 'Exposed wiring',

          severity: 'high',

          category: 'Electrical',
        },
      ],
    );

    expect(findings).toHaveLength(2);

    expect(findings[0].kind).toBe('deficiency');

    expect(findings[1].kind).toBe('photo_finding');

    const sigs = buildSignatures(signatures);

    expect(sigs).toHaveLength(2);

    expect(sigs[0].role).toBe('supervisor');

    expect(sigs[0].signedAt).toBe('2026-06-01T12:00:00.000Z');
  });

  it('builds critical flags from template-marked failed checklist items', () => {
    const flags = service.buildCriticalFlags(
      checklistItems,
      score.failedItemIds,
    );

    expect(flags).toEqual([
      { itemId: 'item-a', label: 'Guard in place', failed: true },
    ]);
  });

  it('emits INSPECTION_COMPLETED on checklist submit with full payload', async () => {
    const result = await service.emitOnceOnSubmit(emitInput);

    expect(result.emitted).toBe(true);

    expect(result.data?.score.scorePercent).toBe(40);

    expect(result.data?.findings).toHaveLength(2);

    expect(result.data?.signatures).toHaveLength(2);

    expect(result.data?.signaturesPresent).toBe(true);

    expect(result.data?.findingsSummary).toEqual({
      deficiencyCount: 1,

      photoFindingCount: 1,

      criticalDeficiencyCount: 1,

      criticalFailedItemCount: 1,
    });

    expect(result.data?.criticalFlags).toEqual([
      { itemId: 'item-a', label: 'Guard in place', failed: true },
    ]);

    expect(eventBus.emit).toHaveBeenCalledTimes(1);

    expect(eventBus.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: DomainEvent.INSPECTION_COMPLETED,

        entityType: 'pm_inspection',

        entityId: 'insp-1',

        actorId: 99,

        companyId: 1,

        projectId: 2,

        data: expect.objectContaining({
          inspectionId: 'insp-1',

          source: 'checklist_submit',

          checklistSubmit: true,

          passed: false,

          scorePercent: 40,

          signaturesPresent: true,

          score: expect.objectContaining({
            passed: false,

            failedItemCount: 2,
          }),

          findingsSummary: expect.objectContaining({
            criticalFailedItemCount: 1,
          }),

          criticalFlags: [
            { itemId: 'item-a', label: 'Guard in place', failed: true },
          ],

          findings: expect.any(Array),

          signatures: expect.any(Array),
        }),
      }),
    );

    expect(prisma.pmInspectionAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          inspectionId: 'insp-1',

          eventType: INSPECTION_COMPLETED_AUDIT_EVENT,

          payload: expect.objectContaining({
            source: 'checklist_submit',

            signaturesPresent: true,

            criticalFailedItemCount: 1,
          }),
        }),
      }),
    );
  });

  it('does not emit a second INSPECTION_COMPLETED for the same inspection', async () => {
    prisma.pmInspectionAuditLog.findFirst.mockResolvedValue({ id: 'existing' });

    const result = await service.emitOnceOnSubmit(emitInput);

    expect(result.emitted).toBe(false);

    expect(eventBus.emit).not.toHaveBeenCalled();

    expect(prisma.pmInspectionAuditLog.create).not.toHaveBeenCalled();
  });
});
