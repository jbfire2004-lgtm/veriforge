import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type StationCailInsight = {
  type: string;
  score: number;
  confidence: number;
  title: string;
  explanation: string;
  evidence: string[];
  suggestedActions: string[];
  entityType?: string;
  entityId?: string;
};

@Injectable()
export class PmSafetyStationsCailIntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

  workerRiskScore(input: {
    denialCount7d: number;
    openCapa: number;
    missingTraining: number;
    chronicDenials: boolean;
  }): number {
    let score = 0;
    score += Math.min(40, input.denialCount7d * 8);
    score += Math.min(30, input.openCapa * 10);
    score += Math.min(20, input.missingTraining * 5);
    if (input.chronicDenials) score += 15;
    return Math.min(100, score);
  }

  equipmentRiskScore(input: {
    lotoActive: boolean;
    failedInspection: boolean;
    openFailure: boolean;
  }): number {
    if (input.lotoActive) return 95;
    if (input.openFailure) return 85;
    if (input.failedInspection) return 70;
    return 15;
  }

  zoneRiskScore(zoneType: string, highRisk: boolean): number {
    if (zoneType === 'sif_high_energy') return 92;
    if (highRisk) return 78;
    if (zoneType === 'confined_space' || zoneType === 'hot_work') return 68;
    return 22;
  }

  predictAccessDenial(checks: Record<string, boolean>): {
    likelyDenied: boolean;
    probability: number;
    topFactors: string[];
  } {
    const failed = Object.entries(checks).filter(([, v]) => !v);
    const probability = Math.min(0.98, failed.length * 0.22);
    return {
      likelyDenied: failed.length > 0,
      probability,
      topFactors: failed.map(([k]) => k).slice(0, 5),
    };
  }

  async projectInsights(projectId: number): Promise<StationCailInsight[]> {
    const since = new Date(Date.now() - 7 * 86400000);
    const insights: StationCailInsight[] = [];

    const denials = await this.prisma.pmSafetyStationAccessLog.count({
      where: { projectId, granted: false, createdAt: { gte: since } },
    });
    const total = await this.prisma.pmSafetyStationAccessLog.count({
      where: { projectId, createdAt: { gte: since } },
    });

    if (total > 10 && denials / total > 0.2) {
      insights.push({
        type: 'access_denial_trend',
        score: Math.round((denials / total) * 100),
        confidence: 0.86,
        title: 'Elevated station access denials',
        explanation:
          'Station access denials exceed 20% — review training, JHA coverage, and zone rules.',
        evidence: [`denials=${denials}`, `attempts=${total}`],
        suggestedActions: [
          'Review zone JHA requirements',
          'Supervisor briefing',
        ],
      });
    }

    const offlineStations = await this.prisma.safetyStation.count({
      where: {
        projectId,
        active: true,
        OR: [
          { status: 'offline' },
          { lastPing: { lt: new Date(Date.now() - 5 * 60 * 1000) } },
        ],
      },
    });

    if (offlineStations > 0) {
      insights.push({
        type: 'station_uptime',
        score: Math.min(100, offlineStations * 25),
        confidence: 0.9,
        title: `${offlineStations} station(s) offline or stale`,
        explanation:
          'Hardware connectivity gaps may block field access validation.',
        evidence: [`offline=${offlineStations}`],
        suggestedActions: ['Check heartbeat', 'Field IT support'],
      });
    }

    const chronic = await this.prisma.pmSafetyStationAccessLog.groupBy({
      by: ['workerId'],
      where: { projectId, granted: false, createdAt: { gte: since } },
      _count: { id: true },
      having: { id: { _count: { gte: 4 } } },
    });

    if (chronic.length > 0) {
      insights.push({
        type: 'chronic_non_compliance',
        score: 60,
        confidence: 0.84,
        title: `${chronic.length} worker(s) with repeat station denials`,
        explanation: 'Cross-correlate with CAPA, inspections, and incidents.',
        evidence: [`workers=${chronic.length}`],
        suggestedActions: ['CAPA review', 'Coaching'],
      });
    }

    return insights.sort((a, b) => b.score - a.score);
  }

  async musterAnomalyDetection(
    projectId: number,
  ): Promise<StationCailInsight | null> {
    const activeMuster = await this.prisma.musterEvent.findFirst({
      where: { projectId, status: { in: ['activated', 'accounting'] } },
      include: { checkins: true },
    });
    if (!activeMuster) return null;

    const missing = Array.isArray(activeMuster.missingWorkerIds)
      ? (activeMuster.missingWorkerIds as number[]).length
      : 0;
    const expected = Array.isArray(activeMuster.expectedWorkerIds)
      ? (activeMuster.expectedWorkerIds as number[]).length
      : 0;
    const checkedIn = activeMuster.checkins.length;

    if (expected > 0 && missing / expected > 0.15) {
      return {
        type: 'muster_anomaly',
        score: Math.min(100, Math.round((missing / expected) * 100)),
        confidence: 0.88,
        title: `${missing} workers missing at muster`,
        explanation:
          'Muster compliance below threshold — verify station check-ins and roster.',
        evidence: [
          `missing=${missing}`,
          `expected=${expected}`,
          `checkedIn=${checkedIn}`,
        ],
        suggestedActions: ['Supervisor roll call', 'Station muster sweep'],
      };
    }
    return null;
  }

  async stationRiskBundle(projectId: number, workerId?: number) {
    const since = new Date(Date.now() - 7 * 86400000);
    let denialCount7d = 0;
    let openCapa = 0;
    if (workerId) {
      denialCount7d = await this.prisma.pmSafetyStationAccessLog.count({
        where: {
          projectId,
          workerId,
          granted: false,
          createdAt: { gte: since },
        },
      });
      openCapa = await this.prisma.pmCorrectiveAction.count({
        where: {
          projectId,
          workerId,
          status: { in: ['open', 'assigned', 'in_progress'] },
        },
      });
    }

    const rule = await this.prisma.siteAccessRule.findFirst({
      where: { projectId, highRisk: true },
    });

    return {
      workerRiskScore: this.workerRiskScore({
        denialCount7d,
        openCapa,
        missingTraining: 0,
        chronicDenials: denialCount7d >= 4,
      }),
      zoneRiskScore: this.zoneRiskScore(
        rule?.zoneType ?? 'general_work',
        rule?.highRisk ?? false,
      ),
      predictiveAccessDenial: denialCount7d > 0 ? 0.65 : 0.15,
    };
  }

  weakControlDetection(
    jhaControlCount: number,
    inspectionDeficiencies: number,
  ): StationCailInsight | null {
    if (jhaControlCount < 2 && inspectionDeficiencies > 2) {
      return {
        type: 'weak_controls',
        score: 72,
        confidence: 0.8,
        title: 'Weak JHA controls with inspection deficiencies',
        explanation:
          'JHA may lack adequate controls while inspections show repeat gaps.',
        evidence: [
          `jhaControls=${jhaControlCount}`,
          `deficiencies=${inspectionDeficiencies}`,
        ],
        suggestedActions: ['JHA revision', 'Field inspection'],
      };
    }
    return null;
  }
}
