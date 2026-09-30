import { RiskLevel } from '@prisma/client';
import type { ProjectMetadata, SafetyGateCheckInput, SafetyGateResult } from '../types';

const RISK_ORDER: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export interface GateCheck {
  passed: boolean;
  reason: string;
  gate: string;
}

export class RiskLevelEngine {
  isHigherRisk(current: RiskLevel, proposed: RiskLevel): boolean {
    return RISK_ORDER[proposed] > RISK_ORDER[current];
  }

  requiresEnhancedGating(riskLevel: RiskLevel): boolean {
    return riskLevel === RiskLevel.high || riskLevel === RiskLevel.critical;
  }
}

export class SafetyGateEngine {
  evaluate(
    projectRiskLevel: RiskLevel,
    metadata: ProjectMetadata,
    input: SafetyGateCheckInput,
    upstreamScore?: number,
  ): SafetyGateResult {
    const checks: GateCheck[] = [];

    if (metadata.safetyGateEnabled === false) {
      return {
        passed: true,
        reason: 'Safety gating disabled for project',
        gates: [],
        projectRiskLevel,
      };
    }

    if (projectRiskLevel === RiskLevel.critical) {
      checks.push({
        passed: Boolean(input.hasActiveJha),
        reason: input.hasActiveJha ? 'Active JHA present' : 'Critical project requires active JHA',
        gate: 'jha_required',
      });
    }

    if (riskLevelEngine.requiresEnhancedGating(projectRiskLevel)) {
      checks.push({
        passed: Boolean(input.hasPermits),
        reason: input.hasPermits ? 'Permits verified' : 'High/critical project requires permits',
        gate: 'permits_required',
      });
    }

    const requiredTraining = [
      ...(metadata.requiredTraining ?? []),
      ...(input.requiredTraining ?? []),
    ];
    const completed = new Set(input.completedTraining ?? []);

    for (const courseId of requiredTraining) {
      checks.push({
        passed: completed.has(courseId),
        reason: completed.has(courseId)
          ? `Training ${courseId} complete`
          : `Missing training ${courseId}`,
        gate: 'required_training',
      });
    }

    if (upstreamScore != null && upstreamScore < 60) {
      checks.push({
        passed: false,
        reason: `Project safety score ${upstreamScore} below threshold`,
        gate: 'project_safety_score',
      });
    }

    const failed = checks.filter((c) => !c.passed);

    return {
      passed: failed.length === 0,
      reason:
        failed.length === 0
          ? 'All safety gates passed'
          : failed.map((f) => f.reason).join('; '),
      gates: failed.map((f) => f.gate),
      projectRiskLevel,
    };
  }
}

export const riskLevelEngine = new RiskLevelEngine();
export const safetyGateEngine = new SafetyGateEngine();
