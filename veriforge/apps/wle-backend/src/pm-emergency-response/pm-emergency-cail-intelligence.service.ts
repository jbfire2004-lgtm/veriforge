import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type EmergencyCailInsight = {
  type: string;
  score: number;
  confidence: number;
  title: string;
  explanation: string;
  evidence: string[];
  suggestedActions: string[];
};

@Injectable()
export class PmEmergencyCailIntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

  async projectInsights(projectId: number): Promise<EmergencyCailInsight[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { site: true },
    });
    if (!project?.siteId) return [];

    const insights: EmergencyCailInsight[] = [];
    const activeMuster = await this.prisma.musterEvent.findFirst({
      where: {
        projectId,
        status: { in: ['activated', 'accounting'] },
      },
    });

    if (activeMuster) {
      const missing = Array.isArray(activeMuster.missingWorkerIds)
        ? (activeMuster.missingWorkerIds as number[])
        : [];
      if (missing.length > 0) {
        insights.push({
          type: 'missing_workers',
          score: Math.min(100, missing.length * 25),
          confidence: 0.92,
          title: `${missing.length} workers not mustered`,
          explanation:
            'Workers on site roster without muster check-in require search workflow escalation.',
          evidence: [`missing_ids=${missing.join(',')}`],
          suggestedActions: ['Escalate notifications', 'Supervisor sweep'],
        });
      }
    }

    const lowReadiness = await this.prisma.pmEmergencyEquipment.count({
      where: {
        companyId: project.companyId,
        active: true,
        readinessScore: { lt: 70 },
      },
    });
    if (lowReadiness > 0) {
      insights.push({
        type: 'emergency_equipment_readiness',
        score: Math.min(100, lowReadiness * 20),
        confidence: 0.85,
        title: `${lowReadiness} emergency equipment items below readiness threshold`,
        explanation:
          'Spill kits, AEDs, or extinguishers may not be deployable.',
        evidence: [`low_readiness_count=${lowReadiness}`],
        suggestedActions: ['Inspect equipment', 'Auto-CAPA'],
      });
    }

    const unackedPlans = await this.prisma.emergencyPlan.count({
      where: {
        companyId: project.companyId,
        status: 'published',
        requiresAckForAccess: true,
        deletedAt: null,
      },
    });
    if (unackedPlans > 0) {
      insights.push({
        type: 'plan_ack_gap',
        score: 40,
        confidence: 0.8,
        title: 'Access-gated emergency plans require acknowledgment',
        explanation:
          'Workers without plan acknowledgment may be denied site access.',
        evidence: [`published_access_gated=${unackedPlans}`],
        suggestedActions: ['Run acknowledgment campaign'],
      });
    }

    return insights.sort((a, b) => b.score - a.score);
  }

  musterComplianceScore(checkedIn: number, expected: number): number {
    if (expected <= 0) return 100;
    return Math.round((checkedIn / expected) * 100);
  }

  responseQualityScore(input: {
    declareToMusterMinutes?: number;
    missingWorkerCount: number;
    equipmentReadinessAvg: number;
  }): number {
    let score = 100;
    if (
      input.declareToMusterMinutes != null &&
      input.declareToMusterMinutes > 15
    ) {
      score -= 20;
    }
    score -= Math.min(40, input.missingWorkerCount * 10);
    if (input.equipmentReadinessAvg < 80) score -= 15;
    return Math.max(0, score);
  }

  async predictEmergencyRisk(emergencyEventId: string) {
    const event = await this.prisma.pmEmergencyEvent.findUnique({
      where: { id: emergencyEventId },
      include: {
        musterSessions: { include: { checkins: true } },
      },
    });
    if (!event) return { emergencyEventId, score: 0 };

    const muster = event.musterSessions[0];
    const expected =
      muster && Array.isArray(muster.expectedWorkerIds)
        ? (muster.expectedWorkerIds as number[]).length
        : 0;
    const checked = muster?.checkins.length ?? 0;
    const missing =
      muster && Array.isArray(muster.missingWorkerIds)
        ? (muster.missingWorkerIds as number[]).length
        : 0;

    const musterCompliance = this.musterComplianceScore(checked, expected);
    const responseQuality = this.responseQualityScore({
      declareToMusterMinutes:
        muster && event.declaredAt
          ? Math.round(
              (muster.triggeredAt.getTime() - event.declaredAt.getTime()) /
                60000,
            )
          : undefined,
      missingWorkerCount: missing,
      equipmentReadinessAvg: 100,
    });

    const predictiveLikelihood = Math.min(
      100,
      (event.eventType === 'evacuation' ? 30 : 15) +
        missing * 12 +
        (100 - musterCompliance) * 0.5,
    );

    return {
      emergencyEventId,
      predictiveEmergencyLikelihood: predictiveLikelihood,
      musterComplianceScore: musterCompliance,
      responseQualityScore: responseQuality,
      missingWorkerDetection: missing > 0,
      missingWorkerIds:
        muster && Array.isArray(muster.missingWorkerIds)
          ? muster.missingWorkerIds
          : [],
      hazardCorrelation: this.correlateEmergency(emergencyEventId),
      explainability: [
        {
          rule: 'predictive_likelihood',
          detail: 'event severity + missing workers + muster gap',
        },
      ],
    };
  }

  async predictProjectEmergencyLikelihood(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) return { projectId, likelihood: 0 };

    const [lowEquipment, unackedPlans, recentIncidents] = await Promise.all([
      this.prisma.pmEmergencyEquipment.count({
        where: { companyId: project.companyId, readinessScore: { lt: 60 } },
      }),
      this.prisma.emergencyPlan.count({
        where: {
          companyId: project.companyId,
          status: 'published',
          requiresAckForAccess: true,
        },
      }),
      this.prisma.pmSafetyEvent.count({
        where: {
          projectId,
          createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
          severity: { in: ['high', 'critical'] },
        },
      }),
    ]);

    const likelihood = Math.min(
      100,
      lowEquipment * 8 + unackedPlans * 5 + recentIncidents * 10,
    );

    return {
      projectId,
      predictiveEmergencyLikelihood: likelihood,
      factors: { lowEquipment, unackedPlans, recentIncidents },
    };
  }

  correlateEmergency(eventId: string) {
    return {
      eventId,
      jha: 'Review active JHA/FLHA tasks against emergency hazard',
      inspections: 'Pause non-critical inspections during lockdown',
      incidents: 'Promote to PmSafetyEvent when injury or property damage',
      correctiveActions: 'CAPA for equipment/plan deficiencies',
    };
  }
}
