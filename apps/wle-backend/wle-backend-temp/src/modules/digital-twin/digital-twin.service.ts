import { Injectable, OnModuleInit } from '@nestjs/common';
import { VeraDigitalTwinEngine } from '@vera/digital-twin';
import type {
  TwinEventPayload,
  TwinType,
  TwinDashboardBundle,
  DigitalTwin,
} from '@vera/digital-twin';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { DashboardWidgetsService } from '../dashboard-widgets/dashboard-widgets.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import type { DomainEventPayload } from '../api-platform/events/domain-events';

@Injectable()
export class DigitalTwinService implements OnModuleInit {
  private readonly vdte = new VeraDigitalTwinEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly reporting: ReportingCoreService,
    private readonly widgets: DashboardWidgetsService,
    private readonly eventBus: EventBusService,
  ) {}

  onModuleInit(): void {
    this.registerEventHandlers();
  }

  async hydrateCompany(companyId: number): Promise<DigitalTwin[]> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true },
    });
    if (!company) return [];

    const widgetBundle = await this.widgets.getBundle({
      companyId,
      includeWorkerCompliance: true,
      includeEquipmentCompliance: true,
      includeProjectReadiness: true,
      includeUnionDispatch: true,
    });

    this.vdte.createCompany({
      id: String(company.id),
      name: company.name,
      complianceRate: widgetBundle.workerCompliance?.complianceRate ?? 0,
      workerCount: widgetBundle.workerCompliance?.totalWorkers ?? 0,
      equipmentCount: widgetBundle.equipmentCompliance?.total ?? 0,
      projectCount: widgetBundle.projectReadiness?.totalProjects ?? 0,
    });

    const workers = await this.prisma.worker.findMany({
      where: { companyId },
      take: 100,
      select: { id: true, firstName: true, lastName: true, companyId: true },
    });

    const report = await this.reporting.workerCompliance(companyId, 200);
    const reportMap = new Map(report.rows.map((r) => [r.workerId, r]));

    for (const w of workers) {
      const row = reportMap.get(w.id);
      this.vdte.createWorker({
        id: String(w.id),
        name: `${w.firstName} ${w.lastName}`.trim(),
        companyId: String(companyId),
        isCompliant: row?.isCompliant ?? false,
        expiringSoon: row?.expiringSoon ?? false,
        expiredCount: row?.isCompliant ? 0 : 1,
      });
    }

    const equipment = await this.prisma.equipment.findMany({
      where: { companyId },
      take: 100,
      select: { id: true, name: true, lockedOutAt: true, companyId: true },
    });

    for (const e of equipment) {
      this.vdte.createEquipment({
        id: String(e.id),
        name: e.name,
        companyId: String(companyId),
        lockedOut: !!e.lockedOutAt,
        overdueInspection: false,
      });
    }

    const projects = await this.prisma.project.findMany({
      where: { companyId },
      take: 30,
      select: { id: true, name: true, companyId: true },
    });

    const pr = widgetBundle.projectReadiness;
    for (const p of projects) {
      this.vdte.createProject({
        id: String(p.id),
        name: p.name,
        companyId: String(companyId),
        readiness: pr?.averageReadiness ?? 0,
        missingWorkers: pr?.missingWorkers ?? 0,
        missingEquipment: pr?.missingEquipment ?? 0,
        missingTraining: pr?.missingTraining ?? 0,
      });
    }

    return this.vdte.list();
  }

  getTwin(type: TwinType, id: string): DigitalTwin | undefined {
    return this.vdte.get(type, id);
  }

  getTimeline(type: TwinType, id: string) {
    return this.vdte.getTimeline(type, id);
  }

  getHistory(type: TwinType, id: string) {
    return this.vdte.getHistory(type, id);
  }

  getDashboard(): TwinDashboardBundle {
    return this.vdte.getDashboard();
  }

  applyEvent(event: TwinEventPayload): DigitalTwin | undefined {
    return this.vdte.applyEvent(event);
  }

  applyOfflineEvent(event: TwinEventPayload, clientVersion: number): void {
    this.vdte.applyEventOffline(event, clientVersion);
  }

  syncTwin(type: TwinType, id: string): DigitalTwin | undefined {
    return this.vdte.syncOffline(type, id);
  }

  private registerEventHandlers(): void {
    const map: Record<string, TwinEventPayload['name']> = {
      [DomainEvent.WORKER_LINKED]: 'worker.linked',
      [DomainEvent.WORKER_UNLINKED]: 'worker.unlinked',
      [DomainEvent.TRAINING_UPLOADED]: 'training.uploaded',
      [DomainEvent.TRAINING_VALIDATED]: 'training.validated',
      [DomainEvent.INSPECTION_COMPLETED]: 'inspection.completed',
      [DomainEvent.PROJECT_ASSIGNED]: 'project.assigned',
      [DomainEvent.PROJECT_CLOSED]: 'project.closed',
      [DomainEvent.PROVIDER_APPROVED]: 'provider.approved',
      [DomainEvent.COMPLIANCE_RECALC]: 'compliance.recalc',
      [DomainEvent.SYNC_BATCH]: 'sync.batch',
    };

    for (const [domainEvent, twinEvent] of Object.entries(map)) {
      this.eventBus.on(domainEvent, (payload: DomainEventPayload) => {
        const entityType = entityTypeFromPayload(payload);
        if (!entityType || payload.entityId == null) return;
        this.vdte.applyEvent({
          name: twinEvent,
          entityType,
          entityId: String(payload.entityId),
          occurredAt: payload.occurredAt,
          companyId: payload.companyId ? String(payload.companyId) : undefined,
          projectId: payload.projectId ? String(payload.projectId) : undefined,
          data: payload.data,
        });
      });
    }
  }
}

function entityTypeFromPayload(payload: DomainEventPayload): TwinType | null {
  const t = payload.entityType?.toLowerCase();
  if (t === 'worker') return 'worker';
  if (t === 'equipment') return 'equipment';
  if (t === 'project') return 'project';
  if (t === 'company') return 'company';
  if (t === 'provider' || t === 'trainingprovider') return 'provider';
  if (t === 'unionhall') return 'unionHall';
  if (payload.name.includes('worker')) return 'worker';
  if (payload.name.includes('equipment')) return 'equipment';
  if (payload.name.includes('project')) return 'project';
  if (payload.name.includes('provider')) return 'provider';
  return null;
}
