import { Injectable, OnModuleInit } from '@nestjs/common';
import { VeraEnterpriseBrainEngine } from '@vera/enterprise-brain';
import type {
  BrainContextInput,
  EnterpriseBrainReport,
} from '@vera/enterprise-brain';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { DigitalTwinService } from '../digital-twin/digital-twin.service';
import { CommandCenterService } from '../command-center/command-center.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import type { DomainEventPayload } from '../api-platform/events/domain-events';

@Injectable()
export class EnterpriseBrainService implements OnModuleInit {
  private readonly aeb = new VeraEnterpriseBrainEngine();
  private lastReport: EnterpriseBrainReport | null = null;
  private lastContext: BrainContextInput | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reporting: ReportingCoreService,
    private readonly twins: DigitalTwinService,
    private readonly commandCenter: CommandCenterService,
    private readonly eventBus: EventBusService,
  ) {}

  onModuleInit(): void {
    const events = [
      DomainEvent.INSPECTION_COMPLETED,
      DomainEvent.TRAINING_VALIDATED,
      DomainEvent.COMPLIANCE_RECALC,
      DomainEvent.SYNC_BATCH,
    ];
    for (const ev of events) {
      this.eventBus.on(ev, (p) => this.onDomainEvent(p.name, p));
    }
  }

  async thinkCompany(
    companyId: number,
    projectId?: number,
    unionHallId?: number,
  ): Promise<EnterpriseBrainReport> {
    await this.twins.hydrateCompany(companyId);
    await this.commandCenter.refreshCompany(companyId, projectId, unionHallId);
    const ctx = await this.buildContext(companyId, projectId, unionHallId);
    this.lastContext = ctx;
    this.lastReport = this.aeb.think(ctx);
    return this.lastReport;
  }

  getDashboard() {
    return this.lastReport?.dashboard ?? null;
  }

  getLastReport() {
    return this.lastReport;
  }

  applyOffline(ctx: BrainContextInput) {
    this.lastReport = this.aeb.thinkOffline(ctx);
    return this.lastReport;
  }

  syncOffline() {
    return this.aeb.syncOffline();
  }

  private onDomainEvent(name: string, payload: DomainEventPayload): void {
    if (!this.lastContext) return;
    const event =
      name === DomainEvent.INSPECTION_COMPLETED &&
      payload.data?.passed === false
        ? 'inspection.failed'
        : name;
    this.lastReport = this.aeb.onEvent(this.lastContext, event, payload.data);
    this.lastContext = this.lastReport.context;
  }

  private async buildContext(
    companyId: number,
    projectId?: number,
    unionHallId?: number,
  ): Promise<BrainContextInput> {
    const compliance = await this.reporting.workerCompliance(companyId, 150);
    const nonCompliant = compliance.rows.filter((r) => !r.isCompliant).length;
    const expiring = compliance.rows.filter((r) => r.expiringSoon).length;

    const [workerCount, equipmentCount, projectCount, inspectionFailures] =
      await Promise.all([
        this.prisma.worker.count({ where: { companyId } }),
        this.prisma.equipment.count({ where: { companyId } }),
        this.prisma.project.count({ where: { companyId, status: 'ACTIVE' } }),
        this.prisma.equipment.count({
          where: {
            companyId,
            OR: [
              { complianceStatus: 'NON_COMPLIANT' },
              { lockedOutAt: { not: null } },
            ],
          },
        }),
      ]);

    const safetyForms = await this.prisma.pmSafetyWorkflow.findMany({
      where: { companyId },
      take: 10,
      select: { kind: true },
    });

    const projects = await this.prisma.project.findMany({
      where: { companyId, status: 'ACTIVE' },
      take: 15,
      select: {
        id: true,
        workerAssignments: { where: { status: 'ACTIVE', endedAt: null } },
      },
    });

    const schedulingShortages = projects
      .map((p) => {
        const assigned = p.workerAssignments.length;
        const required = Math.max(assigned + 1, 3);
        return {
          projectId: String(p.id),
          deficit: Math.max(0, required - assigned),
        };
      })
      .filter((s) => s.deficit > 0);

    return {
      companyId: String(companyId),
      unionHallId: unionHallId ? String(unionHallId) : undefined,
      projectId: projectId ? String(projectId) : undefined,
      workerCount,
      equipmentCount,
      projectCount,
      nonCompliantWorkers: nonCompliant,
      expiringTraining: expiring,
      inspectionFailures,
      sifPrecursors: safetyForms.filter((f) => f.kind === 'SIF').length,
      schedulingShortages,
    };
  }
}
