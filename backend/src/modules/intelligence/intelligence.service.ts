import { Injectable } from '@nestjs/common';
import {
  VeraIntelligenceEngine,
  type CompanyIntelInput,
  type EquipmentIntelInput,
  type ProjectIntelInput,
  type TrainingIntelInput,
  type WorkerIntelInput,
} from '@vera/intelligence';
import { DashboardWidgetsService } from '../dashboard-widgets/dashboard-widgets.service';
import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  AskVeraDto,
  IntelligenceApiBundle,
  IntelligenceQueryDto,
} from './intelligence.types';

@Injectable()
export class IntelligenceService {
  private readonly vie = new VeraIntelligenceEngine();

  constructor(
    private readonly prisma: PrismaService,
    private readonly reporting: ReportingCoreService,
    private readonly dashboardWidgets: DashboardWidgetsService,
  ) {}

  async getBundle(query: IntelligenceQueryDto): Promise<IntelligenceApiBundle> {
    const companyId = query.companyId;
    const widgetBundle = await this.dashboardWidgets.getBundle({
      companyId,
      includeWorkerCompliance: true,
      includeEquipmentCompliance: true,
      includeTrainingExpiry: true,
      includeProjectReadiness: true,
      includeProviderApprovals: true,
      includeUnionDispatch: !!query.unionHallId,
      includeAssignments: true,
    });

    const company = await this.buildCompanyInput(companyId, widgetBundle);
    const projects = await this.buildProjectInputs(companyId, widgetBundle);
    const workers = query.workerId
      ? [await this.buildWorkerInput(query.workerId, companyId)]
      : await this.buildTopRiskWorkers(companyId, 5);
    const equipment = query.equipmentId
      ? [await this.buildEquipmentInput(query.equipmentId, companyId)]
      : [];
    const training = await this.buildTrainingInputs(companyId, 20);

    const bundle = this.vie.buildBundle({
      context: {
        companyId,
        projectId: query.projectId,
        workerId: query.workerId,
        equipmentId: query.equipmentId,
      },
      company,
      projects,
      workers,
      equipment,
      training,
      expiring30: widgetBundle.trainingExpiry?.expiring30,
      expiring60: widgetBundle.trainingExpiry?.expiring60,
    });

    return { ...bundle, scope: { companyId, projectId: query.projectId } };
  }

  async ask(
    dto: AskVeraDto,
  ): Promise<ReturnType<VeraIntelligenceEngine['ask']>> {
    const bundle = await this.getBundle({ companyId: dto.companyId });
    return this.vie.ask(dto.question, bundle);
  }

  async runAutomation(companyId?: number) {
    const bundle = await this.getBundle({ companyId });
    const pending = this.vie.automation.getPending();
    return { bundle: bundle.automationTasks, pending };
  }

  private async buildCompanyInput(
    companyId: number | undefined,
    widgets: Awaited<ReturnType<DashboardWidgetsService['getBundle']>>,
  ): Promise<CompanyIntelInput | undefined> {
    if (!companyId) return undefined;
    const wc = widgets.workerCompliance;
    const ec = widgets.equipmentCompliance;
    return {
      id: String(companyId),
      name: `Company ${companyId}`,
      complianceRate: wc?.complianceRate ?? 0,
      highRiskWorkers: wc?.nonCompliant ?? 0,
      highRiskEquipment: ec?.nonCompliant ?? 0,
      expiringTraining: widgets.trainingExpiry?.expiring30 ?? 0,
    };
  }

  private async buildProjectInputs(
    companyId: number | undefined,
    widgets: Awaited<ReturnType<DashboardWidgetsService['getBundle']>>,
  ): Promise<ProjectIntelInput[]> {
    const pr = widgets.projectReadiness;
    if (!pr) return [];
    const projects = companyId
      ? await this.prisma.project.findMany({
          where: { companyId },
          take: 10,
          select: { id: true, name: true },
        })
      : [];
    if (projects.length === 0) {
      return [
        {
          id: 'aggregate',
          name: 'Portfolio',
          readiness: pr.averageReadiness,
          missingWorkers: pr.missingWorkers,
          missingEquipment: pr.missingEquipment,
          missingTraining: pr.missingTraining,
          workerCount: 0,
          equipmentCount: 0,
        },
      ];
    }
    return projects.map((p) => ({
      id: String(p.id),
      name: p.name,
      readiness: pr.averageReadiness,
      missingWorkers: pr.missingWorkers,
      missingEquipment: pr.missingEquipment,
      missingTraining: pr.missingTraining,
      workerCount: 10,
      equipmentCount: 5,
    }));
  }

  private async buildWorkerInput(
    workerId: number,
    companyId?: number,
  ): Promise<WorkerIntelInput> {
    const report = await this.reporting.workerCompliance(companyId, 500);
    const row = report.rows.find((r) => r.workerId === workerId);
    const name = row?.workerName ?? `Worker ${workerId}`;
    return {
      id: String(workerId),
      name,
      isCompliant: row?.isCompliant ?? false,
      expiringSoon: row?.expiringSoon ?? false,
      expiredTraining: row?.isCompliant ? 0 : 1,
      failedInspections: 0,
      competencyGaps: row?.isCompliant ? 0 : 1,
      daysToNextExpiry: row?.expiringSoon ? 25 : 180,
    };
  }

  private async buildTopRiskWorkers(
    companyId: number | undefined,
    limit: number,
  ): Promise<WorkerIntelInput[]> {
    const report = await this.reporting.workerCompliance(companyId, 200);
    return report.rows
      .filter((r) => !r.isCompliant || r.expiringSoon)
      .slice(0, limit)
      .map((r) => ({
        id: String(r.workerId),
        name: r.workerName,
        isCompliant: r.isCompliant,
        expiringSoon: r.expiringSoon,
        expiredTraining: r.isCompliant ? 0 : 1,
        failedInspections: 0,
        competencyGaps: r.isCompliant ? 0 : 1,
        daysToNextExpiry: r.expiringSoon ? 20 : 120,
      }));
  }

  private async buildEquipmentInput(
    equipmentId: number,
    companyId?: number,
  ): Promise<EquipmentIntelInput> {
    const eq = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      select: { id: true, name: true, assetTag: true },
    });
    return {
      id: String(equipmentId),
      name: eq?.name ?? eq?.assetTag ?? `Equipment ${equipmentId}`,
      isCompliant: true,
      lockedOut: false,
      overdueInspection: false,
      failedInspections: 0,
      lockoutCount: 0,
      competencyGaps: 0,
    };
  }

  private async buildTrainingInputs(
    companyId: number | undefined,
    limit: number,
  ): Promise<TrainingIntelInput[]> {
    const records = await this.prisma.trainingRecord.findMany({
      where: companyId ? { companyId } : {},
      take: limit,
      orderBy: { expiresAt: 'asc' },
      select: {
        id: true,
        expiresAt: true,
        providerId: true,
        certification: { select: { name: true } },
      },
    });
    const now = Date.now();
    return records.map((r) => ({
      id: String(r.id),
      title: r.certification?.name ?? 'Training',
      providerId: r.providerId ? String(r.providerId) : undefined,
      expiryDate: r.expiresAt?.toISOString(),
      isValid: !r.expiresAt || r.expiresAt.getTime() > now,
    }));
  }
}
