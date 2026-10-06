import { Injectable, OnModuleInit } from '@nestjs/common';
import { VeraPredictiveSchedulingEngine } from '@vera/predictive-scheduling';
import type {
  PredictiveSchedulingReport,
  SchedulingContextInput,
  WorkerScheduleInput,
  EquipmentScheduleInput,
  ProjectScheduleInput,
  DispatchInput,
  TrainingForecastInput,
} from '@vera/predictive-scheduling';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { DigitalTwinService } from '../digital-twin/digital-twin.service';
import { DashboardWidgetsService } from '../dashboard-widgets/dashboard-widgets.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import type { DomainEventPayload } from '../api-platform/events/domain-events';

@Injectable()
export class PredictiveSchedulingService implements OnModuleInit {
  private readonly vpse = new VeraPredictiveSchedulingEngine();
  private lastReport: PredictiveSchedulingReport | null = null;
  private lastContext: SchedulingContextInput | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reporting: ReportingCoreService,
    private readonly twins: DigitalTwinService,
    private readonly widgets: DashboardWidgetsService,
    private readonly eventBus: EventBusService,
  ) {}

  onModuleInit(): void {
    this.eventBus.on(DomainEvent.TRAINING_VALIDATED, (p) =>
      this.onDomainEvent('training.validated', p),
    );
    this.eventBus.on(DomainEvent.PROJECT_ASSIGNED, (p) =>
      this.onDomainEvent('project.assigned', p),
    );
    this.eventBus.on(DomainEvent.COMPLIANCE_RECALC, (p) =>
      this.onDomainEvent('compliance.recalc', p),
    );
  }

  async optimizeCompany(
    companyId: number,
    projectId?: number,
    unionHallId?: number,
  ): Promise<PredictiveSchedulingReport> {
    await this.twins.hydrateCompany(companyId);
    const ctx = await this.buildContext(companyId, projectId, unionHallId);
    this.lastContext = ctx;
    this.lastReport = this.vpse.analyze(ctx);
    return this.lastReport;
  }

  getDashboard() {
    return this.lastReport?.dashboard ?? null;
  }

  getLastReport() {
    return this.lastReport;
  }

  applyOffline(ctx: SchedulingContextInput) {
    this.lastReport = this.vpse.analyzeOffline(ctx);
    return this.lastReport;
  }

  syncOffline() {
    return this.vpse.syncOffline();
  }

  private onDomainEvent(name: string, payload: DomainEventPayload): void {
    if (!this.lastContext) return;
    const workerId =
      payload.data?.workerId ??
      (payload.entityType === 'worker' ? payload.entityId : undefined);
    const equipmentId =
      payload.data?.equipmentId ??
      (payload.entityType === 'equipment' ? payload.entityId : undefined);
    const projectId = payload.projectId ?? payload.data?.projectId;

    this.lastReport = this.vpse.onEvent(this.lastContext, name, {
      workerId,
      equipmentId,
      projectId,
      ...payload.data,
    });
    this.lastContext = this.lastReport.context;
  }

  private async buildContext(
    companyId: number,
    projectId?: number,
    unionHallId?: number,
  ): Promise<SchedulingContextInput> {
    const widgetBundle = await this.widgets.getBundle({
      companyId,
      includeWorkerCompliance: true,
      includeEquipmentCompliance: true,
      includeProjectReadiness: true,
      includeUnionDispatch: true,
    });

    const compliance = await this.reporting.workerCompliance(companyId, 200);
    const complianceMap = new Map(compliance.rows.map((r) => [r.workerId, r]));

    const workers = await this.prisma.worker.findMany({
      where: { companyId },
      take: 100,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyId: true,
        projectAssignments: {
          where: { status: 'ACTIVE', endedAt: null },
          select: { projectId: true },
        },
        unionDispatches: {
          where: { recalledAt: null, companyId },
          take: 1,
          orderBy: { dispatchedAt: 'desc' },
        },
      },
    });

    const workerInputs: WorkerScheduleInput[] = workers.map((w) => {
      const row = complianceMap.get(w.id);
      const dispatched = w.unionDispatches.length > 0;
      return {
        id: String(w.id),
        name: `${w.firstName} ${w.lastName}`.trim(),
        companyId: String(companyId),
        projectIds: w.projectAssignments.map((a) => String(a.projectId)),
        isCompliant: row?.isCompliant ?? false,
        expiringTraining: row?.expiringSoon ? 1 : 0,
        competencyGaps: row?.isCompliant ? 0 : 1,
        readinessScore: row?.isCompliant ? 75 : 40,
        dispatchStatus: dispatched ? 'dispatched' : 'available',
        hoursThisWeek: 36,
      };
    });

    const equipmentRows = await this.prisma.equipment.findMany({
      where: { companyId },
      take: 80,
      select: {
        id: true,
        name: true,
        lockedOutAt: true,
        projectAssignments: {
          where: { status: 'ACTIVE', endedAt: null },
          select: { projectId: true },
        },
      },
    });

    const equipmentInputs: EquipmentScheduleInput[] = equipmentRows.map(
      (e) => ({
        id: String(e.id),
        name: e.name,
        companyId: String(companyId),
        projectIds: e.projectAssignments.map((a) => String(a.projectId)),
        lockedOut: !!e.lockedOutAt,
        overdueInspection: false,
        maintenanceDueDays: 45,
      }),
    );

    const projects = await this.prisma.project.findMany({
      where: {
        companyId,
        ...(projectId ? { id: projectId } : {}),
        status: 'ACTIVE',
      },
      take: 30,
      select: {
        id: true,
        name: true,
        companyId: true,
        workerAssignments: { where: { status: 'ACTIVE', endedAt: null } },
        equipmentAssignments: { where: { status: 'ACTIVE', endedAt: null } },
      },
    });

    const pr = widgetBundle.projectReadiness;
    const projectInputs: ProjectScheduleInput[] = projects.map((p) => ({
      id: String(p.id),
      name: p.name,
      companyId: String(companyId),
      status: 'ACTIVE',
      assignedWorkers: p.workerAssignments.length,
      assignedEquipment: p.equipmentAssignments.length,
      requiredWorkers: Math.max(
        p.workerAssignments.length,
        pr?.missingWorkers ? 3 : 2,
      ),
      requiredEquipment: Math.max(
        p.equipmentAssignments.length,
        pr?.missingEquipment ? 2 : 1,
      ),
      readiness: pr?.averageReadiness ?? 70,
      missingTraining: pr?.missingTraining ?? 0,
    }));

    const dispatches = await this.loadDispatches(companyId, unionHallId);
    const trainingExpiries = await this.loadTrainingExpiries(companyId);

    return {
      companyId: String(companyId),
      unionHallId: unionHallId ? String(unionHallId) : undefined,
      projectId: projectId ? String(projectId) : undefined,
      horizonDays: 14,
      workers: workerInputs,
      equipment: equipmentInputs,
      projects: projectInputs,
      dispatches,
      trainingExpiries,
    };
  }

  private async loadDispatches(
    companyId: number,
    unionHallId?: number,
  ): Promise<DispatchInput[]> {
    const rows = await this.prisma.unionDispatch.findMany({
      where: {
        companyId,
        ...(unionHallId ? { unionHallId } : {}),
      },
      orderBy: { dispatchedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        workerId: true,
        unionHallId: true,
        companyId: true,
        dispatchedAt: true,
        recalledAt: true,
      },
    });

    return rows.map((d) => ({
      id: String(d.id),
      workerId: String(d.workerId),
      unionHallId: String(d.unionHallId),
      companyId: String(d.companyId),
      dispatchedAt: d.dispatchedAt.toISOString(),
      recalledAt: d.recalledAt?.toISOString(),
    }));
  }

  private async loadTrainingExpiries(
    companyId: number,
  ): Promise<TrainingForecastInput[]> {
    const records = await this.prisma.trainingRecord.findMany({
      where: { companyId, expiresAt: { not: null } },
      take: 100,
      orderBy: { expiresAt: 'asc' },
      select: {
        workerId: true,
        expiresAt: true,
        certification: { select: { name: true } },
      },
    });

    return records
      .filter((r) => r.workerId && r.expiresAt)
      .map((r) => {
        const days = Math.ceil(
          (r.expiresAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        return {
          workerId: String(r.workerId),
          certificationName: r.certification?.name ?? 'Training',
          expiresAt: r.expiresAt!.toISOString(),
          daysUntilExpiry: days,
        };
      });
  }
}
