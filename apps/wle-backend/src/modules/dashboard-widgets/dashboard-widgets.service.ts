import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../../analytics/analytics.service';
import { AssignmentDashboardService } from '../../assignment-dashboard/assignment-dashboard.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { DashboardWidgetsBundle } from './dashboard-widgets.types';
import { DispatchPipeline } from './pipelines/dispatch.pipeline';
import { EquipmentCompliancePipeline } from './pipelines/equipment-compliance.pipeline';
import { ProjectReadinessPipeline } from './pipelines/project-readiness.pipeline';
import { ProviderApprovalPipeline } from './pipelines/provider-approval.pipeline';
import { TrainingExpiryPipeline } from './pipelines/training-expiry.pipeline';
import { WorkerCompliancePipeline } from './pipelines/worker-compliance.pipeline';

export type DashboardWidgetScope = {
  companyId?: number;
  unionHallId?: number;
  includeWorkerCompliance?: boolean;
  includeEquipmentCompliance?: boolean;
  includeTrainingExpiry?: boolean;
  includeProjectReadiness?: boolean;
  includeProviderApprovals?: boolean;
  includeUnionDispatch?: boolean;
  includeSystemHealth?: boolean;
  includeAssignments?: boolean;
};

@Injectable()
export class DashboardWidgetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
    private readonly assignments: AssignmentDashboardService,
    private readonly workerCompliance: WorkerCompliancePipeline,
    private readonly equipmentCompliance: EquipmentCompliancePipeline,
    private readonly trainingExpiry: TrainingExpiryPipeline,
    private readonly projectReadiness: ProjectReadinessPipeline,
    private readonly providerApproval: ProviderApprovalPipeline,
    private readonly dispatch: DispatchPipeline,
  ) {}

  async getBundle(
    scope: DashboardWidgetScope,
  ): Promise<DashboardWidgetsBundle> {
    const tasks: Promise<void>[] = [];
    const bundle: DashboardWidgetsBundle = {
      generatedAt: new Date().toISOString(),
    };

    if (scope.includeWorkerCompliance) {
      tasks.push(
        this.workerCompliance.run(scope.companyId).then((data) => {
          bundle.workerCompliance = data;
        }),
      );
    }

    if (scope.includeEquipmentCompliance) {
      tasks.push(
        this.equipmentCompliance.run(scope.companyId).then((data) => {
          bundle.equipmentCompliance = data;
        }),
      );
    }

    if (scope.includeTrainingExpiry) {
      tasks.push(
        this.trainingExpiry.run(scope.companyId).then((data) => {
          bundle.trainingExpiry = data;
        }),
      );
    }

    if (scope.includeProjectReadiness) {
      tasks.push(
        this.projectReadiness.run(scope.companyId).then((data) => {
          bundle.projectReadiness = data;
        }),
      );
    }

    if (scope.includeProviderApprovals) {
      tasks.push(
        this.providerApproval.run().then((data) => {
          bundle.providerApprovals = data;
        }),
      );
    }

    if (scope.includeUnionDispatch) {
      tasks.push(
        this.dispatch.run(scope.unionHallId, scope.companyId).then((data) => {
          bundle.unionDispatch = data;
        }),
      );
    }

    if (scope.includeSystemHealth) {
      tasks.push(
        this.buildSystemHealth().then((data) => {
          bundle.systemHealth = data;
        }),
      );
    }

    if (scope.includeAssignments) {
      tasks.push(
        this.buildAssignments().then((data) => {
          bundle.assignments = data;
        }),
      );
    }

    await Promise.all(tasks);
    return bundle;
  }

  private async buildSystemHealth() {
    const [overview, openIncidents] = await Promise.all([
      this.analytics.overview(),
      this.prisma.incident.count({
        where: { status: { not: 'CLOSED' } },
      }),
    ]);

    const status =
      openIncidents > 10
        ? ('critical' as const)
        : openIncidents > 3
        ? ('degraded' as const)
        : ('healthy' as const);

    return {
      workers: overview.workers,
      equipment: overview.equipment,
      companies: overview.companies,
      trainingRecords: overview.trainingRecords,
      openIncidents,
      status,
    };
  }

  private async buildAssignments() {
    const overview = await this.assignments.overview();
    const active = await this.assignments.activeAssignments();
    const atRisk = active.filter(
      (a) =>
        a.risk.expiredTraining ||
        a.risk.openIncidents > 0 ||
        a.risk.equipmentUnsafe,
    ).length;

    return {
      activeAssignments: overview.activeAssignments,
      atRisk,
      totalWorkers: overview.totalWorkers,
    };
  }
}
