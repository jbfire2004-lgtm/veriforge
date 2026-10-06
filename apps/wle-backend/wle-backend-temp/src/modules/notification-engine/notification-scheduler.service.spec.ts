import { Test, TestingModule } from '@nestjs/testing';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';
import { InspectionCoreService } from '../inspection-core/inspection-core.service';
import { MaintenanceCalibrationCoreService } from '../maintenance-calibration-core/maintenance-calibration-core.service';
import { ToolsPpeCoreService } from '../tools-ppe-core/tools-ppe-core.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NOTIFICATION_TYPES } from '../../notifications/notification-types';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationSchedulerService } from './notification-scheduler.service';

describe('NotificationSchedulerService expiry scans', () => {
  let service: NotificationSchedulerService;

  const prisma = {
    trainingRecord: { findMany: jest.fn() },
    user: { findFirst: jest.fn() },
    pmEquipmentCertification: { findMany: jest.fn() },
  };

  const notifications = {
    notifyCompanySupervisors: jest.fn(),
    notifyUsers: jest.fn(),
  };

  const eventBus = { emit: jest.fn() };
  const equipmentCompliance = { recalculate: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    notifications.notifyCompanySupervisors.mockResolvedValue({
      created: 2,
      skipped: 0,
      recipients: 2,
    });
    notifications.notifyUsers.mockResolvedValue({
      created: 1,
      skipped: 0,
      recipients: 1,
    });
    equipmentCompliance.recalculate.mockResolvedValue({ status: 'COMPLIANT' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSchedulerService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notifications },
        {
          provide: InspectionCoreService,
          useValue: { notifyDueInspections: jest.fn() },
        },
        {
          provide: MaintenanceCalibrationCoreService,
          useValue: { notifyDue: jest.fn() },
        },
        {
          provide: ToolsPpeCoreService,
          useValue: { processPpeExpiry: jest.fn() },
        },
        { provide: EventBusService, useValue: eventBus },
        { provide: EquipmentComplianceService, useValue: equipmentCompliance },
      ],
    }).compile();

    service = module.get(NotificationSchedulerService);
  });

  describe('runTrainingExpiry', () => {
    it('notifies supervisors and workers with dedupe keys and emits readiness recalc', async () => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      prisma.trainingRecord.findMany.mockResolvedValue([
        {
          id: 10,
          companyId: 1,
          expiresAt,
          worker: { id: 5, firstName: 'Jane', lastName: 'Doe', companyId: 1 },
          certification: { name: 'Fall Protection' },
        },
      ]);
      prisma.user.findFirst.mockResolvedValue({ id: 99 });

      const metrics = await service.runTrainingExpiry(1);

      expect(metrics).toEqual({
        scanned: 1,
        processed: 1,
        notified: 3,
        skipped: 0,
        readinessRecalc: 1,
        errors: 0,
      });

      const supervisorCall =
        notifications.notifyCompanySupervisors.mock.calls[0];
      expect(supervisorCall[0]).toBe(1);
      expect(supervisorCall[1]).toEqual(
        expect.objectContaining({
          type: NOTIFICATION_TYPES.TRAINING_EXPIRING,
          dedupeKey: expect.stringMatching(
            /^TRAINING_EXPIRING:tr10:\d{4}-\d{2}-\d{2}$/,
          ),
          payload: expect.objectContaining({
            trainingRecordId: 10,
            workerId: 5,
          }),
        }),
      );

      const dedupeKey = supervisorCall[1].dedupeKey as string;
      expect(notifications.notifyUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          userIds: [99],
          dedupeKey: `${dedupeKey}:w5`,
        }),
      );
      expect(eventBus.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: DomainEvent.COMPLIANCE_RECALC,
          companyId: 1,
          entityType: 'training',
          entityId: 10,
          data: expect.objectContaining({
            workerId: 5,
            source: 'training_expiry_scan',
          }),
        }),
      );
    });

    it('counts skipped notifications from notifyUsers without failing the batch', async () => {
      prisma.trainingRecord.findMany.mockResolvedValue([
        {
          id: 11,
          companyId: 2,
          expiresAt: new Date(Date.now() - 1000),
          worker: { id: 6, firstName: 'John', lastName: 'Smith', companyId: 2 },
          certification: null,
        },
      ]);
      prisma.user.findFirst.mockResolvedValue(null);
      notifications.notifyCompanySupervisors.mockResolvedValue({
        created: 0,
        skipped: 2,
        recipients: 2,
      });

      const metrics = await service.runTrainingExpiry();

      expect(metrics.processed).toBe(1);
      expect(metrics.notified).toBe(0);
      expect(metrics.skipped).toBe(2);
      expect(metrics.readinessRecalc).toBe(1);
      expect(notifications.notifyUsers).not.toHaveBeenCalled();
    });
  });

  describe('runEquipmentCertExpiry', () => {
    it('notifies supervisors once per cert per day and recalculates equipment readiness once', async () => {
      const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      prisma.pmEquipmentCertification.findMany.mockResolvedValue([
        {
          id: 20,
          certificationType: 'Annual inspection',
          expiresAt,
          equipment: { id: 7, name: 'Crane A', companyId: 3 },
        },
        {
          id: 21,
          certificationType: 'Load test',
          expiresAt,
          equipment: { id: 7, name: 'Crane A', companyId: 3 },
        },
      ]);

      const metrics = await service.runEquipmentCertExpiry(3);

      expect(metrics).toEqual({
        scanned: 2,
        processed: 2,
        notified: 4,
        skipped: 0,
        readinessRecalc: 1,
        errors: 0,
      });
      expect(notifications.notifyCompanySupervisors).toHaveBeenCalledTimes(2);
      expect(equipmentCompliance.recalculate).toHaveBeenCalledTimes(1);
      expect(equipmentCompliance.recalculate).toHaveBeenCalledWith(7, {
        trigger: 'SCHEDULED',
        notes: 'Daily equipment certification expiry scan',
      });
      expect(eventBus.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: DomainEvent.COMPLIANCE_RECALC,
          entityType: 'equipment',
          entityId: 7,
        }),
      );
    });
  });
});
