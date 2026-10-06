import { Injectable } from '@nestjs/common';
import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import type { WorkerComplianceWidgetData } from '../dashboard-widgets.types';

@Injectable()
export class WorkerCompliancePipeline {
  constructor(private readonly reporting: ReportingCoreService) {}

  async run(companyId?: number): Promise<WorkerComplianceWidgetData> {
    const report = await this.reporting.workerCompliance(companyId, 100);
    const s = report.summary;

    const issueMap = new Map<string, number>();
    for (const row of report.rows) {
      if (row.isCompliant) continue;
      const key = row.expiringSoon ? 'Expiring soon' : 'Non-compliant';
      issueMap.set(key, (issueMap.get(key) ?? 0) + 1);
    }

    const topIssues = [...issueMap.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalWorkers: s.totalWorkers,
      evaluated: s.evaluated,
      compliant: s.compliant,
      nonCompliant: s.nonCompliant,
      expiringSoon: s.expiringSoon,
      complianceRate: s.complianceRate,
      topIssues,
    };
  }
}
