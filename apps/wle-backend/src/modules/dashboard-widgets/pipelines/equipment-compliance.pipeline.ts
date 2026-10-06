import { Injectable } from '@nestjs/common';
import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import type { EquipmentComplianceWidgetData } from '../dashboard-widgets.types';

@Injectable()
export class EquipmentCompliancePipeline {
  constructor(private readonly reporting: ReportingCoreService) {}

  async run(companyId?: number): Promise<EquipmentComplianceWidgetData> {
    const report = await this.reporting.equipmentCompliance(companyId);
    const s = report.summary;

    const nextDue = report.recent
      .map(
        (r) => (r as { nextInspectionDue?: string | null }).nextInspectionDue,
      )
      .filter(Boolean)
      .sort()[0] as string | undefined;

    return {
      total: s.total,
      compliant: s.compliant,
      nonCompliant: s.nonCompliant,
      lockedOut: s.lockedOut,
      overdueInspection: s.overdueInspection,
      complianceRate: s.complianceRate,
      nextInspectionDue: nextDue ?? null,
    };
  }
}
