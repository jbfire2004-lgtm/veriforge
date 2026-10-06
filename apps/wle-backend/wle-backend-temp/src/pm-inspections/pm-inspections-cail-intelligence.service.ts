import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InspectionScoringEngine } from './inspection-scoring.engine';
import { DeficiencyScoringEngine } from './deficiency-scoring.engine';
import type { ChecklistItemDef } from './pm-inspections.constants';

/** Deterministic CAIL intelligence — explainable, no LLM required. */
@Injectable()
export class PmInspectionsCailIntelligenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: InspectionScoringEngine,
    private readonly deficiencyScoring: DeficiencyScoringEngine,
  ) {}

  /** Dry-run scoring before submit — predictive deficiency detection. */
  async predictFromAnswers(
    templateId: string,
    answers: Record<string, unknown>,
  ) {
    const template = await this.prisma.pmInspectionTemplate.findFirst({
      where: { id: templateId, deletedAt: null },
    });
    if (!template) throw new NotFoundException('Template not found');

    const items = template.items as ChecklistItemDef[];
    const scoringRules = template.scoringRules as Record<string, unknown>;
    const score = this.scoring.score(
      template.scoringMode,
      items,
      answers,
      scoringRules,
    );

    const predictedDeficiencies = score.failedItemIds.map((itemId) => {
      const item = items.find((i) => i.id === itemId);
      const severity = item
        ? this.deficiencyScoring.severityForFailedItem(item, template.category)
        : 'medium';
      return {
        itemId,
        label: item?.label ?? itemId,
        severity,
        notes: String(answers[`${itemId}_notes`] ?? ''),
        requiredActions: [
          'Assign corrective owner',
          severity === 'critical'
            ? 'Stop work until verified'
            : 'Close within due date',
        ],
      };
    });

    const weakControlHints = score.failedItemIds
      .filter((id) => {
        const it = items.find((i) => i.id === id);
        return !!it?.energyType;
      })
      .map((id) => `High-energy checklist item failed: ${id}`);

    return {
      inspectionQualityScore: Math.max(0, 100 - score.riskScore),
      riskScore: score.riskScore,
      scorePercent: score.scorePercent,
      passed: score.passed,
      requiresSupervisorReview: score.requiresSupervisorReview,
      predictedDeficiencyCount: predictedDeficiencies.length,
      predictedDeficiencies,
      weakControlDetection: weakControlHints,
      explainability: score.explainability,
    };
  }

  async projectInsights(projectId: number) {
    const [inspections, deficiencies] = await Promise.all([
      this.prisma.pmInspection.findMany({
        where: { projectId, deletedAt: null },
        select: {
          id: true,
          passed: true,
          riskScore: true,
          scorePercent: true,
          template: { select: { category: true } },
        },
        take: 200,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pmInspectionDeficiency.findMany({
        where: {
          inspection: { projectId, deletedAt: null },
          status: { not: 'closed' },
        },
        select: { severity: true, category: true, itemId: true },
      }),
    ]);

    const failed = inspections.filter((i) => i.passed === false).length;
    const avgRisk =
      inspections.length > 0
        ? Math.round(
            inspections.reduce((s, i) => s + (i.riskScore ?? 0), 0) /
              inspections.length,
          )
        : 0;

    const byCategory: Record<string, number> = {};
    for (const d of deficiencies) {
      const cat = d.category ?? 'general';
      byCategory[cat] = (byCategory[cat] ?? 0) + 1;
    }

    const weakPatterns = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({
        category,
        count,
        prediction:
          count >= 3
            ? 'Elevated repeat deficiency — review controls'
            : 'Monitor',
      }));

    return {
      inspectionQualityScore: Math.max(0, 100 - avgRisk - failed * 5),
      averageRiskScore: avgRisk,
      failureRate: inspections.length > 0 ? failed / inspections.length : 0,
      openDeficiencies: deficiencies.length,
      hazardPatterns: weakPatterns,
      explainability: [
        {
          rule: 'quality_score',
          detail: `100 - avgRisk(${avgRisk}) - failed*5(${failed * 5})`,
        },
      ],
    };
  }

  async inspectorPerformance(inspectorUserId: number, projectId: number) {
    const rows = await this.prisma.pmInspection.findMany({
      where: { inspectorUserId, projectId, deletedAt: null },
      select: { passed: true, requiresSupervisorReview: true },
    });
    const total = rows.length;
    const passRate =
      total > 0 ? rows.filter((r) => r.passed).length / total : 1;
    return {
      inspectorUserId,
      inspectionsCompleted: total,
      passRate: Math.round(passRate * 100),
      reviewEscalationRate:
        total > 0
          ? Math.round(
              (rows.filter((r) => r.requiresSupervisorReview).length / total) *
                100,
            )
          : 0,
      score: Math.round(passRate * 80 + (total > 10 ? 20 : total * 2)),
    };
  }
}
