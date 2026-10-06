import { Injectable } from '@nestjs/common';
import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';
import { InspectionCoreService } from '../inspection-core/inspection-core.service';
import { CompetencyService } from '../competency/competency.service';
import { ToolsPpeCoreService } from '../tools-ppe-core/tools-ppe-core.service';
import { MaintenanceCalibrationCoreService } from '../maintenance-calibration-core/maintenance-calibration-core.service';
import { NotificationSchedulerService } from '../notification-engine/notification-scheduler.service';

/**
 * Unified BFF aggregating all domain modules for dashboards and employer views.
 */
@Injectable()
export class VeraPlatformService {
  constructor(
    private readonly reporting: ReportingCoreService,
    private readonly equipmentCompliance: EquipmentComplianceService,
    private readonly inspections: InspectionCoreService,
    private readonly competency: CompetencyService,
    private readonly toolsPpe: ToolsPpeCoreService,
    private readonly maintenanceCalibration: MaintenanceCalibrationCoreService,
    private readonly notificationScheduler: NotificationSchedulerService,
  ) {}

  async getPlatformSummary(companyId?: number) {
    const [
      reportingOverview,
      equipment,
      inspections,
      competency,
      toolsPpe,
      maintenance,
    ] = await Promise.all([
      this.reporting.overview(companyId),
      this.equipmentCompliance.dashboard(companyId),
      this.inspections.dashboard(companyId),
      this.competency.dashboard(companyId),
      this.toolsPpe.dashboard(companyId),
      this.maintenanceCalibration.dashboard(companyId),
    ]);

    return {
      companyId: companyId ?? null,
      generatedAt: new Date().toISOString(),
      modules: {
        reporting: reportingOverview,
        equipment: {
          total: equipment.total,
          compliant: equipment.compliant,
          needsAttention: equipment.needsAttention,
          nonCompliant: equipment.nonCompliant,
          lockedOut: equipment.lockedOut,
          overdueInspection: equipment.overdueInspection,
        },
        inspections: {
          total: inspections.totalInspections,
          passed: inspections.passed,
          failed: inspections.failed,
          dueWithin7Days: inspections.dueWithin7Days,
        },
        competency: {
          totalEvaluations: competency.totalEvaluations,
          passing: competency.passing,
          expiringSoon: competency.expiringSoon,
          expired: competency.expired,
        },
        toolsPpe: toolsPpe,
        maintenanceCalibration: maintenance,
      },
      links: {
        equipmentCompliance: '/admin/equipment/compliance',
        inspections: '/admin/inspections',
        competency: '/admin/equipment/competency',
        toolsPpe: '/admin/tools-ppe',
        maintenance: '/admin/maintenance-calibration',
        reporting: '/admin/reporting',
        notifications: '/admin/notifications',
      },
    };
  }

  async runScheduledNotifications(companyId?: number) {
    return this.notificationScheduler.runAll(companyId);
  }
}
