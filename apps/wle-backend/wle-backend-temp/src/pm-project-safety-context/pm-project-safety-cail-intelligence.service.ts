import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type ProjectSafetyCailInsight = {
  type: string;
  score: number;
  confidence: number;
  title: string;
  explanation: string;
  evidence: string[];
  suggestedActions: string[];
};

@Injectable()
export class PmProjectSafetyCailIntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

  hazardRiskScore(
    severity: number,
    likelihood: number,
    sifPotential: boolean,
  ): number {
    const base = severity * 12 + likelihood * 10;
    return Math.min(100, base + (sifPotential ? 25 : 0));
  }

  profileCompletenessScore(profile: {
    requiredJhaTypes: unknown;
    requiredTraining: unknown;
    zoneRulesJson: unknown;
    status: string;
  }): number {
    let score = profile.status === 'published' ? 40 : 0;
    const jha = Array.isArray(profile.requiredJhaTypes)
      ? profile.requiredJhaTypes.length
      : 0;
    const training = Array.isArray(profile.requiredTraining)
      ? profile.requiredTraining.length
      : 0;
    const zones = Array.isArray(profile.zoneRulesJson)
      ? profile.zoneRulesJson.length
      : 0;
    score += Math.min(20, jha * 10);
    score += Math.min(20, training * 5);
    score += Math.min(20, zones * 10);
    return Math.min(100, score);
  }

  async projectInsights(
    projectId: number,
  ): Promise<ProjectSafetyCailInsight[]> {
    const insights: ProjectSafetyCailInsight[] = [];
    const profile = await this.prisma.pmProjectSafetyProfile.findUnique({
      where: { projectId },
    });

    if (!profile || profile.status !== 'published') {
      insights.push({
        type: 'profile_unpublished',
        score: 80,
        confidence: 0.95,
        title: 'Project safety profile not published',
        explanation:
          'Site access, stations, and enforcement gates may use defaults until profile is published.',
        evidence: [`status=${profile?.status ?? 'missing'}`],
        suggestedActions: [
          'Publish safety profile',
          'Auto-generate from project data',
        ],
      });
    }

    const draftHazards = await this.prisma.pmProjectHazard.count({
      where: { projectId, status: 'draft', deletedAt: null },
    });
    if (draftHazards > 5) {
      insights.push({
        type: 'hazard_publish_backlog',
        score: 55,
        confidence: 0.82,
        title: `${draftHazards} hazards awaiting publish`,
        explanation:
          'Unpublished hazards are not enforced in JHA or access validation.',
        evidence: [`draftHazards=${draftHazards}`],
        suggestedActions: ['Review and publish hazard library'],
      });
    }

    const sifHazards = await this.prisma.pmProjectHazard.count({
      where: { projectId, sifPotential: true, active: true, deletedAt: null },
    });
    if (sifHazards > 0) {
      insights.push({
        type: 'sif_hazard_exposure',
        score: Math.min(100, 50 + sifHazards * 8),
        confidence: 0.88,
        title: `${sifHazards} SIF-potential hazard(s) on project`,
        explanation:
          'Correlate with SIF/HECA events, inspections, and zone high-risk rules.',
        evidence: [`sifHazards=${sifHazards}`],
        suggestedActions: ['SIF review', 'Strengthen controls'],
      });
    }

    const since = new Date(Date.now() - 90 * 86400000);
    const incidents = await this.prisma.pmSafetyEvent.count({
      where: { projectId, occurredAt: { gte: since } },
    });
    if (incidents >= 3 && profile?.riskLevel !== 'critical') {
      insights.push({
        type: 'risk_level_underestimated',
        score: 70,
        confidence: 0.75,
        title: 'Incident rate suggests higher risk level',
        explanation: `${incidents} safety events in 90 days — consider elevating profile risk.`,
        evidence: [
          `incidents90d=${incidents}`,
          `riskLevel=${profile?.riskLevel}`,
        ],
        suggestedActions: [
          'Re-run auto-generate profile',
          'Increase inspection cadence',
        ],
      });
    }

    return insights.sort((a, b) => b.score - a.score);
  }

  zoneRiskScore(zone: {
    highRisk?: boolean;
    requiresJha?: boolean;
    requiresFlhaHours?: number;
  }): number {
    let score = 20;
    if (zone.highRisk) score += 35;
    if (zone.requiresJha) score += 25;
    if ((zone.requiresFlhaHours ?? 24) <= 8) score += 15;
    return Math.min(100, score);
  }

  equipmentRiskScore(rule: Record<string, unknown>): number {
    let score = 15;
    if (rule.blockWithoutInspection) score += 30;
    if (rule.blockWithoutCertification) score += 25;
    if (rule.requireLoto) score += 20;
    return Math.min(100, score);
  }

  weakControlDetection(
    controls: Array<{ title: string; controlType: string; status: string }>,
  ): string[] {
    const weak: string[] = [];
    const published = controls.filter((c) => c.status === 'published');
    if (published.length === 0) weak.push('No published controls');
    const adminOnly = published.every(
      (c) => c.controlType === 'administrative',
    );
    if (published.length > 0 && adminOnly)
      weak.push('Only administrative controls — add engineering or PPE');
    if (published.length < 2) weak.push('Control library depth is low');
    return weak;
  }

  suggestControlsForHazard(hazard: {
    category: string;
    sifPotential: boolean;
    severity: number;
  }): string[] {
    const suggestions: string[] = [];
    if (hazard.sifPotential) {
      suggestions.push('Engineering control + administrative permit');
      suggestions.push('Dedicated SIF review and zone restriction');
    }
    if (hazard.category === 'energy' || hazard.category === 'equipment') {
      suggestions.push('LOTO procedure and equipment inspection cadence');
    }
    if (hazard.severity >= 4) {
      suggestions.push('Increase PPE tier and supervisor sign-off');
    }
    if (suggestions.length === 0) {
      suggestions.push('Standard administrative control + training refresh');
    }
    return suggestions;
  }

  async generateProjectSafetyScore(projectId: number): Promise<{
    score: number;
    maxScore: number;
    band: string;
    components: Array<{ key: string; deduction: number; value: unknown }>;
    predictedRisk: number;
    weakControls: string[];
    zoneScores: Array<{ zoneCode: string; score: number }>;
    equipmentScore: number;
    workerExposureScore: number;
    computedAt: string;
  }> {
    const since = new Date(Date.now() - 90 * 86400000);
    const profile = await this.prisma.pmProjectSafetyProfile.findUnique({
      where: { projectId },
    });
    const [
      hazards,
      controls,
      openCapa,
      overdueCapa,
      incidents,
      sifHazards,
      zoneRules,
    ] = await Promise.all([
      this.prisma.pmProjectHazard.findMany({
        where: {
          projectId,
          status: 'published',
          deletedAt: null,
          active: true,
        },
      }),
      this.prisma.pmProjectControl.findMany({
        where: { projectId, deletedAt: null, active: true },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: { projectId, status: { in: ['open', 'in_progress'] } },
      }),
      this.prisma.pmCorrectiveAction.count({
        where: {
          projectId,
          status: { in: ['open', 'in_progress'] },
          dueAt: { lt: new Date() },
        },
      }),
      this.prisma.pmSafetyEvent.count({
        where: { projectId, occurredAt: { gte: since } },
      }),
      this.prisma.pmProjectHazard.count({
        where: { projectId, sifPotential: true, active: true, deletedAt: null },
      }),
      this.prisma.siteAccessRule.findMany({
        where: { projectId, active: true },
      }),
    ]);

    let score = 100;
    const components: Array<{
      key: string;
      deduction: number;
      value: unknown;
    }> = [];

    const completeness = profile
      ? this.profileCompletenessScore({
          requiredJhaTypes: profile.requiredJhaTypes,
          requiredTraining: profile.requiredTraining,
          zoneRulesJson: profile.zoneRulesJson,
          status: profile.status,
        })
      : 0;
    const completenessDeduction = Math.max(0, 30 - completeness * 0.3);
    score -= completenessDeduction;
    components.push({
      key: 'profile_completeness',
      deduction: completenessDeduction,
      value: completeness,
    });

    const capaDed = Math.min(25, overdueCapa * 8 + openCapa * 2);
    score -= capaDed;
    components.push({
      key: 'capa',
      deduction: capaDed,
      value: { openCapa, overdueCapa },
    });

    const incidentDed = Math.min(20, incidents * 5);
    score -= incidentDed;
    components.push({
      key: 'incidents_90d',
      deduction: incidentDed,
      value: incidents,
    });

    const sifDed = Math.min(15, sifHazards * 5);
    score -= sifDed;
    components.push({
      key: 'sif_hazards',
      deduction: sifDed,
      value: sifHazards,
    });

    const hazardRiskAvg =
      hazards.length > 0
        ? hazards.reduce(
            (s, h) =>
              s +
              this.hazardRiskScore(h.severity, h.likelihood, h.sifPotential),
            0,
          ) / hazards.length
        : 0;
    const hazardDed = Math.min(20, hazardRiskAvg * 0.15);
    score -= hazardDed;
    components.push({
      key: 'hazard_exposure',
      deduction: hazardDed,
      value: hazardRiskAvg,
    });

    const weakControls = this.weakControlDetection(controls);
    if (weakControls.length > 0) {
      const weakDed = Math.min(10, weakControls.length * 3);
      score -= weakDed;
      components.push({
        key: 'weak_controls',
        deduction: weakDed,
        value: weakControls,
      });
    }

    const zoneScores = zoneRules.map((z) => ({
      zoneCode: z.zoneCode,
      score: this.zoneRiskScore({
        highRisk: z.highRisk,
        requiresJha: z.requiresJha,
        requiresFlhaHours: z.requiresFlhaHours,
      }),
    }));

    const equipmentRules =
      (profile?.equipmentRulesJson as Record<string, unknown>) ?? {};
    const equipmentScore = this.equipmentRiskScore(equipmentRules);

    const workerExposureScore = Math.min(
      100,
      Math.round(
        hazardRiskAvg * 0.5 +
          (zoneScores.reduce((a, z) => a + z.score, 0) /
            Math.max(1, zoneScores.length)) *
            0.5,
      ),
    );

    const finalScore = Math.max(0, Math.round(score));
    const band =
      finalScore >= 80
        ? 'low'
        : finalScore >= 60
        ? 'medium'
        : finalScore >= 40
        ? 'high'
        : 'critical';

    const predictedRisk = Math.min(
      100,
      Math.round(
        hazardRiskAvg * 0.35 +
          (100 - finalScore) * 0.35 +
          workerExposureScore * 0.3,
      ),
    );

    return {
      score: finalScore,
      maxScore: 100,
      band,
      components,
      predictedRisk,
      weakControls,
      zoneScores,
      equipmentScore,
      workerExposureScore,
      computedAt: new Date().toISOString(),
    };
  }

  async hazardForecast(
    projectId: number,
  ): Promise<Array<{ title: string; confidence: number; source: string }>> {
    const since = new Date(Date.now() - 180 * 86400000);
    const [defs, failures, existingTitles] = await Promise.all([
      this.prisma.pmInspectionDeficiency.findMany({
        where: { inspection: { projectId }, createdAt: { gte: since } },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pmEquipmentFailure.findMany({
        where: { projectId, createdAt: { gte: since } },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pmProjectHazard.findMany({
        where: { projectId, deletedAt: null },
        select: { title: true },
      }),
    ]);
    const seen = new Set(existingTitles.map((h) => h.title.toLowerCase()));
    const forecasts: Array<{
      title: string;
      confidence: number;
      source: string;
    }> = [];
    for (const d of defs) {
      if (seen.has(d.title.toLowerCase())) continue;
      forecasts.push({
        title: d.title,
        confidence: 0.72,
        source: 'inspection_deficiency',
      });
    }
    for (const f of failures) {
      if (seen.has(f.title.toLowerCase())) continue;
      forecasts.push({
        title: f.title,
        confidence: 0.68,
        source: 'equipment_failure',
      });
    }
    return forecasts.slice(0, 8);
  }
}
