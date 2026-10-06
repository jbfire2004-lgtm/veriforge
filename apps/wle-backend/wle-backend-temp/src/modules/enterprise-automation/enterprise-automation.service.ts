import { Injectable, OnModuleInit } from '@nestjs/common';
import { VeraEnterpriseAutomationEngine } from '@vera/enterprise-automation';
import type {
  EnterpriseAutomationReport,
  EnterpriseContextInput,
} from '@vera/enterprise-automation';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { DigitalTwinService } from '../digital-twin/digital-twin.service';
import { DashboardWidgetsService } from '../dashboard-widgets/dashboard-widgets.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import type { DomainEventPayload } from '../api-platform/events/domain-events';

@Injectable()
export class EnterpriseAutomationService implements OnModuleInit {
  private readonly veao = new VeraEnterpriseAutomationEngine();
  private lastReport: EnterpriseAutomationReport | null = null;
  private lastContext: EnterpriseContextInput | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reporting: ReportingCoreService,
    private readonly twins: DigitalTwinService,
    private readonly widgets: DashboardWidgetsService,
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
      if (p.name.startsWith('safety.') || p.name.startsWith('dispatch.')) {
        void this.onDomainEvent(p.name, p);
      }
    });
  }

  async orchestrateCompany(
    companyId: number,
    projectId?: number,
    unionHallId?: number,
    autoExecute = true,
  ): Promise<EnterpriseAutomationReport> {
    await this.twins.hydrateCompany(companyId);
    const ctx = await this.buildContext(
      companyId,
      projectId,
      unionHallId,
      autoExecute,
    );
    this.lastContext = ctx;
    this.lastReport = this.veao.orchestrate(ctx);
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
    this.lastReport = this.veao.overrideAction(
      this.lastReport,
      actionId,
      reason,
    );
    return this.lastReport;
  }

  rollbackAction(actionId: string, reason: string) {
    if (!this.lastReport) return null;
    this.lastReport = this.veao.rollbackAction(
      this.lastReport,
      actionId,
      reason,
    );
    return this.lastReport;
  }

  applyOffline(ctx: EnterpriseContextInput) {
    this.lastReport = this.veao.orchestrateOffline(ctx);
    return this.lastReport;
  }

  syncOffline() {
    return this.veao.syncOffline();
  }

  private onDomainEvent(name: string, payload: DomainEventPayload): void {
    if (!this.lastContext) return;
    this.lastReport = this.veao.onEvent(this.lastContext, name, {
      ...payload.data,
      companyId: payload.companyId,
      projectId: payload.projectId,
    });
    this.lastContext = this.lastReport.context;
  }

  private async buildContext(
    companyId: number,
    projectId?: number,
    unionHallId?: number,
    autoExecute = true,
  ): Promise<EnterpriseContextInput> {
    await this.widgets.getBundle({
      companyId,
      includeWorkerCompliance: true,
      includeEquipmentCompliance: true,
      includeProjectReadiness: true,
      includeUnionDispatch: true,
    });

    const compliance = await this.reporting.workerCompliance(companyId, 200);
    const nonCompliant = compliance.rows.filter((r) => !r.isCompliant).length;
    const expiring = compliance.rows.filter((r) => r.expiringSoon).length;

    const [
      workerCount,
      equipmentCount,
      projectCount,
      lockedEquipment,
      inspectionFailures,
    ] = await Promise.all([
      this.prisma.worker.count({ where: { companyId } }),
      this.prisma.equipment.count({ where: { companyId } }),
      this.prisma.project.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.equipment.count({
        where: { companyId, lockedOutAt: { not: null } },
      }),
      this.prisma.equipment.count({
        where: {
          companyId,
          OR: [
            { complianceStatus: 'NON_COMPLIANT' },
            { lockoutStatus: 'LOCKED_OUT' },
          ],
        },
      }),
    ]);

    const safetyForms = await this.prisma.pmSafetyWorkflow.findMany({
      where: { companyId },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      select: { id: true, kind: true, title: true, hazardSummary: true },
    });

    const documents = await this.prisma.document.findMany({
      where: { companyId },
      take: 15,
      orderBy: { createdAt: 'desc' },
      select: { id: true, description: true },
    });

    const projects = await this.prisma.project.findMany({
      where: { companyId, status: 'ACTIVE' },
      take: 20,
      select: {
        id: true,
        workerAssignments: { where: { status: 'ACTIVE', endedAt: null } },
      },
    });

    const schedulingShortages = projects
      .map((p) => {
        const assigned = p.workerAssignments.length;
        const required = Math.max(assigned + 1, 3);
        const deficit = Math.max(0, required - assigned);
        return deficit > 0 ? { projectId: String(p.id), deficit } : null;
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    return {
      companyId: String(companyId),
      unionHallId: unionHallId ? String(unionHallId) : undefined,
      projectId: projectId ? String(projectId) : undefined,
      autoExecute,
      workerCount,
      equipmentCount,
      projectCount,
      nonCompliantWorkers: nonCompliant,
      expiringTraining: expiring,
      inspectionFailures,
      lockedEquipment,
      safetyForms: safetyForms.map((f) => ({
        id: String(f.id),
        kind: f.kind,
        title: f.title,
        hazardSummary: f.hazardSummary ?? undefined,
      })),
      documents: documents.map((d) => ({
        id: String(d.id),
        text: d.description ?? undefined,
        fraudScore: 0,
      })),
      schedulingShortages,
    };
  }
}
