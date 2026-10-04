import { Injectable } from '@nestjs/common';
import { CailStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SafetyIntelligenceAiService } from '../ai/safety-intelligence-ai.service';

export type PredictiveRiskReport = {
  projectId: number;
  predictedLevel: string;
  score: number;
  precursors: string[];
  interventions: Array<{ type: string; message: string; urgency?: string }>;
  companyHotspots: Array<{
    companyId: number;
    count: number;
    topCategory: string | null;
  }>;
  engine: string;
  computedAt: string;
};

@Injectable()
export class PredictiveRiskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: SafetyIntelligenceAiService,
  ) {}

  async latestSnapshot(
    projectId: number,
  ): Promise<PredictiveRiskReport | null> {
    const row = await this.prisma.projectSafetyRiskSnapshot.findFirst({
      where: { projectId },
      orderBy: { computedAt: 'desc' },
    });
    if (!row) return null;
    return this.toReport(row);
  }

  async computeAndStore(projectId: number): Promise<PredictiveRiskReport> {
    const report = await this.compute(projectId);
    await this.prisma.projectSafetyRiskSnapshot.create({
      data: {
        projectId,
        predictedLevel: report.predictedLevel,
        score: report.score,
        precursors: report.precursors as Prisma.InputJsonValue,
        interventions: report.interventions as Prisma.InputJsonValue,
        companyHotspots: report.companyHotspots as Prisma.InputJsonValue,
        engine: report.engine,
      },
    });
    return report;
  }

  async compute(projectId: number): Promise<PredictiveRiskReport> {
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - 90);

    const [
      openCail,
      overdueCail,
      atRiskBbo,
      inspectionAtRisk,
      incidents,
      byCompany,
    ] = await Promise.all([
      this.prisma.cailEntry.count({
        where: {
          projectId,
          status: {
            in: [CailStatus.open, CailStatus.in_progress, CailStatus.overdue],
          },
        },
      }),
      this.prisma.cailEntry.count({
        where: { projectId, status: CailStatus.overdue },
      }),
      this.prisma.bboObservation.count({
        where: {
          projectId,
          polarity: 'at_risk',
          observedAt: { gte: windowStart },
        },
      }),
      this.prisma.safetyInspectionItem.count({
        where: {
          polarity: 'at_risk',
          inspection: { projectId, startedAt: { gte: windowStart } },
        },
      }),
      this.prisma.vsiIncidentInvestigation.count({
        where: { projectId, createdAt: { gte: windowStart } },
      }),
      this.prisma.cailEntry.groupBy({
        by: ['ownerCompanyId', 'riskCategory'],
        where: { projectId, createdAt: { gte: windowStart } },
        _count: true,
      }),
    ]);

    const companyMap = new Map<
      number,
      { count: number; categories: Record<string, number> }
    >();
    for (const row of byCompany) {
      const bucket = companyMap.get(row.ownerCompanyId) ?? {
        count: 0,
        categories: {},
      };
      bucket.count += row._count;
      const cat = row.riskCategory ?? 'other';
      bucket.categories[cat] = (bucket.categories[cat] ?? 0) + row._count;
      companyMap.set(row.ownerCompanyId, bucket);
    }

    const companyHotspots = [...companyMap.entries()]
      .map(([companyId, data]) => {
        const topCategory =
          Object.entries(data.categories).sort((a, b) => b[1] - a[1])[0]?.[0] ??
          null;
        return { companyId, count: data.count, topCategory };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const analysis = await this.ai.buildPredictiveRisk({
      projectId,
      openCailCount: openCail,
      overdueCailCount: overdueCail,
      atRiskBboCount: atRiskBbo,
      inspectionAtRiskCount: inspectionAtRisk,
      incidentCount: incidents,
      companyHotspots,
    });

    return {
      projectId,
      predictedLevel: analysis.predictedLevel,
      score: analysis.score,
      precursors: analysis.precursors,
      interventions: analysis.interventions,
      companyHotspots,
      engine: analysis.engine,
      computedAt: new Date().toISOString(),
    };
  }

  private toReport(row: {
    projectId: number;
    predictedLevel: string;
    score: number;
    precursors: unknown;
    interventions: unknown;
    companyHotspots: unknown;
    engine: string;
    computedAt: Date;
  }): PredictiveRiskReport {
    return {
      projectId: row.projectId,
      predictedLevel: row.predictedLevel,
      score: row.score,
      precursors: (row.precursors as string[]) ?? [],
      interventions:
        (row.interventions as PredictiveRiskReport['interventions']) ?? [],
      companyHotspots:
        (row.companyHotspots as PredictiveRiskReport['companyHotspots']) ?? [],
      engine: row.engine,
      computedAt: row.computedAt.toISOString(),
    };
  }
}
