import { Injectable, OnModuleInit } from '@nestjs/common';
import { VeraAutonomousSafetyEngine } from '@vera/autonomous-safety';
import type {
  AutonomousSafetyReport,
  SafetyContextInput,
  SafetyFormInput,
} from '@vera/autonomous-safety';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { DigitalTwinService } from '../digital-twin/digital-twin.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
import { DomainEvent } from '../api-platform/events/domain-events';
import type { DomainEventPayload } from '../api-platform/events/domain-events';
import type { PmSafetyWorkflowKind } from '@prisma/client';

@Injectable()
export class AutonomousSafetyService implements OnModuleInit {
  private readonly vase = new VeraAutonomousSafetyEngine();
  private lastReport: AutonomousSafetyReport | null = null;
  private lastContext: SafetyContextInput | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reporting: ReportingCoreService,
    private readonly twins: DigitalTwinService,
    private readonly eventBus: EventBusService,
  ) {}

  onModuleInit(): void {
    this.eventBus.on(DomainEvent.INSPECTION_COMPLETED, (p) =>
      this.onDomainEvent('inspection.completed', p),
    );
    this.eventBus.on(DomainEvent.TRAINING_VALIDATED, (p) =>
      this.onDomainEvent('training.validated', p),
    );
  }

  async analyzeCompany(
    companyId: number,
    projectId?: number,
  ): Promise<AutonomousSafetyReport> {
    await this.twins.hydrateCompany(companyId);

    const forms = await this.loadSafetyForms(companyId);
    const report = await this.reporting.workerCompliance(companyId, 100);
    const nonCompliant = report.rows.filter((r) => !r.isCompliant).length;

    const equipmentLocked = await this.prisma.equipment.count({
      where: { companyId, lockedOutAt: { not: null } },
    });

    const ctx: SafetyContextInput = {
      companyId: String(companyId),
      projectId: projectId ? String(projectId) : undefined,
      forms,
      trainingGaps: nonCompliant,
      inspectionFailures: await this.countRecentInspectionFailures(companyId),
      competencyGaps: nonCompliant,
      lockedOutEquipment: equipmentLocked > 0,
      twinRiskScores: { project: nonCompliant > 5 ? 70 : 30 },
    };

    this.lastContext = ctx;
    this.lastReport = this.vase.analyze(ctx);
    return this.lastReport;
  }

  getDashboard() {
    return this.lastReport?.dashboard ?? null;
  }

  getLastReport() {
    return this.lastReport;
  }

  applyOffline(ctx: SafetyContextInput) {
    this.lastReport = this.vase.analyzeOffline(ctx);
    return this.lastReport;
  }

  syncOffline() {
    return this.vase.syncOffline();
  }

  private onDomainEvent(name: string, payload: DomainEventPayload): void {
    if (!this.lastContext) return;
    let event = name;
    if (
      name === DomainEvent.INSPECTION_COMPLETED &&
      payload.data?.passed === false
    ) {
      event = 'inspection.failed';
    }
    this.lastReport = this.vase.onEvent(this.lastContext, event, payload.data);
    this.lastContext = this.lastReport.context;
  }

  private async loadSafetyForms(companyId: number): Promise<SafetyFormInput[]> {
    const rows = await this.prisma.pmSafetyWorkflow.findMany({
      where: { companyId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        kind: true,
        title: true,
        status: true,
        hazardSummary: true,
        controlMeasures: true,
        taskStepsJson: true,
      },
    });

    return rows.map((r) => ({
      id: String(r.id),
      kind: mapKind(r.kind),
      title: r.title,
      status: r.status,
      hazardSummary: r.hazardSummary ?? undefined,
      controlMeasures: r.controlMeasures ?? undefined,
      taskSteps: parseTaskSteps(r.taskStepsJson),
    }));
  }

  private async countRecentInspectionFailures(
    companyId: number,
  ): Promise<number> {
    return this.prisma.equipment.count({
      where: { companyId, lockedOutAt: { not: null } },
    });
  }
}

function mapKind(kind: PmSafetyWorkflowKind): SafetyFormInput['kind'] {
  const map: Record<string, SafetyFormInput['kind']> = {
    JHA: 'JHA',
    FLHA: 'FLHA',
    SIF: 'SIF',
    HECA: 'HECA',
    ENERGY_WHEEL: 'ENERGY_WHEEL',
    INSPECTION: 'INSPECTION',
    PERMIT_TO_WORK: 'PERMIT_TO_WORK',
    JOB_SAFETY_ANALYSIS: 'JHA',
  };
  return map[kind] ?? 'JHA';
}

function parseTaskSteps(json: unknown): string[] | undefined {
  if (!json || !Array.isArray(json)) return undefined;
  return json.map((s) => String(s));
}
