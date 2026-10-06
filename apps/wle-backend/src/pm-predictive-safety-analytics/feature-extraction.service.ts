import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ExtractedFeatures } from './types/predictive-analytics.types';

const WINDOW_DAYS = 90;

@Injectable()
export class PredictiveFeatureExtractionService {
  constructor(private readonly prisma: PrismaService) {}

  private since(): Date {
    const d = new Date();
    d.setDate(d.getDate() - WINDOW_DAYS);
    return d;
  }

  async extract(
    companyId: number,
    projectId?: number,
  ): Promise<ExtractedFeatures> {
    const since = this.since();
    const projectFilter = projectId ? { projectId } : {};

    const [inspections, incidents, correctiveActions, training, equipment] =
      await Promise.all([
        this.extractInspections(companyId, since, projectFilter),
        this.extractIncidents(companyId, since, projectFilter),
        this.extractCorrectiveActions(companyId, since, projectFilter),
        this.extractTraining(companyId, projectFilter),
        this.extractEquipment(companyId, since, projectFilter),
      ]);

    return { inspections, incidents, correctiveActions, training, equipment };
  }

  private async extractInspections(
    companyId: number,
    since: Date,
    projectFilter: { projectId?: number },
  ) {
    const rows = await this.prisma.pmInspection.findMany({
      where: {
        companyId,
        deletedAt: null,
        createdAt: { gte: since },
        ...projectFilter,
      },
      include: {
        deficiencies: {
          select: {
            id: true,
            severity: true,
            status: true,
            subcontractorCompanyId: true,
          },
        },
        photoFindings: {
          select: {
            severity: true,
            category: true,
            sclState: true,
            hecaInvolved: true,
            highEnergyFlag: true,
          },
        },
      },
      take: 500,
    });

    return rows.map((i) => ({
      module: 'inspection',
      id: i.id,
      severity:
        i.deficiencies.filter((d) => d.severity === 'critical').length * 25,
      deficiencyCount: i.deficiencies.length,
      openDeficiencies: i.deficiencies.filter((d) => d.status !== 'closed')
        .length,
      photoFindings: i.photoFindings.length,
      status: i.status,
      siteId: i.siteId,
      label: i.title ?? 'Inspection',
    }));
  }

  private async extractIncidents(
    companyId: number,
    since: Date,
    projectFilter: { projectId?: number },
  ) {
    const rows = await this.prisma.pmSafetyEvent.findMany({
      where: {
        companyId,
        deletedAt: null,
        occurredAt: { gte: since },
        ...projectFilter,
      },
      select: {
        id: true,
        title: true,
        severity: true,
        riskScore: true,
        status: true,
        siteId: true,
        eventType: true,
        sifEventId: true,
        sclState: true,
        hecaCategoryCode: true,
        mandatoryInvestigation: true,
      },
      take: 500,
    });

    return rows.map((e) => ({
      module: 'incident',
      id: e.id,
      severity: e.riskScore,
      severityLabel: e.severity,
      status: e.status,
      siteId: e.siteId,
      sifPotential: !!e.sifEventId,
      label: e.title,
      eventType: e.eventType,
    }));
  }

  private async extractCorrectiveActions(
    companyId: number,
    since: Date,
    projectFilter: { projectId?: number },
  ) {
    const now = new Date();
    const rows = await this.prisma.pmCorrectiveAction.findMany({
      where: {
        companyId,
        deletedAt: null,
        createdAt: { gte: since },
        ...projectFilter,
      },
      select: {
        id: true,
        title: true,
        status: true,
        severityLevel: true,
        dueAt: true,
        subcontractorCompanyId: true,
        sourceModule: true,
      },
      take: 500,
    });

    return rows.map((c) => ({
      module: 'corrective_action',
      id: c.id,
      severity:
        c.severityLevel === 'critical'
          ? 90
          : c.severityLevel === 'high'
          ? 70
          : 40,
      overdue: c.dueAt
        ? c.dueAt < now && !['closed', 'verified'].includes(c.status)
        : false,
      status: c.status,
      subcontractorCompanyId: c.subcontractorCompanyId,
      label: c.title,
      sourceModule: c.sourceModule,
    }));
  }

  private async extractTraining(
    companyId: number,
    projectFilter: { projectId?: number },
  ) {
    const workers = await this.prisma.worker.findMany({
      where: { companyId },
      select: { id: true },
      take: 500,
    });
    const workerIds = workers.map((w) => w.id);
    if (!workerIds.length) return [];

    const rows = await this.prisma.pmWorkerSafetyTraining.findMany({
      where: {
        workerId: { in: workerIds },
        OR: [{ status: { not: 'valid' } }, { expiresAt: { lt: new Date() } }],
      },
      include: { worker: { select: { firstName: true, lastName: true } } },
      take: 500,
    });

    return rows.map((t) => ({
      module: 'training',
      id: t.id,
      workerId: t.workerId,
      severity: t.status === 'expired' ? 80 : 50,
      trainingCode: t.trainingCode,
      status: t.status,
      expiresAt: t.expiresAt?.toISOString(),
      label: `${t.worker.firstName} ${t.worker.lastName} — ${t.trainingCode}`,
      projectId: projectFilter.projectId,
    }));
  }

  private async extractEquipment(
    companyId: number,
    since: Date,
    projectFilter: { projectId?: number },
  ) {
    const failures = await this.prisma.pmEquipmentFailure.findMany({
      where: {
        companyId,
        createdAt: { gte: since },
        ...projectFilter,
      },
      include: { equipment: { select: { id: true, name: true } } },
      take: 200,
    });

    return failures.map((f) => ({
      module: 'equipment',
      id: f.id,
      equipmentId: f.equipmentId,
      severity: 75,
      status: f.status,
      siteId: f.projectId,
      label: f.equipment.name,
    }));
  }

  toIngestRecords(features: ExtractedFeatures) {
    const raw: Array<{
      module: string;
      id: string;
      payload: Record<string, unknown>;
    }> = [];
    for (const group of Object.values(features)) {
      for (const row of group) {
        raw.push({
          module: String(row.module),
          id: String(row.id),
          payload: row,
        });
      }
    }
    return raw;
  }
}
