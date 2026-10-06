import { Injectable } from '@nestjs/common';
import { VeraIndustryEcosystemEngine, hashId } from '@vera/industry-ecosystem';
import type {
  IndustryContextInput,
  IndustryEcosystemReport,
  IndustryParticipant,
} from '@vera/industry-ecosystem';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { DigitalTwinService } from '../digital-twin/digital-twin.service';
import { GlobalNetworkService } from '../global-network/global-network.service';

@Injectable()
export class IndustryEcosystemService {
  private readonly vaiee = new VeraIndustryEcosystemEngine();
  private lastReport: IndustryEcosystemReport | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly reporting: ReportingCoreService,
    private readonly twins: DigitalTwinService,
    private readonly globalNetwork: GlobalNetworkService,
  ) {}

  async orchestrateIndustry(
    companyId?: number,
  ): Promise<IndustryEcosystemReport> {
    if (companyId) {
      await this.twins.hydrateCompany(companyId);
    }
    const networkReport = await this.globalNetwork.analyzeNetwork(companyId);
    const ctx = await this.buildContext(companyId);
    this.lastReport = this.vaiee.orchestrate(ctx, networkReport);
    return this.lastReport;
  }

  getDashboard() {
    return this.lastReport?.dashboard ?? null;
  }

  getLastReport() {
    return this.lastReport;
  }

  applyOffline(ctx: IndustryContextInput) {
    this.lastReport = this.vaiee.orchestrateOffline(ctx);
    return this.lastReport;
  }

  syncOffline() {
    return this.vaiee.syncOffline();
  }

  private async buildContext(
    focusCompanyId?: number,
  ): Promise<IndustryContextInput> {
    const companyRows = await this.prisma.company.findMany({
      where: focusCompanyId ? { id: focusCompanyId } : undefined,
      take: focusCompanyId ? 1 : 40,
      orderBy: { id: 'asc' },
      select: { id: true },
    });

    const participants: IndustryParticipant[] = [];
    for (const row of companyRows) {
      participants.push(await this.participantSnapshot(row.id));
    }

    const [providers, unionHalls] = await Promise.all([
      this.prisma.trainingProvider.count(),
      this.prisma.unionHall.count(),
    ]);

    return {
      companyId: focusCompanyId ? String(focusCompanyId) : undefined,
      industry: 'construction',
      region: 'NA',
      participants,
      totalWorkers: participants.reduce((s, p) => s + (p.workerCount ?? 0), 0),
      totalEquipment: participants.reduce(
        (s, p) => s + (p.equipmentCount ?? 0),
        0,
      ),
      totalProviders: providers,
      totalUnionHalls: unionHalls,
    };
  }

  private async participantSnapshot(
    companyId: number,
  ): Promise<IndustryParticipant> {
    const compliance = await this.reporting.workerCompliance(companyId, 100);
    const nonCompliant = compliance.rows.filter((r) => !r.isCompliant).length;
    const expiring = compliance.rows.filter((r) => r.expiringSoon).length;

    const [
      workerCount,
      equipmentCount,
      projectCount,
      safetyForms,
      inspectionFailures,
      dispatchConflicts,
      projects,
    ] = await Promise.all([
      this.prisma.worker.count({ where: { companyId } }),
      this.prisma.equipment.count({ where: { companyId } }),
      this.prisma.project.count({ where: { companyId, status: 'ACTIVE' } }),
      this.prisma.pmSafetyWorkflow.findMany({
        where: { companyId },
        take: 20,
        select: { kind: true },
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
      this.prisma.project.findMany({
        where: { companyId, status: 'ACTIVE' },
        take: 10,
        select: {
          workerAssignments: { where: { status: 'ACTIVE', endedAt: null } },
        },
      }),
    ]);

    const schedulingShortages = projects.filter((p) => {
      const assigned = p.workerAssignments.length;
      return assigned < Math.max(3, assigned + 1);
    }).length;

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
      schedulingShortages,
      automationFailures: 0,
    };
  }
}
