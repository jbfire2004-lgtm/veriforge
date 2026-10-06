import { Injectable } from '@nestjs/common';
import { VeraGlobalNetworkEngine, hashId } from '@vera/global-network';
import type {
  AnonymizedCompanyInput,
  GlobalNetworkReport,
  NetworkContextInput,
} from '@vera/global-network';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { DigitalTwinService } from '../digital-twin/digital-twin.service';

@Injectable()
export class GlobalNetworkService {
  private readonly vgnie = new VeraGlobalNetworkEngine();
  private lastReport: GlobalNetworkReport | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reporting: ReportingCoreService,
    private readonly twins: DigitalTwinService,
  ) {}

  async analyzeNetwork(companyId?: number): Promise<GlobalNetworkReport> {
    if (companyId) {
      await this.twins.hydrateCompany(companyId);
    }
    const ctx = await this.buildContext(companyId);
    this.lastReport = this.vgnie.analyze(ctx);
    return this.lastReport;
  }

  getDashboard() {
    return this.lastReport?.dashboard ?? null;
  }

  getLastReport() {
    return this.lastReport;
  }

  applyOffline(ctx: NetworkContextInput) {
    this.lastReport = this.vgnie.analyzeOffline(ctx);
    return this.lastReport;
  }

  syncOffline() {
    return this.vgnie.syncOffline();
  }

  private async buildContext(
    focusCompanyId?: number,
  ): Promise<NetworkContextInput> {
    const companyRows = await this.prisma.company.findMany({
      where: focusCompanyId ? { id: focusCompanyId } : undefined,
      take: focusCompanyId ? 1 : 40,
      orderBy: { id: 'asc' },
      select: { id: true, name: true },
    });

    const companies: AnonymizedCompanyInput[] = [];

    for (const row of companyRows) {
      const snapshot = await this.companySnapshot(row.id);
      companies.push(snapshot);
    }

    const [unionHalls, providers] = await Promise.all([
      this.prisma.unionHall.count(),
      this.prisma.trainingProvider.count(),
    ]);

    return {
      companyId: focusCompanyId ? String(focusCompanyId) : undefined,
      companyHash: focusCompanyId ? hashId(focusCompanyId) : undefined,
      companies,
      totalWorkers: companies.reduce((s, c) => s + (c.workerCount ?? 0), 0),
      totalEquipment: companies.reduce(
        (s, c) => s + (c.equipmentCount ?? 0),
        0,
      ),
      totalUnionHalls: unionHalls,
      totalProviders: providers,
    };
  }

  private async companySnapshot(
    companyId: number,
  ): Promise<AnonymizedCompanyInput> {
    const compliance = await this.reporting.workerCompliance(companyId, 120);
    const nonCompliant = compliance.rows.filter((r) => !r.isCompliant).length;
    const expiring = compliance.rows.filter((r) => r.expiringSoon).length;

    const [
      workerCount,
      equipmentCount,
      projectCount,
      safetyForms,
      inspectionFailures,
      dispatchConflicts,
    ] = await Promise.all([
      this.prisma.worker.count({ where: { companyId } }),
      this.prisma.equipment.count({ where: { companyId } }),
      this.prisma.project.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.pmSafetyWorkflow.findMany({
        where: { companyId },
        take: 25,
        orderBy: { updatedAt: 'desc' },
        select: {
          kind: true,
          hazardSummary: true,
          workDescription: true,
          title: true,
        },
      }),
      this.prisma.equipment.count({
        where: {
          companyId,
          OR: [
            { complianceStatus: 'NON_COMPLIANT' },
            { lockedOutAt: { not: null } },
          ],
        },
      }),
      this.prisma.unionDispatch
        .groupBy({
          by: ['workerId'],
          where: { companyId, recalledAt: null },
          _count: { id: true },
        })
        .then((rows) => rows.filter((d) => d._count.id > 1).length),
    ]);

    const hazardTexts = safetyForms
      .map((f) =>
        [f.hazardSummary, f.workDescription, f.title].filter(Boolean).join(' '),
      )
      .filter((t) => t.length > 0);

    return {
      companyHash: hashId(companyId),
      industry: 'construction',
      region: 'NA',
      workerCount,
      equipmentCount,
      projectCount,
      sifForms: safetyForms.filter((f) => f.kind === 'SIF').length,
      hecaForms: safetyForms.filter((f) => f.kind === 'HECA').length,
      energyWheelForms: safetyForms.filter((f) => f.kind === 'ENERGY_WHEEL')
        .length,
      inspectionFailures,
      nonCompliantWorkers: nonCompliant,
      expiringTraining: expiring,
      dispatchConflicts,
      visionHazards: 0,
      hazardTexts,
    };
  }
}
