import { Injectable } from '@nestjs/common';
import type { PredictiveSchedulingReport } from '@vera/predictive-scheduling';
import type { AutonomousOperationsReport } from '@vera/autonomous-operations';
import { PredictiveSchedulingService } from '../modules/predictive-scheduling/predictive-scheduling.service';
import { AutonomousOperationsService } from '../modules/autonomous-operations/autonomous-operations.service';
import { PmProjectManagementService } from './pm-project-management.service';

@Injectable()
export class PmSchedulingBridgeService {
  constructor(
    private readonly predictive: PredictiveSchedulingService,
    private readonly autonomous: AutonomousOperationsService,
    private readonly pm: PmProjectManagementService,
  ) {}

  async runPredictiveOptimize(
    companyId: number,
    projectId: number,
    unionHallId?: number,
  ) {
    const report = await this.predictive.optimizeCompany(
      companyId,
      projectId,
      unionHallId,
    );
    return {
      report,
      dashboard: report.dashboard,
      allocation: report.allocation,
      dispatch: report.dispatch,
    };
  }

  async applyPredictiveSchedule(
    projectId: number,
    report: PredictiveSchedulingReport,
    actorId?: number,
  ) {
    const created: unknown[] = [];
    const now = new Date();
    const end = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    for (const alloc of report.allocation.workerAllocations) {
      if (String(alloc.projectId) !== String(projectId)) continue;
      const workerId = Number(alloc.workerId);
      if (!Number.isFinite(workerId)) continue;

      const assignment = await this.pm.assignWorker(
        projectId,
        { workerId, role: 'crew' },
        actorId,
      );
      created.push({ type: 'worker_assignment', assignment });

      const schedule = await this.pm.createScheduleEntry(
        projectId,
        {
          workerId,
          title: `Predictive allocation (priority ${alloc.priority})`,
          startAt: now.toISOString(),
          endAt: end.toISOString(),
          entryType: 'predictive',
        },
        actorId,
      );
      created.push({ type: 'schedule', schedule });
    }

    for (const alloc of report.allocation.equipmentAllocations) {
      if (String(alloc.projectId) !== String(projectId)) continue;
      const equipmentId = Number(alloc.equipmentId);
      if (!Number.isFinite(equipmentId)) continue;

      const assignment = await this.pm.assignEquipment(
        projectId,
        { equipmentId },
        actorId,
      );
      created.push({ type: 'equipment_assignment', assignment });
    }

    return {
      applied: created.length,
      items: created,
      recommendations: report.dispatch.recommendations,
    };
  }

  async runAutonomousDispatch(
    companyId: number,
    projectId: number,
    autoExecute = true,
    unionHallId?: number,
  ) {
    const report = await this.autonomous.runCompany(
      companyId,
      projectId,
      unionHallId,
      autoExecute,
    );
    return {
      report,
      dashboard: report.dashboard,
      dispatch: report.dispatch,
      execution: report.execution,
    };
  }

  async applyAutonomousDispatch(
    projectId: number,
    report: AutonomousOperationsReport,
    actorId?: number,
  ) {
    const created: unknown[] = [];

    for (const action of report.dispatch.dispatches) {
      const workerId =
        action.entityType === 'worker'
          ? Number(action.entityId)
          : Number(action.targetId ?? action.entityId);
      if (!Number.isFinite(workerId)) continue;

      const row = await this.pm.assignWorker(
        projectId,
        {
          workerId,
          role: 'crew',
        },
        actorId,
      );
      created.push({ type: 'dispatch', action: action.type, assignment: row });
    }

    for (const action of report.execution?.executed ?? []) {
      if (action.entityType !== 'worker') continue;
      const workerId = Number(action.entityId);
      if (!Number.isFinite(workerId)) continue;
      const row = await this.pm.assignWorker(projectId, { workerId }, actorId);
      created.push({ type: 'auto_assignment', assignment: row });
    }

    return {
      applied: created.length,
      items: created,
      conflicts: report.dispatch.conflicts,
      violations: report.dispatch.violations,
    };
  }

  getPredictiveDashboard() {
    return this.predictive.getDashboard();
  }

  getAutonomousDashboard() {
    return this.autonomous.getDashboard();
  }
}
