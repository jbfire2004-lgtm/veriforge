import { env } from '../config/env';
import type { ChecklistItem, InspectionFindingInput, ScoreComponent, ScoreResult } from '../types';

function clamp(score: number, max = 100): number {
  return Math.max(0, Math.min(max, Math.round(score)));
}

export class ScoringEngine {
  compute(
    checklistItems: ChecklistItem[],
    findings: InspectionFindingInput[],
    passThreshold?: number,
  ): ScoreResult {
    const threshold = passThreshold ?? env.defaultPassThreshold;
    const components: ScoreComponent[] = [];
    const findingByKey = new Map(findings.map((f) => [f.itemKey, f]));

    let earned = 0;
    let maxScore = 0;

    for (const item of checklistItems) {
      const weight = item.weight ?? 1;
      const finding = findingByKey.get(item.key);
      const findingType = finding?.findingType ?? 'na';

      if (findingType === 'na') {
        continue;
      }

      maxScore += weight * 100;

      let points = 0;
      if (findingType === 'pass') {
        points = weight * 100;
      } else if (findingType === 'observation') {
        points = weight * 70;
      } else if (findingType === 'fail') {
        points = 0;
      }

      earned += points;
      components.push({
        key: item.key,
        weight,
        value: points,
        points,
      });
    }

    const score = maxScore > 0 ? clamp((earned / maxScore) * 100) : 0;
    const passed = score >= threshold;

    return {
      score,
      maxScore: 100,
      passThreshold: threshold,
      passed,
      components,
    };
  }

  countCriticalFailures(
    checklistItems: ChecklistItem[],
    findings: InspectionFindingInput[],
  ): number {
    const criticalKeys = new Set(
      checklistItems.filter((item) => item.critical).map((item) => item.key),
    );
    return findings.filter(
      (f) => criticalKeys.has(f.itemKey) && f.findingType === 'fail',
    ).length;
  }
}

export const scoringEngine = new ScoringEngine();
