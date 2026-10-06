import { Injectable, OnModuleInit } from '@nestjs/common';
import { VeraCommandCenterEngine } from '@vera/command-center';
import type {
  CommandCenterReport,
  CommandContextInput,
  CommandEntityInput,
} from '@vera/command-center';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { DigitalTwinService } from '../digital-twin/digital-twin.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import type { DomainEventPayload } from '../api-platform/events/domain-events';

@Injectable()
export class CommandCenterService implements OnModuleInit {
  private readonly vcc = new VeraCommandCenterEngine();
  private lastReport: CommandCenterReport | null = null;
  private lastContext: CommandContextInput | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reporting: ReportingCoreService,
    private readonly twins: DigitalTwinService,
    private readonly eventBus: EventBusService,
  ) {}

  onModuleInit(): void {
    const events = [
      DomainEvent.INSPECTION_COMPLETED,
      DomainEvent.TRAINING_VALIDATED,
      DomainEvent.TRAINING_UPLOADED,
      DomainEvent.PROJECT_ASSIGNED,
      DomainEvent.COMPLIANCE_RECALC,
      DomainEvent.SYNC_BATCH,
    ];
    for (const ev of events) {
      this.eventBus.on(ev, (p) => this.onDomainEvent(p.name, p));
    }
    this.eventBus.on('*', (p) => {
      if (p.name.includes('safety') || p.name.includes('dispatch')) {
        void this.onDomainEvent(p.name, p);
      }
    });
  }

  async refreshCompany(
    companyId: number,
    projectId?: number,
    unionHallId?: number,
  ): Promise<CommandCenterReport> {
    await this.twins.hydrateCompany(companyId);
    const ctx = await this.buildContext(companyId, projectId, unionHallId);
    this.lastContext = ctx;
    this.lastReport = this.vcc.refresh(ctx);
    return this.lastReport;
  }

  getDashboard() {
    return this.lastReport?.dashboard ?? null;
  }

  getLastReport() {
    return this.lastReport;
  }

  applyOffline(ctx: CommandContextInput) {
    this.lastReport = this.vcc.refreshOffline(ctx);
    return this.lastReport;
  }

  syncOffline() {
    return this.vcc.syncOffline();
  }

  private onDomainEvent(name: string, payload: DomainEventPayload): void {
    if (!this.lastContext) return;
    const event =
      name === DomainEvent.INSPECTION_COMPLETED &&
      payload.data?.passed === false
        ? 'inspection.failed'
        : name;
    this.lastReport = this.vcc.onEvent(this.lastContext, event, {
      ...payload.data,
      entityId: payload.entityId,
    });
    this.lastContext = this.lastReport.context;
  }

  private async buildContext(
    companyId: number,
    projectId?: number,
    unionHallId?: number,
  ): Promise<CommandContextInput> {
    const compliance = await this.reporting.workerCompliance(companyId, 150);
    const nonCompliant = compliance.rows.filter((r) => !r.isCompliant).length;
    const expiring = compliance.rows.filter((r) => r.expiringSoon).length;

    const workers = await this.prisma.worker.findMany({
      where: { companyId },
      take: 50,
      select: { id: true, firstName: true, lastName: true },
    });

    const equipment = await this.prisma.equipment.findMany({
      where: { companyId },
      take: 40,
      select: {
        id: true,
        name: true,
        lockedOutAt: true,
        complianceStatus: true,
        nextInspectionAt: true,
      },
    });

    const projects = await this.prisma.project.findMany({
      where: { companyId, status: 'ACTIVE' },
      take: 20,
      select: { id: true, name: true },
    });

    const entities: CommandEntityInput[] = [
      ...workers.map((w, i) => {
        const row = compliance.rows.find((r) => r.workerId === w.id);
        return {
          id: String(w.id),
          name: `${w.firstName} ${w.lastName}`.trim(),
          type: 'worker' as const,
          lat: 49.28 + i * 0.008,
          lng: -123.12 + i * 0.008,
          complianceOk: row?.isCompliant ?? false,
          readinessScore: row?.isCompliant ? 75 : 40,
          riskScore: row?.isCompliant ? 25 : 55,
        };
      }),
      ...equipment.map((e, i) => ({
        id: String(e.id),
        name: e.name,
        type: 'equipment' as const,
        lat: 49.27 + i * 0.01,
        lng: -123.1 + i * 0.01,
        complianceOk: e.complianceStatus === 'COMPLIANT',
        riskScore: e.lockedOutAt
          ? 90
          : e.nextInspectionAt && e.nextInspectionAt < new Date()
          ? 70
          : 20,
        readinessScore: e.lockedOutAt ? 10 : 80,
      })),
      ...projects.map((p, i) => ({
        id: String(p.id),
        name: p.name,
        type: 'project' as const,
        lat: 49.29 + i * 0.015,
        lng: -123.14 + i * 0.015,
        riskScore: 35,
        readinessScore: 65,
      })),
      {
        id: String(companyId),
        name: 'Company',
        type: 'company',
        riskScore: Math.min(100, nonCompliant * 3),
        readinessScore: Math.max(0, 100 - nonCompliant * 4),
      },
    ];

    if (unionHallId) {
      entities.push({
        id: String(unionHallId),
        name: 'Union Hall',
        type: 'unionHall',
        riskScore: 30,
        readinessScore: 70,
      });
    }

    const safetyForms = await this.prisma.pmSafetyWorkflow.findMany({
      where: { companyId },
      take: 15,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, kind: true, title: true, hazardSummary: true },
    });

    const locked = equipment.filter((e) => e.lockedOutAt).length;
    const inspectionFailures = equipment.filter(
      (e) => e.complianceStatus === 'NON_COMPLIANT' || e.lockedOutAt,
    ).length;

    const dispatchConflicts = await this.prisma.unionDispatch.groupBy({
      by: ['workerId'],
      where: { companyId, recalledAt: null },
      _count: { id: true },
    });
    const doubleDispatch = dispatchConflicts.filter(
      (d) => d._count.id > 1,
    ).length;

    return {
      companyId: String(companyId),
      unionHallId: unionHallId ? String(unionHallId) : undefined,
      projectId: projectId ? String(projectId) : undefined,
      entities,
      sifPrecursors: safetyForms.filter((f) => f.kind === 'SIF').length,
      hecaDeviations: safetyForms.filter((f) => f.kind === 'HECA').length,
      energyConflicts: safetyForms.filter((f) => f.kind === 'ENERGY_WHEEL')
        .length,
      inspectionFailures,
      trainingExpiries: expiring,
      competencyGaps: nonCompliant,
      dispatchConflicts: doubleDispatch,
      visionAnomalies: 0,
      documentFraud: 0,
      fatigueIndicators: Math.min(10, nonCompliant),
      safetyForms: safetyForms.map((f) => ({
        id: String(f.id),
        kind: f.kind,
        title: f.title,
        hazardSummary: f.hazardSummary ?? undefined,
      })),
    };
  }
}
