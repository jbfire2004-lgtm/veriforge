import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JhaFlhaService } from '../jha-flha/jha-flha.service';
import { JhaLibraryService } from '../jha-flha/jha-library.service';
import { SifHecaService } from '../sif-heca/sif-heca.service';

@Injectable()
export class SafetySuiteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jha: JhaFlhaService,
    private readonly jhaLibrary: JhaLibraryService,
    private readonly sifHeca: SifHecaService,
  ) {}

  async getDashboard(projectId: number, companyId?: number) {
    const [
      jhaAnalytics,
      sifAnalytics,
      jhaPending,
      sifPending,
      sifHigh,
      flhaCount,
      jhaCount,
    ] = await Promise.all([
      this.jha.getProjectAnalytics(projectId).catch(() => null),
      this.sifHeca.projectAnalytics(projectId).catch(() => null),
      this.prisma.jhaFlha.count({
        where: {
          projectId,
          deletedAt: null,
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        },
      }),
      this.prisma.sifHecaEvent.count({
        where: {
          projectId,
          deletedAt: null,
          status: { in: ['review_required', 'scored'] },
        },
      }),
      this.prisma.sifHecaEvent.count({
        where: {
          projectId,
          deletedAt: null,
          sifScore: { sifCategory: { in: ['high', 'critical'] } },
        },
      }),
      this.prisma.jhaFlha.count({ where: { projectId, kind: 'FLHA' } }),
      this.prisma.jhaFlha.count({ where: { projectId, kind: 'JHA' } }),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      projectId,
      companyId: companyId ?? null,
      jha: jhaAnalytics,
      sif: sifAnalytics,
      counts: {
        flha: flhaCount,
        jha: jhaCount,
        jhaPendingReview: jhaPending,
        sifPendingReview: sifPending,
        sifHigh,
      },
      modules: {
        jhaFlha: `/pm/jha-flha?projectId=${projectId}`,
        sifHeca: `/pm/sif-heca?projectId=${projectId}`,
        hazardControl: `/pm/unified-hazard-control?projectId=${projectId}`,
        safetyHub: `/pm/safety-hub?projectId=${projectId}`,
      },
    };
  }

  async getAlerts(projectId: number, companyId?: number) {
    const [jhaPending, sifEvents, incidents] = await Promise.all([
      this.prisma.jhaFlha.findMany({
        where: {
          projectId,
          deletedAt: null,
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
          sifPotential: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          kind: true,
          taskDescription: true,
          status: true,
          sifPotential: true,
          updatedAt: true,
        },
      }),
      this.prisma.sifHecaEvent.findMany({
        where: {
          projectId,
          deletedAt: null,
          status: { in: ['review_required', 'scored', 'ingested'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.incident.findMany({
        where: {
          status: { not: 'CLOSED' },
          ...(companyId ? { companyId } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, severity: true, createdAt: true },
      }),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      jhaSifAlerts: jhaPending.map((r) => ({
        type: 'jha_sif_potential',
        id: r.id,
        title: r.taskDescription,
        kind: r.kind,
        status: r.status,
        href: `/pm/jha-flha/${r.id}?projectId=${projectId}`,
        createdAt: r.updatedAt.toISOString(),
      })),
      sifReviewAlerts: sifEvents.map((e) => ({
        type: 'sif_review',
        id: e.id,
        title: e.title,
        status: e.status,
        href: `/pm/sif-heca/${e.id}`,
        createdAt: e.createdAt.toISOString(),
      })),
      incidentAlerts: incidents.map((i) => ({
        type: 'incident',
        id: String(i.id),
        title: i.title,
        severity: i.severity,
        href: `/pm/incidents/${i.id}`,
        createdAt: i.createdAt.toISOString(),
      })),
    };
  }

  async getReadiness(projectId: number) {
    const [jhaAnalytics, sifAnalytics, blockedJha] = await Promise.all([
      this.jha.getProjectAnalytics(projectId).catch(() => null),
      this.sifHeca.projectAnalytics(projectId).catch(() => null),
      this.prisma.jhaFlha.count({
        where: { projectId, deletedAt: null, status: 'REJECTED' },
      }),
    ]);

    const jhaScores = (
      jhaAnalytics as { scores?: { jhaQualityScore?: number | null } }
    )?.scores;
    const avgQuality = jhaScores?.jhaQualityScore ?? 100;
    const projectSif =
      (sifAnalytics as { projectSifScore?: number })?.projectSifScore ?? 0;
    const sifHigh =
      (sifAnalytics as { sifHighCount?: number })?.sifHighCount ?? 0;

    const readinessScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          avgQuality * 0.5 +
            (100 - projectSif) * 0.3 +
            (sifHigh === 0 ? 20 : 0),
        ),
      ),
    );

    return {
      projectId,
      readinessScore,
      level:
        sifHigh > 0 || blockedJha > 0
          ? 'AT_RISK'
          : readinessScore >= 80
          ? 'READY'
          : 'NEEDS_ATTENTION',
      averageQualityScore: avgQuality,
      projectSifScore: projectSif,
      sifHighCount: sifHigh,
      blockedJhaCount: blockedJha,
    };
  }

  energyWheel() {
    return {
      jha: this.jhaLibrary.energyWheel(),
      sif: this.sifHeca.getEnergyWheel?.() ?? [],
    };
  }

  async getLibraries(companyId: number, projectId?: number) {
    const [hazards, controls, sifLibraries] = await Promise.all([
      this.jhaLibrary.listHazards(companyId, projectId),
      this.jhaLibrary.listControls(companyId, projectId),
      Promise.all([
        this.sifHeca.listIndicators(companyId, projectId).catch(() => []),
        this.sifHeca.listHecaCategories(companyId, projectId).catch(() => []),
      ]),
    ]);

    const [sifIndicators, hecaCategories] = sifLibraries;

    return {
      hazards,
      controls,
      sifIndicators,
      hecaCategories,
      energyWheel: this.jhaLibrary.energyWheel(),
    };
  }
}
