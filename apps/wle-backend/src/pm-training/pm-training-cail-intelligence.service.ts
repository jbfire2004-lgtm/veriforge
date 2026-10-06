import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrainingExpiryEngine } from './training-expiry.engine';
import { TrainingMatrixEngine } from './training-matrix.engine';

@Injectable()
export class PmTrainingCailIntelligenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly expiry: TrainingExpiryEngine,
    private readonly matrixEngine: TrainingMatrixEngine,
  ) {}

  async predictWorkerLapse(workerId: number, roleType = 'worker') {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
    });
    if (!worker?.companyId) {
      return { workerId, lapseRisk: 0, recommendations: [] };
    }

    const [matrix, records, snapshots, hazards] = await Promise.all([
      this.prisma.pmCompanyTrainingMatrix.findMany({
        where: {
          companyId: worker.companyId,
          roleType: roleType as never,
          active: true,
          status: 'published',
        },
      }),
      this.prisma.trainingRecord.findMany({
        where: { workerId },
        include: { certification: true },
        orderBy: { issuedAt: 'desc' },
      }),
      this.prisma.pmWorkerSafetyTraining.findMany({ where: { workerId } }),
      this.prisma.pmWorkerHazardExposure.findMany({
        where: { workerId },
        orderBy: { exposedAt: 'desc' },
        take: 10,
      }),
    ]);

    const required = this.matrixEngine.requiredForRole(matrix, roleType);
    const held = records.map(
      (r) => r.certification.code ?? r.certification.name,
    );
    const missing = required.filter(
      (req) =>
        !held.some((h) =>
          h.toUpperCase().includes(req.trainingCode.toUpperCase()),
        ),
    );

    const expiringSoon = records.filter((r) => {
      const days = this.expiry.daysUntilExpiry(r, 365);
      return days >= 0 && days <= 30;
    });

    const expiredSnapshots = snapshots.filter(
      (s) => s.status === 'expired',
    ).length;
    const lapseRisk = Math.min(
      100,
      missing.length * 20 +
        expiringSoon.length * 10 +
        expiredSnapshots * 15 +
        hazards.length * 5,
    );

    const hazardCodes = new Set(
      hazards.map((h) => h.hecaCategoryKey).filter(Boolean),
    );
    const recommendations = required
      .filter((r) => missing.some((m) => m.trainingCode === r.trainingCode))
      .map((r) => ({
        trainingCode: r.trainingCode,
        trainingName: r.trainingName,
        reason:
          hazardCodes.size > 0
            ? `Required for role; hazard exposure on project`
            : 'Required by company training matrix',
        priority: lapseRisk >= 60 ? 'high' : 'medium',
      }));

    const competencyScore = Math.max(0, 100 - lapseRisk);

    return {
      workerId,
      lapseRisk,
      competencyScore,
      missingTraining: missing,
      expiringWithin30Days: expiringSoon.length,
      recommendedTraining: recommendations,
      workerRiskImpact: Math.min(100, lapseRisk + hazards.length * 3),
      explainability: [
        {
          rule: 'lapse_risk',
          detail: `missing*20 + expiring*10 + expired_snapshots*15 + hazards*5`,
        },
      ],
    };
  }

  async projectAnalytics(companyId: number, projectId?: number) {
    const workers = await this.prisma.worker.findMany({
      where: { companyId },
      select: { id: true },
    });
    const workerIds = workers.map((w) => w.id);

    const [matrix, records, snapshots] = await Promise.all([
      this.prisma.pmCompanyTrainingMatrix.findMany({
        where: { companyId, active: true },
      }),
      this.prisma.trainingRecord.findMany({
        where: { workerId: { in: workerIds } },
        include: { certification: true },
      }),
      this.prisma.pmWorkerSafetyTraining.findMany({
        where: { workerId: { in: workerIds } },
      }),
    ]);

    const byRole = this.matrixEngine.groupByRole(matrix);
    const ruleCount = matrix.length;
    const expired = snapshots.filter((s) => s.status === 'expired').length;
    const valid = snapshots.filter((s) => s.status === 'valid').length;
    const total = snapshots.length || records.length;

    const competencyBuckets: Record<string, number> = {
      level_1: 0,
      level_2: 0,
      level_3: 0,
      level_4: 0,
    };
    for (const s of snapshots) {
      const lvl = Math.min(4, Math.max(1, s.competencyLevel));
      competencyBuckets[`level_${lvl}`] += 1;
    }

    const compliancePct =
      ruleCount > 0 && workerIds.length > 0
        ? Math.round(
            (valid /
              Math.max(
                1,
                valid + expired + missingEstimate(workerIds, matrix, records),
              )) *
              100,
          )
        : 100;

    return {
      companyId,
      projectId: projectId ?? null,
      trainingCompliancePct: compliancePct,
      matrixRules: ruleCount,
      matrixByRole: byRole,
      expiryTrends: {
        expired,
        valid,
        expiringSoon: records.filter((r) => {
          const d = this.expiry.daysUntilExpiry(r, 365);
          return d >= 0 && d <= 30;
        }).length,
      },
      competencyDistribution: competencyBuckets,
      roleGaps: Object.entries(byRole).map(([role, courses]) => ({
        role,
        requiredCount: courses.length,
      })),
      leadingIndicator: compliancePct,
      explainability: [
        {
          rule: 'compliance',
          detail: 'valid / (valid + expired + estimated missing)',
        },
      ],
    };
  }
}

function missingEstimate(
  workerIds: number[],
  matrix: Array<{ roleType: string; trainingCode: string }>,
  records: Array<{
    workerId: number;
    certification: { code: string | null; name: string };
  }>,
): number {
  const published = matrix.length;
  if (published === 0) return 0;
  let gap = 0;
  for (const wid of workerIds) {
    const held = records
      .filter((r) => r.workerId === wid)
      .map((r) => (r.certification.code ?? r.certification.name).toUpperCase());
    for (const rule of matrix) {
      if (!held.some((h) => h.includes(rule.trainingCode.toUpperCase())))
        gap += 1;
    }
  }
  return gap;
}
