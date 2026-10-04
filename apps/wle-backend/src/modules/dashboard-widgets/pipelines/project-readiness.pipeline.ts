import { Injectable } from '@nestjs/common';
import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import type { ProjectReadinessWidgetData } from '../dashboard-widgets.types';

@Injectable()
export class ProjectReadinessPipeline {
  constructor(private readonly reporting: ReportingCoreService) {}

  async run(companyId?: number): Promise<ProjectReadinessWidgetData> {
    const report = await this.reporting.projectReadiness(companyId);
    const s = report.summary;

    let missingWorkers = 0;
    let missingEquipment = 0;
    let missingTraining = 0;

    for (const row of report.rows) {
      missingWorkers += Math.max(0, row.totalWorkers - row.compliantWorkers);
      missingEquipment += Math.max(
        0,
        row.totalEquipment - row.compliantEquipment,
      );
      if (row.readinessScore < 70) missingTraining += 1;
    }

    return {
      averageReadiness: s.averageReadiness,
      totalProjects: s.totalProjects,
      ready: s.ready,
      atRisk: s.atRisk,
      notReady: s.notReady,
      missingWorkers,
      missingEquipment,
      missingTraining,
    };
  }
}
