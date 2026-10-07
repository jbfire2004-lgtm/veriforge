import { Injectable } from '@nestjs/common';
import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import type { UnionDispatchWidgetData } from '../dashboard-widgets.types';

@Injectable()
export class DispatchPipeline {
  constructor(private readonly reporting: ReportingCoreService) {}

  async run(
    unionHallId?: number,
    companyId?: number,
  ): Promise<UnionDispatchWidgetData> {
    const report = await this.reporting.unionDispatchStatus(
      unionHallId,
      companyId,
    );
    const s = report.summary;

    const missingTraining = report.recent.filter(
      (d) => !(d as { workerCompliant?: boolean }).workerCompliant,
    ).length;

    return {
      readyForDispatch: Math.max(0, (s.activeMembers ?? 0) - missingTraining),
      missingTraining,
      currentlyDispatched: s.activeDispatches,
      activeMembers: s.activeMembers ?? 0,
      totalDispatches: s.totalDispatches,
    };
  }
}
