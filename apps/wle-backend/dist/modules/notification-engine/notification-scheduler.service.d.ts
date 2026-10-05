import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { InspectionCoreService } from '../inspection-core/inspection-core.service';
import { MaintenanceCalibrationCoreService } from '../maintenance-calibration-core/maintenance-calibration-core.service';
import { ToolsPpeCoreService } from '../tools-ppe-core/tools-ppe-core.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';
import type { ExpiryRunMetrics } from './notification-scheduler.types';
export type { ExpiryRunMetrics } from './notification-scheduler.types';
export declare class NotificationSchedulerService {
    private readonly prisma;
    private readonly notifications;
    private readonly inspections;
    private readonly maintenanceCalibration;
    private readonly toolsPpe;
    private readonly eventBus?;
    private readonly equipmentCompliance?;
    private readonly logger;
    constructor(prisma: PrismaService, notifications: NotificationsService, inspections: InspectionCoreService, maintenanceCalibration: MaintenanceCalibrationCoreService, toolsPpe: ToolsPpeCoreService, eventBus?: EventBusService, equipmentCompliance?: EquipmentComplianceService);
    runAll(companyId?: number): Promise<{
        inspections: {
            notified: number;
            equipmentCount: number;
        };
        training: ExpiryRunMetrics;
        competency: {
            notified: number;
            evaluations: number;
        };
        equipmentCerts: ExpiryRunMetrics;
        fitTests: {
            notified: number;
            tests: number;
        };
        ppe: {
            notified: number;
            ppeCount: number;
        };
        maintenance: {
            notified: number;
            equipmentCount: number;
        };
        calibration: {
            notified: number;
            equipmentCount: number;
        };
        workerAssignments: {
            notified: number;
            starting: number;
            ending: number;
        };
        equipmentAssignments: {
            notified: number;
            equipmentProjects: number;
            operators: number;
        };
    }>;
    runInspections(companyId?: number): Promise<{
        notified: number;
        equipmentCount: number;
    }>;
    runMaintenance(companyId?: number): Promise<{
        notified: number;
        equipmentCount: number;
    }>;
    runCalibration(companyId?: number): Promise<{
        notified: number;
        equipmentCount: number;
    }>;
    runTrainingExpiry(companyId?: number, withinDays?: number): Promise<ExpiryRunMetrics>;
    runEquipmentCertExpiry(companyId?: number, withinDays?: number): Promise<ExpiryRunMetrics>;
    runFitTestExpiry(companyId?: number, withinDays?: number): Promise<{
        notified: number;
        tests: number;
    }>;
    runCompetencyExpiry(companyId?: number, withinDays?: number): Promise<{
        notified: number;
        evaluations: number;
    }>;
    runPpeExpiry(companyId?: number, withinDays?: number): Promise<{
        notified: number;
        ppeCount: number;
    }>;
    runWorkerAssignments(companyId?: number): Promise<{
        notified: number;
        starting: number;
        ending: number;
    }>;
    runEquipmentAssignments(companyId?: number): Promise<{
        notified: number;
        equipmentProjects: number;
        operators: number;
    }>;
    private startOfDay;
    private emitTrainingReadinessRecalc;
    private recalcEquipmentReadiness;
}
