import { Injectable, OnModuleInit } from '@nestjs/common';
import { VeraAutonomousOperationsEngine } from '@vera/autonomous-operations';
import type {
  AutonomousOperationsReport,
  OperationsContextInput,
  OperationsWorkerInput,
  OperationsEquipmentInput,
  OperationsProjectInput,
  OperationsDispatchInput,
} from '@vera/autonomous-operations';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { DigitalTwinService } from '../digital-twin/digital-twin.service';
import { DashboardWidgetsService } from '../dashboard-widgets/dashboard-widgets.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import type { DomainEventPayload } from '../api-platform/events/domain-events';

@Injectable()
export class AutonomousOperationsService implements OnModuleInit {
  private readonly vaoe = new VeraAutonomousOperationsEngine();
  private lastReport: AutonomousOperationsReport | null = null;
  private lastContext: OperationsContextInput | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reporting: ReportingCoreService,
    private readonly twins: DigitalTwinService,
    private readonly widgets: DashboardWidgetsService,
    private readonly eventBus: EventBusService,
  ) {}

  onModuleInit(): void {
    this.eventBus.on(DomainEvent.INSPECTION_COMPLETED, (p) =>
      this.onDomainEvent(
        p.data?.passed === false ? 'inspection.failed' : 'inspection.completed',
        p,
      ),
    );
    this.eventBus.on(DomainEvent.TRAINING_VALIDATED, (p) =>
      this.onDomainEvent('training.validated', p),
    );
    this.eventBus.on(DomainEvent.PROJECT_ASSIGNED, (p) =>
      this.onDomainEvent('dispatch.created', p),
    );
  }

  async runCompany(
    companyId: number,
    projectId?: number,
    unionHallId?: number,
    autoExecute = true,
  ): Promise<AutonomousOperationsReport> {
    await this.twins.hydrateCompany(companyId);
    const ctx = await this.buildContext(
      companyId,
      projectId,
      unionHallId,
      autoExecute,
    );
    this.lastContext = ctx;
    this.lastReport = this.vaoe.run(ctx);
    return this.lastReport;
  }

  getDashboard() {
    return this.lastReport?.dashboard ?? null;
  }

  getLastReport() {
    return this.lastReport;
  }

  overrideAction(actionId: string, reason: string) {
    if (!this.lastReport) return null;
    this.lastReport = this.vaoe.overrideAction(
      this.lastReport,
      actionId,
      reason,
    );
    return this.lastReport;
  }

  rollbackAction(actionId: string, reason: string) {
    if (!this.lastReport) return null;
    this.lastReport = this.vaoe.rollbackAction(
      this.lastReport,
      actionId,
      reason,
    );
    return this.lastReport;
  }

  applyOffline(ctx: OperationsContextInput) {
    this.lastReport = this.vaoe.runOffline(ctx);
    return this.lastReport;
  }

  syncOffline() {
    return this.vaoe.syncOffline((ctx) => this.vaoe.run(ctx));
  }

  private onDomainEvent(name: string, payload: DomainEventPayload): void {
    if (!this.lastContext) return;
    const workerId =
      payload.data?.workerId ??
      (payload.entityType === 'worker' ? payload.entityId : undefined);
    const equipmentId =
      payload.data?.equipmentId ??
      (payload.entityType === 'equipment' ? payload.entityId : undefined);

    this.lastReport = this.vaoe.onEvent(this.lastContext, name, {
      workerId,
      equipmentId,
      projectId: payload.projectId,
      passed: payload.data?.passed,
      ...payload.data,
    });
    this.lastContext = this.lastReport.context;
  }

  private async buildContext(
    companyId: number,
    projectId?: number,
    unionHallId?: number,
    autoExecute = true,
  ): Promise<OperationsContextInput> {
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

    const workerInputs: OperationsWorkerInput[] = workers.map((w) => {
      const row = complianceMap.get(w.id);
      const dispatched = w.unionDispatches.length > 0;
      return {
        id: String(w.id),
        name: `${w.firstName} ${w.lastName}`.trim(),
        companyId: String(companyId),
        projectIds: w.projectAssignments.map((a) => String(a.projectId)),
        isCompliant: row?.isCompliant ?? false,
        trainingValid: row?.isCompliant ?? false,
        competencyValid: row?.isCompliant ?? false,
        readinessScore: row?.isCompliant ? 78 : 42,
        fatigueScore: 35,
        sifRiskScore: row?.isCompliant ? 25 : 55,
        hecaDeviation: false,
        dispatchStatus: dispatched ? 'dispatched' : 'available',
        restricted: !row?.isCompliant,
      };
    });

    const equipmentRows = await this.prisma.equipment.findMany({
      where: { companyId },
      take: 80,
      select: {
        id: true,
        name: true,
        lockedOutAt: true,
        lockoutStatus: true,
        complianceStatus: true,
        nextInspectionAt: true,
        projectAssignments: {
          where: { status: 'ACTIVE', endedAt: null },
          select: { projectId: true },
        },
      },
    });

    const equipmentInputs: OperationsEquipmentInput[] = equipmentRows.map(
      (e) => {
        const overdue =
          e.nextInspectionAt != null && e.nextInspectionAt < new Date();
        return {
          id: String(e.id),
          name: e.name,
          companyId: String(companyId),
          projectIds: e.projectAssignments.map((a) => String(a.projectId)),
          lockedOut: !!e.lockedOutAt || e.lockoutStatus !== 'CLEAR',
          inspectionPassed: !overdue && e.complianceStatus === 'COMPLIANT',
          visionDamageDetected: false,
          sifPrecursor: false,
          hecaDeviation: false,
          energyConflict: false,
          competencyMismatch: e.complianceStatus === 'NON_COMPLIANT',
        };
      },
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
        workerAssignments: { where: { status: 'ACTIVE', endedAt: null } },
        equipmentAssignments: { where: { status: 'ACTIVE', endedAt: null } },
      },
    });

    const pr = widgetBundle.projectReadiness;
    const projectInputs: OperationsProjectInput[] = projects.map((p) => ({
      id: String(p.id),
      name: p.name,
      assignedWorkers: p.workerAssignments.length,
      assignedEquipment: p.equipmentAssignments.length,
      requiredWorkers: Math.max(p.workerAssignments.length + 1, 3),
      requiredEquipment: Math.max(p.equipmentAssignments.length, 1),
      readinessScore: pr?.averageReadiness ?? 70,
      requiredSkills: ['safety', 'operations'],
    }));

    const dispatches = await this.loadDispatches(companyId, unionHallId);

    const schedulingShortages = projectInputs
      .map((p) => ({
        projectId: p.id,
        deficit: Math.max(
          0,
          (p.requiredWorkers ?? 0) - (p.assignedWorkers ?? 0),
        ),
      }))
      .filter((s) => s.deficit > 0);

    return {
      companyId: String(companyId),
      unionHallId: unionHallId ? String(unionHallId) : undefined,
      projectId: projectId ? String(projectId) : undefined,
      autoExecute,
      workers: workerInputs,
      equipment: equipmentInputs,
      projects: projectInputs,
      dispatches,
      schedulingShortages,
    };
  }

  private async loadDispatches(
    companyId: number,
    unionHallId?: number,
  ): Promise<OperationsDispatchInput[]> {
    const rows = await this.prisma.unionDispatch.findMany({
      where: { companyId, ...(unionHallId ? { unionHallId } : {}) },
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
}
