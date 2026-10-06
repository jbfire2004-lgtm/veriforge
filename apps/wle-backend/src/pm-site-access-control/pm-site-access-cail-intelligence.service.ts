import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AccessCailInsight = {
  type: string;
  score: number;
  confidence: number;
  title: string;
  explanation: string;
  evidence: string[];
  suggestedActions: string[];
};

@Injectable()
export class PmSiteAccessCailIntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

  async projectInsights(projectId: number): Promise<AccessCailInsight[]> {
    const insights: AccessCailInsight[] = [];
    const since = new Date(Date.now() - 7 * 86400000);

    const denials = await this.prisma.pmAccessAttempt.count({
      where: {
        projectId,
        decision: { in: ['denied', 'denied_with_reason'] },
        createdAt: { gte: since },
      },
    });
    const attempts = await this.prisma.pmAccessAttempt.count({
      where: { projectId, createdAt: { gte: since } },
    });

    if (attempts > 0 && denials / attempts > 0.25) {
      insights.push({
        type: 'high_denial_rate',
        score: Math.min(100, Math.round((denials / attempts) * 100)),
        confidence: 0.88,
        title: `High access denial rate (${Math.round(
          (denials / attempts) * 100,
        )}%)`,
        explanation:
          'More than 25% of access attempts denied in the last 7 days — review zone rules and training compliance.',
        evidence: [`denials=${denials}`, `attempts=${attempts}`],
        suggestedActions: ['Review zone rules', 'Training refresh'],
      });
    }

    const chronicWorkers = await this.prisma.pmAccessAttempt.groupBy({
      by: ['workerId'],
      where: {
        projectId,
        workerId: { not: null },
        decision: { in: ['denied', 'denied_with_reason'] },
        createdAt: { gte: since },
      },
      _count: { id: true },
      having: { id: { _count: { gte: 5 } } },
    });

    if (chronicWorkers.length > 0) {
      insights.push({
        type: 'chronic_non_compliance',
        score: 55,
        confidence: 0.82,
        title: `${chronicWorkers.length} worker(s) with repeated denials`,
        explanation:
          'Chronic non-compliance may indicate training gaps or unclear zone requirements.',
        evidence: [`workers=${chronicWorkers.length}`],
        suggestedActions: ['Supervisor review', 'Targeted training'],
      });
    }

    return insights.sort((a, b) => b.score - a.score);
  }

  workerRiskScore(denialCount: number, openCapa: number): number {
    return Math.min(100, denialCount * 12 + openCapa * 15);
  }

  zoneRiskScore(rule: { highRisk: boolean; zoneType: string }): number {
    if (rule.zoneType === 'sif_high_energy') return 90;
    if (rule.highRisk) return 75;
    if (rule.zoneType === 'confined_space' || rule.zoneType === 'hot_work')
      return 65;
    return 25;
  }

  async predictAccessDenial(workerId: number, projectId: number) {
    const since = new Date(Date.now() - 30 * 86400000);
    const [denials, attempts, openCapa] = await Promise.all([
      this.prisma.pmAccessAttempt.count({
        where: {
          workerId,
          projectId,
          decision: { in: ['denied', 'denied_with_reason'] },
          createdAt: { gte: since },
        },
      }),
      this.prisma.pmAccessAttempt.count({
        where: { workerId, projectId, createdAt: { gte: since } },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: {
          projectId,
          workerId,
          status: { in: ['open', 'assigned', 'in_progress'] },
        },
      }),
    ]);

    const denialRate = attempts > 0 ? denials / attempts : 0;
    const workerRiskScore = this.workerRiskScore(denials, openCapa);
    const predictiveDenialLikelihood = Math.min(
      100,
      Math.round(denialRate * 70 + workerRiskScore * 0.3),
    );

    return {
      predictiveDenialLikelihood,
      workerRiskScore,
      denialRate30d: denialRate,
      attempts30d: attempts,
      denials30d: denials,
      openCapa,
      chronicNonCompliance: denials >= 5,
    };
  }

  async predictEquipmentRisk(equipmentId: number, projectId?: number) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        pmFailures: {
          where: {
            status: {
              in: [
                'reported',
                'supervisor_review',
                'owner_review',
                'locked_out',
                'capa_open',
              ],
            },
          },
          take: 5,
        },
      },
    });
    if (!equipment) return null;

    const blocked =
      equipment.operationalStatus === 'out_of_service' ||
      equipment.operationalStatus === 'locked_out' ||
      equipment.lockoutStatus === 'LOCKED_OUT';
    const openFailures = equipment.pmFailures.length;
    const score = Math.min(100, (blocked ? 60 : 0) + openFailures * 15 + 20);

    return {
      equipmentId,
      projectId,
      equipmentRiskScore: score,
      accessBlocked: blocked,
      openFailures,
      predictiveDenialLikelihood: blocked ? 95 : Math.min(85, score),
    };
  }

  async predictZoneRisk(projectId: number, zoneCode: string) {
    const rule = await this.prisma.siteAccessRule.findUnique({
      where: { projectId_zoneCode: { projectId, zoneCode } },
    });
    if (!rule) {
      return { zoneCode, zoneRiskScore: 25, predictiveDenialLikelihood: 10 };
    }

    const since = new Date(Date.now() - 30 * 86400000);
    const [attempts, denials] = await Promise.all([
      this.prisma.pmAccessAttempt.count({
        where: { projectId, zoneCode, createdAt: { gte: since } },
      }),
      this.prisma.pmAccessAttempt.count({
        where: {
          projectId,
          zoneCode,
          decision: { in: ['denied', 'denied_with_reason'] },
          createdAt: { gte: since },
        },
      }),
    ]);

    const base = this.zoneRiskScore(rule);
    const denialRate = attempts > 0 ? denials / attempts : 0;
    const zoneRiskScore = Math.min(
      100,
      Math.round(base * 0.6 + denialRate * 40),
    );
    const predictiveDenialLikelihood = Math.min(
      100,
      Math.round(zoneRiskScore * 0.7 + denialRate * 30),
    );

    return {
      zoneCode,
      zoneType: rule.zoneType,
      zoneRiskScore,
      predictiveDenialLikelihood,
      denialRate30d: denialRate,
      highRisk: rule.highRisk,
    };
  }
}
