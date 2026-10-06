import { Injectable } from '@nestjs/common';
import { PmInspectionScoringMode } from '@prisma/client';
import type { ChecklistItemDef } from './pm-inspections.constants';
import { InspectionTemplateEngine } from './inspection-template.engine';

export type InspectionScoreResult = {
  scorePercent: number;
  passed: boolean;
  riskScore: number;
  requiresSupervisorReview: boolean;
  failedItemIds: string[];
  explainability: Array<{ rule: string; detail: string }>;
};

@Injectable()
export class InspectionScoringEngine {
  constructor(private readonly templateEngine: InspectionTemplateEngine) {}

  score(
    scoringMode: PmInspectionScoringMode,
    items: ChecklistItemDef[],
    answers: Record<string, unknown>,
    scoringRules: Record<string, unknown> = {},
  ): InspectionScoreResult {
    const visible = this.templateEngine.visibleItems(items, answers);
    const failedItemIds: string[] = [];
    const explainability: Array<{ rule: string; detail: string }> = [];

    let earned = 0;
    let possible = 0;

    for (const item of visible) {
      if (item.type !== 'pass_fail' && item.type !== 'numeric') continue;
      const answer = answers[item.id];
      const failed = this.isFailed(item, answer);
      if (failed) {
        failedItemIds.push(item.id);
        explainability.push({
          rule: 'failed_item',
          detail: `${item.label} did not pass`,
        });
      }
      const weight = item.weight ?? 1;
      possible += weight;
      if (!failed) earned += weight;
    }

    const failThreshold =
      typeof scoringRules.failThresholdPercent === 'number'
        ? scoringRules.failThresholdPercent
        : 100;
    const reviewThreshold =
      typeof scoringRules.reviewThresholdRisk === 'number'
        ? scoringRules.reviewThresholdRisk
        : 50;

    let scorePercent =
      possible > 0 ? Math.round((earned / possible) * 100) : 100;
    if (scoringMode === 'pass_fail') {
      scorePercent = failedItemIds.length === 0 ? 100 : 0;
    }

    const passed = scorePercent >= failThreshold && failedItemIds.length === 0;
    const riskScore = Math.min(
      100,
      failedItemIds.length * 15 + (100 - scorePercent),
    );
    const requiresSupervisorReview =
      !passed ||
      riskScore >= reviewThreshold ||
      failedItemIds.some((id) => {
        const it = items.find((i) => i.id === id);
        return !!it?.energyType;
      });

    if (requiresSupervisorReview) {
      explainability.push({
        rule: 'supervisor_review',
        detail: 'Failed items, high risk, or high-energy finding',
      });
    }

    return {
      scorePercent,
      passed,
      riskScore,
      requiresSupervisorReview,
      failedItemIds,
      explainability,
    };
  }

  private isFailed(item: ChecklistItemDef, answer: unknown): boolean {
    if (item.type === 'pass_fail') {
      if (answer === false || answer === 'fail' || answer === 'no') return true;
      if (Array.isArray(item.failValues) && item.failValues.includes(answer)) {
        return true;
      }
      return answer !== true && answer !== 'pass' && answer !== 'yes';
    }
    if (item.type === 'numeric' && typeof answer === 'number') {
      const min = (item as { min?: number }).min;
      if (min != null && answer < min) return true;
    }
    return false;
  }
}
