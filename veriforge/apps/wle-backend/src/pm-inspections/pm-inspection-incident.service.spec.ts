import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PmSafetyEventsService } from '../pm-safety-events/pm-safety-events.service';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { DomainEvent } from '../modules/api-platform/events/domain-events';
import { PmInspectionIncidentService } from './pm-inspection-incident.service';

describe('PmInspectionIncidentService', () => {
  let service: PmInspectionIncidentService;

  const prisma = {
    pmInspection: { findFirst: jest.fn() },
    pmSafetyEvent: { findFirst: jest.fn() },
  };

  const safetyEvents = {
    createDraft: jest.fn(),
    linkEquipment: jest.fn(),
    addPerson: jest.fn(),
  };

  const eventBus = {
    emit: jest.fn(),
  };

  const templateItems = [
    { id: 'gate', label: 'Gate secure', type: 'pass_fail', critical: true },
    { id: 'housekeeping', label: 'Housekeeping', type: 'pass_fail' },
  ];

  const inspection = {
    id: 'insp-1',
    companyId: 1,
    projectId: 2,
    siteId: 3,
    equipmentId: 10,
    workerId: 20,
    passed: false,
    title: 'Crane walk',
    template: { name: 'Crane daily', items: templateItems },
    deficiencies: [
      {
        id: 'def-1',
        itemId: 'gate',
        title: 'Failed: Gate secure',
        severity: 'critical',
      },
      {
        id: 'def-2',
        itemId: 'housekeeping',
        title: 'Failed: Housekeeping',
        severity: 'medium',
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.pmInspection.findFirst.mockResolvedValue(inspection);
    prisma.pmSafetyEvent.findFirst.mockResolvedValue(null);
    safetyEvents.createDraft.mockResolvedValue({
      id: 'evt-1',
      status: 'draft',
      pmInspectionId: 'insp-1',
    });
    safetyEvents.linkEquipment.mockResolvedValue({});
    safetyEvents.addPerson.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PmInspectionIncidentService,
        { provide: PrismaService, useValue: prisma },
        { provide: PmSafetyEventsService, useValue: safetyEvents },
        { provide: EventBusService, useValue: eventBus },
      ],
    }).compile();

    service = module.get(PmInspectionIncidentService);
  });

  it('detects critical-marked failed checklist items only', async () => {
    await expect(service.hasCriticalMarkedFailedItems('insp-1')).resolves.toBe(
      true,
    );

    prisma.pmInspection.findFirst.mockResolvedValueOnce({
      ...inspection,
      deficiencies: [
        {
          id: 'def-2',
          itemId: 'housekeeping',
          title: 'Failed: Housekeeping',
          severity: 'medium',
        },
      ],
    });
    await expect(service.hasCriticalMarkedFailedItems('insp-1')).resolves.toBe(
      false,
    );
  });

  it('creates draft PM incident linked to inspection, project, equipment, and worker', async () => {
    const result = await service.createDraftIfCriticalOnSubmit('insp-1', 9);
    expect(result?.eventId).toBe('evt-1');
    expect(result?.existing).toBe(false);
    expect(safetyEvents.createDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        pmInspectionId: 'insp-1',
        projectId: 2,
        createdByUserId: 9,
        severity: 'critical',
        mandatoryInvestigation: true,
      }),
    );
    expect(safetyEvents.linkEquipment).toHaveBeenCalledWith(
      'evt-1',
      10,
      'Linked from inspection critical finding',
    );
    expect(safetyEvents.addPerson).toHaveBeenCalledWith('evt-1', {
      workerId: 20,
      role: 'subject',
    });
    expect(eventBus.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: DomainEvent.INCIDENT_CREATED_FROM_INSPECTION,
        projectId: 2,
        data: expect.objectContaining({
          inspectionId: 'insp-1',
          incidentId: 'evt-1',
          projectId: 2,
          equipmentId: 10,
          workerId: 20,
          status: 'draft',
          auto: true,
          criticalFailedItemIds: ['gate'],
        }),
      }),
    );
  });

  it('skips incident creation when only non-critical items failed', async () => {
    prisma.pmInspection.findFirst.mockResolvedValue({
      ...inspection,
      deficiencies: [
        {
          id: 'def-2',
          itemId: 'housekeeping',
          title: 'Failed: Housekeeping',
          severity: 'medium',
        },
      ],
    });
    await expect(
      service.createDraftIfCriticalOnSubmit('insp-1', 9),
    ).resolves.toBeNull();
    expect(safetyEvents.createDraft).not.toHaveBeenCalled();
    expect(eventBus.emit).not.toHaveBeenCalled();
  });

  it('returns existing incident idempotently on resubmit', async () => {
    prisma.pmSafetyEvent.findFirst.mockResolvedValueOnce({
      id: 'evt-existing',
      status: 'draft',
      pmInspectionId: 'insp-1',
    });
    const result = await service.createDraftIncidentFromInspection(
      inspection as never,
      9,
      { auto: true },
    );
    expect(result.existing).toBe(true);
    expect(result.eventId).toBe('evt-existing');
    expect(safetyEvents.createDraft).not.toHaveBeenCalled();
    expect(safetyEvents.linkEquipment).not.toHaveBeenCalled();
    expect(eventBus.emit).not.toHaveBeenCalled();
  });

  it('throws when safety events service is unavailable', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PmInspectionIncidentService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    const isolated = module.get(PmInspectionIncidentService);
    await expect(
      isolated.createDraftIncidentFromInspection(inspection as never, 1),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
